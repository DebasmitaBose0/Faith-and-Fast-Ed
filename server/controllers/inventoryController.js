import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ProductModel from "../models/productModel.js";
import { writeAuditLog } from "../utils/auditLogger.js";

/**
 * Admin Inventory Management
 *
 * Provides an inventory-health overview and bulk stock operations for admins.
 * The "low stock" threshold is configurable per request (?threshold=N), so the
 * same endpoint serves different alerting needs without code changes.
 */

// Default threshold below which a product is considered "low stock" (but not
// yet out of stock). Matches the <= 5 indicator used on the product page.
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const getInventoryOverview = catchAsyncErrors(async (req, res) => {
  const threshold =
    parseInt(req.query.threshold, 10) > 0
      ? parseInt(req.query.threshold, 10)
      : DEFAULT_LOW_STOCK_THRESHOLD;

  // Pull only the fields the inventory view needs — keeps the payload lean.
  const products = await ProductModel.find()
    .select("name category price stock images lastUpdatedBy")
    .populate("lastUpdatedBy", "name email")
    .sort({ stock: 1 }); // lowest stock first — the items needing attention

  // Compute health buckets and totals in a single pass.
  let totalStockUnits = 0;
  let inventoryValue = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let healthyCount = 0;

  const enriched = products.map((p) => {
    const stock = p.stock ?? 0;
    totalStockUnits += stock;
    inventoryValue += stock * (p.price ?? 0);

    let status;
    if (stock === 0) {
      status = "OUT_OF_STOCK";
      outOfStockCount += 1;
    } else if (stock <= threshold) {
      status = "LOW_STOCK";
      lowStockCount += 1;
    } else {
      status = "IN_STOCK";
      healthyCount += 1;
    }

    return {
      _id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock,
      status,
      image: p.images?.[0]?.url || "",
      lastUpdatedBy: p.lastUpdatedBy,
    };
  });

  return res.status(200).json({
    message: "Inventory overview fetched successfully",
    error: false,
    success: true,
    threshold,
    summary: {
      totalProducts: products.length,
      totalStockUnits,
      inventoryValue,
      outOfStockCount,
      lowStockCount,
      healthyCount,
    },
    products: enriched,
  });
});

export const bulkUpdateStock = catchAsyncErrors(async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      message: "updates must be a non-empty array",
      error: true,
      success: false,
    });
  }

  // -------- Phase 1: validate every update before writing anything --------
  // Mirrors the two-phase stock-integrity pattern used in order processing:
  // a single bad entry must not leave a partially-applied batch.
  const validated = [];
  for (const update of updates) {
    const { productId, stock } = update;

    if (!productId) {
      return res.status(400).json({
        message: "Each update must include a productId",
        error: true,
        success: false,
      });
    }

    const numericStock = Number(stock);
    if (!Number.isFinite(numericStock) || numericStock < 0) {
      return res.status(400).json({
        message: `Invalid stock value for product ${productId}. Stock must be a non-negative number.`,
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: `Product with ID ${productId} not found. No changes were applied.`,
        error: true,
        success: false,
      });
    }

    validated.push({ product, stock: numericStock });
  }

  // -------- Phase 2: all valid — apply every update --------
  for (const { product, stock } of validated) {
    const beforeStock = product.stock;
    product.stock = stock;
    product.lastUpdatedBy = req.user.id || req.user._id;
    await product.save({ validateBeforeSave: false });

    await writeAuditLog({
      actorId: req.user.id || req.user._id,
      actionType: "INVENTORY_UPDATE",
      targetType: "Product",
      targetId: product._id,
      beforeSnapshot: { stock: beforeStock },
      afterSnapshot: { stock: stock },
    });
  }

  return res.status(200).json({
    message: `Successfully updated stock for ${validated.length} product(s)`,
    error: false,
    success: true,
    updatedCount: validated.length,
  });
});

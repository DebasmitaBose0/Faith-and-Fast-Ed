import ProductModel from "../models/productModel.js";

export const bulkUpdatePrices = async (req, res) => {
  try {
    const { productIds, percentageChange } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A non-empty list of product IDs is required.",
      });
    }

    const multiplier = 1 + Number(percentageChange) / 100;

    const result = await ProductModel.updateMany(
      { _id: { $in: productIds } },
      [
        {
          $set: {
            price: { $round: [{ $multiply: ["$price", multiplier] }, 2] },
          },
        },
      ]
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated prices for ${result.modifiedCount} products.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Bulk price update failed.",
    });
  }
};

export const bulkToggleAvailability = async (req, res) => {
  try {
    const { productIds, publishStatus } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A non-empty list of product IDs is required.",
      });
    }

    const result = await ProductModel.updateMany(
      { _id: { $in: productIds } },
      { $set: { publish: !!publishStatus } }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated availability status for ${result.modifiedCount} products.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Bulk status toggle failed.",
    });
  }
};

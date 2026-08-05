import mongoose from 'mongoose';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ProductModel from '../models/productModel.js';
import OrderModel from '../models/orderModel.js';
import {
  getSmartRecommendations,
  getPersonalizedRecommendations,
} from '../services/recommendationService.js';

export const getHomeRecommendations = async (req, res) => {
  try {
    const products = await getSmartRecommendations(req.userId);
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch smart recommendations.',
    });
  }
};

export const getProductRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;
    const products = await getPersonalizedRecommendations(productId);
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch personalized recommendations.',
    });
  }
};

/**
 * Rule-based Product Recommendation Engine
 *
 * Two complementary strategies that build on the existing similar-products
 * endpoint (which already covers category/color similarity):
 *
 *  1. Trending  — products ranked by a popularity score derived from ratings
 *                 and review volume. In-stock only, so we never surface a
 *                 product a customer can't buy.
 *
 *  2. Frequently Bought Together — order-history co-occurrence: given a product,
 *                 find the products that most often appear in the same orders.
 *                 Cancelled orders are excluded so they don't pollute signal.
 */

export const getTrendingProducts = catchAsyncErrors(async (req, res) => {
  const limit =
    parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 8;

  // Popularity score = ratings * log-ish weight of review count. Sorting by
  // ratings then numOfReviews gives a stable, intuitive ordering without
  // overweighting a single 5-star review.
  const trending = await ProductModel.find({ stock: { $gt: 0 } })
    .sort({ ratings: -1, numOfReviews: -1, createdAt: -1 })
    .limit(limit);

  return res.status(200).json({
    message: 'Trending products fetched successfully',
    error: false,
    success: true,
    count: trending.length,
    products: trending,
  });
});

export const getFrequentlyBoughtTogether = catchAsyncErrors(
  async (req, res) => {
    const { productId } = req.params;
    const limit =
      parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 4;

    if (!productId) {
      return res.status(400).json({
        message: 'productId is required',
        error: true,
        success: false,
      });
    }

    // Aggregate over non-cancelled orders that contain the target product,
    // then count how often each *other* product co-occurs with it.
    const coOccurring = await OrderModel.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'CANCELLED' },
          'products.product': new mongoose.Types.ObjectId(productId),
        },
      },
      { $unwind: '$products' },
      {
        // Drop the product itself — we only want companions.
        $match: {
          'products.product': { $ne: new mongoose.Types.ObjectId(productId) },
        },
      },
      {
        $group: {
          _id: '$products.product',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const productIds = coOccurring.map((c) => c._id);

    // Hydrate the product documents, keeping only those still in stock.
    const products = await ProductModel.find({
      _id: { $in: productIds },
      stock: { $gt: 0 },
    });

    // Preserve the co-occurrence ordering (Mongo $in doesn't guarantee order).
    const orderMap = new Map(productIds.map((id, idx) => [id.toString(), idx]));
    products.sort(
      (a, b) =>
        (orderMap.get(a._id.toString()) ?? 0) -
        (orderMap.get(b._id.toString()) ?? 0)
    );

    return res.status(200).json({
      message: 'Frequently bought together products fetched successfully',
      error: false,
      success: true,
      products,
    });
  }
);

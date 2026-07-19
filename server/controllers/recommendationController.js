import {
  getSmartRecommendations,
  getPersonalizedRecommendations,
} from "../services/recommendationService.js";

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
      message: error.message || "Failed to fetch smart recommendations.",
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
      message: error.message || "Failed to fetch personalized recommendations.",
    });
  }
};

import ProductModel from "../models/productModel.js";

export const getSmartRecommendations = async (userId) => {
  // If user is authenticated, we could personalize. For now, we fetch high-rated trending items
  // mixed with popular categories.
  const products = await ProductModel.find({ publish: true })
    .sort({ ratings: -1, reviews: -1 })
    .limit(8);

  return products;
};

export const getPersonalizedRecommendations = async (currentProductId) => {
  const currentProduct = await ProductModel.findById(currentProductId);
  if (!currentProduct) return [];

  // Content-based filtering by category & subcategory
  const products = await ProductModel.find({
    _id: { $ne: currentProductId },
    category: currentProduct.category,
    publish: true,
  })
    .sort({ ratings: -1 })
    .limit(4);

  return products;
};

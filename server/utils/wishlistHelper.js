import Product from "../models/productModel.js";

// Check if wishlist item is valid and has stock available
export const checkProductAvailability = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return { available: false, message: "Product no longer exists" };
    }
    if (product.stock <= 0) {
      return { available: false, message: "Product is out of stock", product };
    }
    return { available: true, product };
  } catch (error) {
    return { available: false, message: "Invalid product ID format" };
  }
};

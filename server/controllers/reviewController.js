import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ProductModel from "../models/productModel.js";

// Returns top rated reviews from all products
export const getPopularReviews = catchAsyncErrors(async (req, res) => {
  // Let's find products that have reviews
  const products = await ProductModel.find({ "reviews.0": { $exists: true } })
    .limit(10)
    .select("name images price reviews");

  const popularReviews = [];

  products.forEach((product) => {
    product.reviews.forEach((review) => {
      if (review.rating >= 4) {
        popularReviews.push({
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0]?.url || "",
          price: product.price,
          reviewId: review._id,
          userName: review.name || "Anonymous",
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt || new Date(),
        });
      }
    });
  });

  // Sort by rating desc, then limit to 6 reviews
  const sortedReviews = popularReviews
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return res.status(200).json({
    success: true,
    reviews: sortedReviews,
  });
});

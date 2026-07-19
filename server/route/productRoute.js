import express from "express";
import {
  createProduct,
  deleteProduct,
  deleteProductReview,
  getProduct,
  getProductByFilter,
  getProductDetails,
  getProductReviews,
  getSimilarProducts,
  getTopReviews,
  postProductReview,
  searchProduct,
  updateProductDetails,
} from "../controllers/productController.js";
import {
  getTrendingProducts,
  getFrequentlyBoughtTogether,
} from "../controllers/recommendationController.js";
import admin from "../middleware/Admin.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { cacheMiddleware, invalidateCache } from "../utils/cache.js";

const productRouter = express.Router();

const clearProductsCache = async (req, res, next) => {
  await invalidateCache("products:*");
  next();
};

productRouter.post(
  "/new",
  auth,
  admin,
  clearProductsCache,
  upload.array("images", 10),
  createProduct
);

productRouter.get("/get", cacheMiddleware("products:get", 300), getProduct);

productRouter.get("/get/filter", cacheMiddleware("products:get_filter", 300), getProductByFilter);

productRouter.get("/get/:productId", cacheMiddleware("products:get_details", 300), getProductDetails);

productRouter.put(
  "/update/:_id",
  auth,
  admin,
  clearProductsCache,
  upload.array("images", 10),
  updateProductDetails
);

productRouter.delete("/delete/:deleteId", auth, admin, clearProductsCache, deleteProduct);

productRouter.post("/search", searchProduct);

productRouter.get("/similar", cacheMiddleware("products:similar", 300), getSimilarProducts);

productRouter.get("/trending", cacheMiddleware("products:trending", 300), getTrendingProducts);

productRouter.get("/top-reviews", getTopReviews);

productRouter.get(
  "/frequently-bought-together/:productId",
  cacheMiddleware("products:fbt", 300),
  getFrequentlyBoughtTogether
);

productRouter.get("/reviews/:productId", getProductReviews);

productRouter.post("/review/:productId", auth, clearProductsCache, postProductReview);

productRouter.delete(
  "/review/:productId/:reviewId",
  auth,
  clearProductsCache,
  deleteProductReview
);

export default productRouter;

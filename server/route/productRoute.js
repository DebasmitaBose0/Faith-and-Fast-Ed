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
import { productValidation } from "../middleware/validator.js";

const productRouter = express.Router();

productRouter.post(
  "/new",
  auth,
  admin,
  productValidation.create,
  upload.array("images", 10),
  createProduct
);

productRouter.get("/get", getProduct);

productRouter.get("/get/filter", getProductByFilter);

productRouter.get("/get/:productId", getProductDetails);

productRouter.put(
  "/update/:_id",
  auth,
  admin,
  upload.array("images", 10),
  updateProductDetails
);

productRouter.delete("/delete/:deleteId", auth, admin, deleteProduct);

productRouter.post("/search", searchProduct);

productRouter.get("/similar", getSimilarProducts);

productRouter.get("/trending", getTrendingProducts);

productRouter.get(
  "/frequently-bought-together/:productId",
  getFrequentlyBoughtTogether
);

productRouter.get("/reviews/:productId", getProductReviews);

productRouter.post("/review/:productId", auth, postProductReview);

productRouter.delete(
  "/review/:productId/:reviewId",
  auth,
  deleteProductReview
);

export default productRouter;

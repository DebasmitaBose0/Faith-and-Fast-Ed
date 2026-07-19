import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  AddCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import admin from "../middleware/Admin.js";
import { cacheMiddleware, invalidateCache } from "../utils/cache.js";

const categoryRouter = express.Router();

const clearCategoriesCache = async (req, res, next) => {
  await invalidateCache("categories:*");
  await invalidateCache("products:*");
  next();
};

categoryRouter.post(
  "/create",
  auth,
  admin,
  clearCategoriesCache,
  upload.single("image"),
  AddCategory
);

categoryRouter.get("/get", cacheMiddleware("categories:get", 300), getCategory);

categoryRouter.put("/update", clearCategoriesCache, updateCategory);

categoryRouter.delete("/delete", clearCategoriesCache, deleteCategory);

export default categoryRouter;

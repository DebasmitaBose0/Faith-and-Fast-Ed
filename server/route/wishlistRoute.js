import express from "express";
import auth from "../middleware/auth.js";
import {
  addToWishListItemController,
  deleteWishListItemQtyController,
  getWishListItemController,
  updateWishListItemQtyController,
} from "../controllers/wishlistController.js";

const wishListRouter = express.Router();

wishListRouter.post("/create", auth, addToWishListItemController);

wishListRouter.get("/get", auth, getWishListItemController);

wishListRouter.put("/update", auth, updateWishListItemQtyController);

wishListRouter.delete("/delete", auth, deleteWishListItemQtyController);

export default wishListRouter;

import express from "express";
import auth from "../middleware/auth.js";
import {
  addToWishListItemController,
  getWishListItemController,
  deleteWishListItemController,
} from "../controllers/wishlistController.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/create", auth, addToWishListItemController);
wishlistRouter.get("/get", auth, getWishListItemController);
wishlistRouter.delete("/delete/:id", auth, deleteWishListItemController);

export default wishlistRouter;

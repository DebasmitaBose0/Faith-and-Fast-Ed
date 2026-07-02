import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import wishListProductModel from "../models/wishlistModel.js";
import UserModel from "../models/userModel.js";
import { checkProductAvailability } from "../utils/wishlistHelper.js";

export const addToWishListItemController = catchAsyncErrors(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          message: "Please provide productId",
          error: true,
          success: false,
        });
      }

      // Check product status
      const status = await checkProductAvailability(productId);
      if (!status.available) {
        return res.status(400).json({
          message: status.message,
          error: true,
          success: false,
        });
      }

      const checkItemWishList = await wishListProductModel.findOne({
        userId,
        productId,
      });

      if (checkItemWishList) {
        return res.status(400).json({
          message: "Item already in WishList",
          error: true,
          success: false,
        });
      }

      const newWishListItem = new wishListProductModel({
        productId,
        userId,
      });

      const savedWishListItem = await newWishListItem.save();

      const updateWishListUser = await UserModel.updateOne(
        { _id: userId },
        { $addToSet: { shoppingWishList: savedWishListItem._id } }
      );

      if (updateWishListUser.modifiedCount === 0) {
        return res.status(500).json({
          message: "Failed to update user WishList",
          error: true,
          success: false,
        });
      }

      return res.json({
        data: savedWishListItem,
        message: "Item added to WishList successfully",
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Internal Server Error",
        error: true,
        success: false,
      });
    }
  }
);

export const getWishListItemController = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;

    const WishListItems = await wishListProductModel
      .find({
        userId: userId,
      })
      .populate("productId");

    return res.json({
      data: WishListItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
});

export const deleteWishListItemController = catchAsyncErrors(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params; // Wishlist item ID

      const deleteItem = await wishListProductModel.deleteOne({
        _id: id,
        userId: userId,
      });

      if (deleteItem.deletedCount === 0) {
        return res.status(404).json({
          message: "Item not found in Wishlist",
          error: true,
          success: false,
        });
      }

      // Also pull from User model's shoppingWishList array
      await UserModel.updateOne(
        { _id: userId },
        { $pull: { shoppingWishList: id } }
      );

      return res.json({
        message: "Item removed from WishList successfully",
        error: false,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Internal Server Error",
        error: true,
        success: false,
      });
    }
  }
);

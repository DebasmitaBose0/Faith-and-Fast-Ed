import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import wishListProductModel from "../models/wishlistModel.js";
import UserModel from "../models/userModel.js";
import Product from "../models/productModel.js";

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

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          error: true,
          success: false,
        });
      }
      if (product.stock <= 0) {
        return res.status(400).json({
          message: "Product is currently out of stock and cannot be added to wishlist",
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

    if (WishListItems.length === 0) {
      return res.status(404).json({
        message: "No items found in the WishList",
        error: true,
        success: false,
      });
    }

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

export const updateWishListItemQtyController = catchAsyncErrors(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { _id, qty } = req.body;

      if (!_id || !qty) {
        return res.status(400).json({
          message: "Please provide _id and qty",
          error: true,
          success: false,
        });
      }

      const updatedWishListItem = await wishListProductModel.updateOne(
        {
          _id: _id,
          userId: userId,
        },
        {
          quantity: qty,
        },
        { new: true }
      );

      if (!updatedWishListItem) {
        return res.status(404).json({
          message: "WishList item not found",
          error: true,
          success: false,
        });
      }

      return res.json({
        message: "WishList updated successfully",
        success: true,
        error: false,
        data: updatedWishListItem,
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

export const deleteWishListItemQtyController = catchAsyncErrors(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({
          message: "Please provide _id",
          error: true,
          success: false,
        });
      }

      const deleteResult = await wishListProductModel.deleteOne({
        _id: _id,
        userId: userId,
      });

      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({
          message: "WishList item not found",
          error: true,
          success: false,
        });
      }

      return res.json({
        message: "Item removed from WishList successfully",
        error: false,
        success: true,
        data: deleteResult,
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

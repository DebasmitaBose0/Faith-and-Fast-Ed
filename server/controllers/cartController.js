import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import CartProductModel from '../models/cartModel.js';
import UserModel from '../models/userModel.js';

export const addToCartItemController = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, selectedColor, selectedSize } = req.body;

    if (!productId || !selectedColor || !selectedSize) {
      return res.status(402).json({
        message: 'Please provide productId, selectedColor, and selectedSize',
        error: true,
        success: false,
      });
    }

    const cartItem = new CartProductModel({
      quantity: 1,
      userId: userId,
      productId: productId,
      selectedColor,
      selectedSize,
    });
    const savedCartItem = await cartItem.save();

    const updateCartUser = await UserModel.updateOne(
      { _id: userId },
      {
        $addToSet: {
          shoppingCart: savedCartItem._id,
        },
      }
    );

    if (updateCartUser.modifiedCount === 0) {
      return res.status(500).json({
        message: 'Failed to update user cart',
        error: true,
        success: false,
      });
    }

    return res.json({
      data: savedCartItem,
      message: 'Item added to cart successfully',
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
});

export const getCartItemController = catchAsyncErrors(async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await CartProductModel.find({
      userId: userId,
    }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(404).json({
        message: 'No items found in the cart',
        error: true,
        success: false,
      });
    }

    return res.json({
      data: cartItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Internal Server Error',
      error: true,
      success: false,
    });
  }
});

export const updateCartItemQtyController = catchAsyncErrors(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { _id, qty } = req.body;

      if (!_id || qty === undefined || qty === null || qty === '') {
        return res.status(400).json({
          message: 'Please provide _id and qty',
          error: true,
          success: false,
        });
      }

      // Quantity must be a positive whole number. The previous `!qty` guard
      // rejected 0 but let negative, fractional and over-stock values through,
      // which corrupts cart totals and isn't caught until much later (if at all).
      const quantity = Number(qty);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: 'Quantity must be a positive whole number',
          error: true,
          success: false,
        });
      }

      // Load the cart item (with its product) so the requested quantity can be
      // bounded by the product's available stock before it is written.
      const cartItem = await CartProductModel.findOne({
        _id: _id,
        userId: userId,
      }).populate('productId');

      if (!cartItem) {
        return res.status(404).json({
          message: 'Cart item not found',
          error: true,
          success: false,
        });
      }

      const product = cartItem.productId;
      if (
        product &&
        typeof product.stock === 'number' &&
        quantity > product.stock
      ) {
        return res.status(400).json({
          message: `Only ${product.stock} item(s) left in stock`,
          error: true,
          success: false,
        });
      }

      cartItem.quantity = quantity;
      const updatedCartItem = await cartItem.save();

      return res.json({
        message: 'Cart updated successfully',
        success: true,
        error: false,
        data: updatedCartItem,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || 'Internal Server Error',
        error: true,
        success: false,
      });
    }
  }
);

export const deleteCartItemQtyController = catchAsyncErrors(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({
          message: 'Please provide _id',
          error: true,
          success: false,
        });
      }

      const deleteResult = await CartProductModel.deleteOne({
        _id: _id,
        userId: userId,
      });

      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({
          message: 'Cart item not found',
          error: true,
          success: false,
        });
      }

      return res.json({
        message: 'Item removed from cart successfully',
        error: false,
        success: true,
        data: deleteResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || 'Internal Server Error',
        error: true,
        success: false,
      });
    }
  }
);

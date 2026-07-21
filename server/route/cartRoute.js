import express from 'express';
import auth from '../middleware/auth.js';
import {
  addToCartItemController,
  deleteCartItemQtyController,
  getCartItemController,
  updateCartItemQtyController,
} from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/create', auth, addToCartItemController);

cartRouter.get('/get', auth, getCartItemController);

cartRouter.put('/update', auth, updateCartItemQtyController);

cartRouter.delete('/delete', auth, deleteCartItemQtyController);

export default cartRouter;

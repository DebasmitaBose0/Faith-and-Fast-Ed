import express from 'express';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import {
  addToCartItemController,
  deleteCartItemQtyController,
  getCartItemController,
  updateCartItemQtyController,
} from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/create', optionalAuth, addToCartItemController);

cartRouter.get('/get', optionalAuth, getCartItemController);

cartRouter.put('/update', optionalAuth, updateCartItemQtyController);

cartRouter.delete('/delete', optionalAuth, deleteCartItemQtyController);

export default cartRouter;

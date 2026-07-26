import express from 'express';
import auth from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import {
  createPaymentIntent,
  confirmStripePayment,
} from '../controllers/stripeController.js';

const paymentRouter = express.Router();

// Step 1: create a Stripe PaymentIntent for the current cart (server computes
// the amount). Returns a clientSecret the browser uses to confirm the card.
paymentRouter.post('/create-intent', optionalAuth, createPaymentIntent);

// Step 2: after Stripe.js confirms the card succeeded, create the order. The
// server re-verifies the PaymentIntent status with Stripe before saving.
paymentRouter.post('/confirm', optionalAuth, confirmStripePayment);

export default paymentRouter;

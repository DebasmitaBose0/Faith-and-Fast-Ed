# Payment Modes

Faith-and-Fast supports three payment methods at checkout:

| Method           | `paymentMethod` value | How it works                                                                           | Order created when                                                  |
| ---------------- | --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Cash on Delivery | `COD`                 | Customer pays in cash when the order arrives.                                          | Immediately on placing the order.                                   |
| Manual UPI       | `ONLINE`              | Customer pays to a UPI ID / QR and uploads a payment screenshot. An admin verifies it. | Immediately (status `PENDING`), confirmed after admin verification. |
| Card (Stripe)    | `STRIPE`              | Customer pays by debit/credit card through Stripe.                                     | **Only after** the card payment succeeds.                           |

This document explains the **Stripe** integration added for online card payments — how it works, the environment variables it needs, and how to switch between test (sandbox) and live modes.

## Why Stripe

Stripe Test Mode requires **no KYC** and gives instant sandbox access, which makes it frictionless for contributors and local development. Razorpay was considered but its test mode also requires KYC, so it was not used (per the issue discussion).

## How the Stripe flow works

The order is created **only after the payment has actually succeeded** — this is the core requirement. The flow is two-phase and the server never trusts the client about whether payment happened:

1. **Create PaymentIntent** — `POST /api/payment/create-intent`
   - The browser sends the cart contents (`products`, `discountAmount`).
   - The **server recomputes the amount** from live product prices in the database (the client-supplied amount is never used to charge), creates a Stripe PaymentIntent, and returns only the `clientSecret`.
   - No order is created at this step.

2. **Confirm the card in the browser** — Stripe.js (`stripe.confirmCardPayment`)
   - The card details are entered in Stripe's `CardElement` and submitted directly to Stripe from the browser. Raw card numbers never touch our server.

3. **Confirm & create the order** — `POST /api/payment/confirm`
   - The browser sends the `paymentIntentId` after Stripe reports success.
   - The **server independently re-fetches the PaymentIntent from Stripe** and checks `status === "succeeded"` before creating the order. If the intent is unpaid/failed, no order is created.
   - The order is saved with `paymentMethod: "STRIPE"`, `paymentStatus: "COMPLETED"`, and the Stripe transaction id in `stripePaymentIntentId`. A replay guard prevents two orders from sharing one PaymentIntent.

Admin order views show the payment method and the Stripe transaction id, so card payments are visible in the dashboard alongside COD and UPI orders.

## India-specific Stripe requirements

Stripe accounts based in India must comply with RBI export regulations for card
payments. Stripe enforces two extra requirements on every card PaymentIntent —
without them the payment is rejected with errors like _"export transactions
require a description"_ and _"export transactions require a customer name and
address"_. The integration satisfies them as follows:

| Requirement                                               | Where it is set                               | Source of the data                                                                                                                                                                                 |
| --------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description** on the PaymentIntent                      | `createPaymentIntent` (server)                | Generated from the cart, e.g. `Faith-and-Fast order - 3 item(s)`.                                                                                                                                  |
| **Customer name + shipping address** on the PaymentIntent | `createPaymentIntent` (server) — `shipping`   | Name from the signed-in user account; address from the selected delivery address.                                                                                                                  |
| **Customer name + billing address** on the card           | `StripeCardForm` (client) — `billing_details` | Name from the user account; address from the selected delivery address (used as the billing address).                                                                                              |
| **Valid ISO country codes**                               | `toISOCountry()` on both client and server    | Maps the stored country name (e.g. `India`) to its ISO 3166-1 alpha-2 code (`IN`). Values already in 2-letter form pass through; unrecognised values fall back to `IN` for this India-based store. |

Because the shipping address is required for compliance, **card payments require a
saved delivery address** — the create-intent endpoint returns `400` if none is
provided. COD and Manual UPI are unaffected.

> Note: the customer's name comes from their account (`user.name`), and the
> billing/shipping address both come from the delivery address they pick at
> checkout, since the address book is the only structured address in the app.

## Environment variables

### Server (`server/.env`)

| Variable            | Required                | Example            | Description                                                                                                                                                 |
| ------------------- | ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY` | yes (for card payments) | `sk_test_51AbC...` | Stripe secret key. Use `sk_test_...` for sandbox, `sk_live_...` for production. If unset, the card endpoints return 503 and the rest of the app still runs. |
| `STRIPE_CURRENCY`   | no                      | `inr`              | ISO currency code for charges. Defaults to `inr`.                                                                                                           |

### Client (`client/.env`)

| Variable                      | Required                | Example            | Description                                                                                                                                                             |
| ----------------------------- | ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_STRIPE_PUBLISHABLE_KEY` | yes (for card payments) | `pk_test_51AbC...` | Stripe publishable key. Use `pk_test_...` for sandbox, `pk_live_...` for production. If unset, the card option shows a "not configured" message and COD/UPI still work. |

> The secret key stays on the server only. The publishable key is safe to expose in the browser — that is what it is designed for.

## Switching between test (sandbox) and production

Switching is entirely environment-driven — **no code changes**:

- **Test / sandbox:** set `STRIPE_SECRET_KEY=sk_test_...` and `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- **Live / production:** set `STRIPE_SECRET_KEY=sk_live_...` and `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`

Get the keys from the **Stripe Dashboard → Developers → API keys**. The dashboard has a Test mode toggle; the keys under each mode are the ones to use.

## Testing locally

1. Create a free Stripe account (no KYC needed for test mode).
2. Copy the **test** secret and publishable keys into `server/.env` and `client/.env` as above.
3. Install dependencies (the new packages are `stripe` on the server and `@stripe/stripe-js` + `@stripe/react-stripe-js` on the client):
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. Start the server and client, go to checkout, choose **Pay with Card (Stripe)**, and use a Stripe test card:

   | Card number           | Result           |
   | --------------------- | ---------------- |
   | `4242 4242 4242 4242` | Payment succeeds |
   | `4000 0000 0000 0002` | Card declined    |

   Use any future expiry date, any 3-digit CVC, and any postal code.

5. On success you are taken to the order-success page, and the order appears in the admin dashboard with its Stripe transaction id.

## Files involved

- `server/controllers/stripeController.js` — create + confirm PaymentIntent (server-authoritative amount, re-verification before order creation)
- `server/route/paymentRoute.js` — `/api/payment/create-intent` and `/api/payment/confirm`
- `server/models/orderModel.js` — `STRIPE` added to `paymentMethod`, new `stripePaymentIntentId` field
- `server/index.js` — mounts `/api/payment`
- `client/src/pages/orders/StripeCardForm.jsx` — the card form (Stripe Elements)
- `client/src/pages/orders/Checkout.jsx` — adds the card option and renders the form
- `client/src/store/order-slice/order.js` — `createStripeIntent` and `confirmStripePayment` thunks

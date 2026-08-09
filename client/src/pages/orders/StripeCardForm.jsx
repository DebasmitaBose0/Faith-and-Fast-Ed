import PropTypes from 'prop-types';
import {
  createStripeIntent,
  confirmStripePayment,
} from '@/store/order-slice/order';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

// Stripe needs ISO 3166-1 alpha-2 country codes. Addresses store the country as
// a display name ("India" by default); map the common ones, pass through values
// that are already 2-letter codes, and fall back to "IN" for this India-based
// store. Mirrors the same helper on the server (stripeController.js).
const COUNTRY_NAME_TO_ISO = {
  india: 'IN',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  canada: 'CA',
  australia: 'AU',
  'united arab emirates': 'AE',
  uae: 'AE',
  singapore: 'SG',
  germany: 'DE',
  france: 'FR',
  netherlands: 'NL',
  'new zealand': 'NZ',
};

const toISOCountry = (country) => {
  if (!country) return 'IN';
  const value = String(country).trim();
  if (/^[A-Za-z]{2}$/.test(value)) return value.toUpperCase();
  return COUNTRY_NAME_TO_ISO[value.toLowerCase()] || 'IN';
};

// The card form lives in its own component because Stripe's useStripe /
// useElements hooks only work for components rendered inside <Elements>. The
// parent Checkout wraps this in <Elements>. On submit it runs the two-step
// Stripe flow: create a PaymentIntent on the server, confirm the card in the
// browser, then ask the server to create the order (the server re-verifies the
// payment before saving).
const StripeCardForm = ({
  orderData,
  onSuccess,
  customerName,
  billingAddress,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!orderData.addressId) {
      toast.error('Please select an address!');
      return;
    }
    if (!stripe || !elements) {
      toast.error('Payment form is still loading. Please wait a moment.');
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error('Card details are not available.');
      return;
    }

    setProcessing(true);
    try {
      // Step 1 — create the PaymentIntent on the server (server computes amount).
      const intentRes = await dispatch(
        createStripeIntent({
          products: orderData.products,
          discountAmount: orderData.discountAmount || 0,
          addressId: orderData.addressId,
        })
      ).unwrap();

      const clientSecret = intentRes?.clientSecret;
      const paymentIntentId = intentRes?.paymentIntentId;
      if (!clientSecret || !paymentIntentId) {
        throw new Error('Could not start the card payment.');
      }

      // India compliance: the customer's name + billing address must travel
      // with the card. Built from the signed-in user's name and the selected
      // delivery address (used as the billing address here).
      const billingDetails = { name: customerName || undefined };
      if (billingAddress) {
        billingDetails.phone = billingAddress.mobile
          ? String(billingAddress.mobile)
          : undefined;
        billingDetails.address = {
          line1: billingAddress.address_line,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.pincode,
          country: toISOCountry(billingAddress.country),
        };
      }

      // Step 2 — confirm the card in the browser with Stripe.js.
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card,
            billing_details: billingDetails,
          },
        }
      );

      if (error) {
        throw new Error(error.message || 'Card payment failed.');
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error('Card payment was not completed.');
      }

      // Step 3 — create the order on the server (server re-verifies the intent).
      const confirmRes = await dispatch(
        confirmStripePayment({
          paymentIntentId,
          userId: orderData.userId,
          addressId: orderData.addressId,
          products: orderData.products,
          totalAmount: orderData.totalAmount,
          couponCode: orderData.couponCode || '',
          discountAmount: orderData.discountAmount || 0,
        })
      ).unwrap();

      if (confirmRes?.success) {
        toast.success('Payment successful! Your order has been placed.');
        onSuccess?.();
      } else {
        throw new Error('Order could not be created after payment.');
      }
    } catch (err) {
      toast.error(
        'Card payment failed: ' +
          ((typeof err === 'object' ? err?.message : err) || 'Unknown error')
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your card details. Use Stripe test card{' '}
        <span className="font-mono">4242 4242 4242 4242</span>, any future
        expiry, any CVC, and any postal code in test mode.
      </p>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
              invalid: { color: '#ef4444' },
            },
          }}
        />
      </div>
      <button
        type="button"
        onClick={handlePay}
        disabled={processing || !stripe}
        className="w-full py-3 rounded-xl font-semibold bg-yellow-500 dark:bg-red-500 text-white disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <CircularProgress size={18} style={{ color: '#fff' }} />
            Processing…
          </>
        ) : (
          'Pay with Card'
        )}
      </button>
    </div>
  );
};

StripeCardForm.propTypes = {
  orderData: PropTypes.shape({
    userId: PropTypes.string,
    addressId: PropTypes.string,
    products: PropTypes.array,
    totalAmount: PropTypes.number,
    couponCode: PropTypes.string,
    discountAmount: PropTypes.number,
  }).isRequired,
  onSuccess: PropTypes.func,
  customerName: PropTypes.string,
  billingAddress: PropTypes.shape({
    address_line: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    pincode: PropTypes.string,
    country: PropTypes.string,
    mobile: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default StripeCardForm;

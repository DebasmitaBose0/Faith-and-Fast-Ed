import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardForm from './StripeCardForm';
import { Button, CircularProgress } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useCheckout from '@/hooks/useCheckout';

// Load Stripe once at module scope using the publishable key from the
// environment. Switch between test (pk_test_...) and live (pk_live_...) keys
// via VITE_STRIPE_PUBLISHABLE_KEY — see PAYMENT_MODE_README.md. If the key is
// missing, stripePromise is null and the card option degrades gracefully.
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

import CheckoutWizard from './CheckoutWizard';
import './CheckoutWizard.css';

const CreateOrder = () => {
  const {
    user,
    authLoading,
    address,
    productLoading,
    cartItems,
    cartLoading,
    finalTotal,
    orderLoading,
    error,
    paymentSettings,
    appliedDiscount,
    discountLoading,
    couponCode,
    setCouponCode,
    upiReference,
    setUpiReference,
    screenshotPreview,
    uploading,
    orderData,
    setOrderData,
    handleChange,
    handleScreenshotChange,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSubmit,
    handleStripeSuccess,
  } = useCheckout();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  if (productLoading || orderLoading || authLoading || cartLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-screen"
      >
        <CircularProgress sx={{ color: '#f59e0b' }} size={60} />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100"
        >
          Checkout
        </motion.h2>

        {error && (
          <motion.p
            variants={itemVariants}
            className="text-red-500 text-center mb-6 bg-red-100 dark:bg-red-900 rounded-lg p-2 shadow-md"
          >
            {typeof error === 'object' ? error.message : error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Select Address
            </label>
            {user?._id ? (
              address.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="text-center bg-red-100 dark:bg-red-900 rounded-lg p-4 shadow-md"
                >
                  <p className="text-red-500 dark:text-red-400 mb-4">
                    No addresses available. Please add an address to continue.
                  </p>
                  <Link to="/saved-address">
                    <Button
                      sx={{
                        background:
                          'linear-gradient(to right, #f59e0b, #f97316)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        '&:hover': {
                          background:
                            'linear-gradient(to right, #d97706, #ea580c)',
                        },
                      }}
                    >
                      Add Address
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {address.map((addr) => (
                      <motion.div
                        key={addr._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <input
                          type="radio"
                          name="addressId"
                          value={addr._id}
                          onChange={handleChange}
                          className="mr-4 w-5 h-5 text-yellow-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 transition duration-200"
                          required
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {`${addr.address_line}, ${addr.city}, ${addr.state}, ${addr.pincode}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {addr.mobile}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={orderData.guestInfo.name}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        guestInfo: {
                          ...orderData.guestInfo,
                          name: e.target.value,
                        },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={orderData.guestInfo.email}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        guestInfo: {
                          ...orderData.guestInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number *"
                    value={orderData.guestInfo.mobile}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        guestInfo: {
                          ...orderData.guestInfo,
                          mobile: e.target.value,
                        },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="text"
                    placeholder="Address Line *"
                    value={orderData.address.address_line}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        address: {
                          ...orderData.address,
                          address_line: e.target.value,
                        },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="text"
                    placeholder="City *"
                    value={orderData.address.city}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        address: { ...orderData.address, city: e.target.value },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={orderData.address.state}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        address: {
                          ...orderData.address,
                          state: e.target.value,
                        },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                  <input
                    type="text"
                    placeholder="Pincode *"
                    value={orderData.address.pincode}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        address: {
                          ...orderData.address,
                          pincode: e.target.value,
                        },
                      })
                    }
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Payment Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setOrderData((prev) => ({ ...prev, paymentMethod: 'COD' }))
                }
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  orderData.paymentMethod === 'COD'
                    ? 'border-yellow-500 dark:border-red-500 bg-yellow-50 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Cash on Delivery
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay when your order arrives
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setOrderData((prev) => ({ ...prev, paymentMethod: 'ONLINE' }))
                }
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  orderData.paymentMethod === 'ONLINE'
                    ? 'border-yellow-500 dark:border-red-500 bg-yellow-50 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Online Payment (UPI)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay via UPI and upload screenshot
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setOrderData((prev) => ({ ...prev, paymentMethod: 'STRIPE' }))
                }
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  orderData.paymentMethod === 'STRIPE'
                    ? 'border-yellow-500 dark:border-red-500 bg-yellow-50 dark:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Pay with Card (Stripe)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Debit / credit card via Stripe (test mode)
                </p>
              </button>
            </div>

            {orderData.paymentMethod === 'ONLINE' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {paymentSettings?.qrCode?.url ? (
                    <img
                      src={paymentSettings.qrCode.url}
                      alt="UPI QR code"
                      className="w-36 h-36 object-contain border border-gray-200 dark:border-gray-600 rounded-lg bg-white"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-400 text-center px-2">
                      QR code not configured
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay to UPI ID
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100 break-all">
                      {paymentSettings?.upiId || 'Not configured'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Scan the QR or pay to the UPI ID above, then upload a
                      screenshot of the successful payment below.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    UPI Reference / Transaction ID (optional)
                  </label>
                  <input
                    type="text"
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    placeholder="e.g. 4012XXXXXX"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white hover:file:bg-yellow-600"
                  />
                  {screenshotPreview && (
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      className="mt-3 w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {orderData.paymentMethod === 'STRIPE' &&
              (stripePromise ? (
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    orderData={orderData}
                    customerName={user?.name}
                    billingAddress={
                      user?._id
                        ? address.find((a) => a._id === orderData.addressId)
                        : {
                            ...orderData.address,
                            mobile: orderData.guestInfo.mobile,
                          }
                    }
                    onSuccess={handleStripeSuccess}
                  />
                </Elements>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                  Card payments are not configured. Please set
                  VITE_STRIPE_PUBLISHABLE_KEY to enable Stripe checkout.
                </div>
              ))}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Your Items
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md">
              <AnimatePresence>
                {cartItems?.length > 0 ? (
                  cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <motion.img
                          src={
                            item.productId.images[0]?.url || '/placeholder.jpg'
                          }
                          alt={item.productId.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                          whileHover={{ scale: 1.05 }}
                        />
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {item.productId.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                          {item.selectedColor && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Color: {item.selectedColor}
                            </p>
                          )}
                          {item.selectedSize && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Size: {item.selectedSize}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center mt-4 sm:mt-0">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          ₹
                          {(
                            item.productId.price *
                            item.quantity *
                            (1 - (item.productId.discount || 0) / 100)
                          ).toFixed(2)}
                        </p>
                        {item.productId.discount > 0 && (
                          <p className="text-sm line-through text-gray-500 dark:text-gray-400">
                            ₹{(item.productId.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    variants={itemVariants}
                    className="text-gray-500 dark:text-gray-400 text-center"
                  >
                    No items in your cart.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Coupon Code
            </label>
            <motion.div
              variants={itemVariants}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md"
            >
              {appliedDiscount?.name ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      Coupon &quot;{appliedDiscount.name}&quot; applied
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You saved ₹
                      {Number(appliedDiscount.discountAmount || 0).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 p-3 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase"
                    aria-label="Coupon code"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={discountLoading}
                    sx={{
                      background: 'linear-gradient(to right, #f59e0b, #f97316)',
                      color: 'white',
                      padding: '8px 24px',
                      borderRadius: '9999px',
                      fontWeight: 'bold',
                      '&:hover': {
                        background:
                          'linear-gradient(to right, #d97706, #ea580c)',
                      },
                    }}
                  >
                    {discountLoading ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
              Total Amount
            </label>
            <motion.div
              variants={itemVariants}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md space-y-2"
            >
              {appliedDiscount?.discountAmount > 0 && (
                <>
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{Number(finalTotal).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Discount</span>
                    <span>
                      -₹
                      {Number(appliedDiscount.discountAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Payable
                </span>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  ₹{Number(orderData.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <input
                type="hidden"
                name="totalAmount"
                value={orderData.totalAmount || 0}
                readOnly
              />
            </motion.div>
          </motion.div>

          <motion.button
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={uploading || orderLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-red-600 dark:to-red-700 text-white py-3 rounded-full font-semibold shadow-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            aria-label="Place Order"
          >
            {uploading
              ? 'Uploading screenshot...'
              : orderLoading
                ? 'Placing order...'
                : 'Place Order'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateOrder;

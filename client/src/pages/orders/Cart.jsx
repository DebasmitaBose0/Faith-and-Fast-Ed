import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  deleteCartItem,
  updateCartItemQty,
} from '@/store/add-to-cart/addToCart';
import MetaData from '../extras/MetaData';
import CartSkeleton from '../components/skeletons/CartSkeleton';
import RecommendationSection from '../components/RecommendationSection';
import EmptyState from '../components/EmptyState';
import { ShoppingCart } from 'lucide-react';
import { getTrendingProducts } from '@/store/product-slice/productDetails';
import { IconButton } from '@mui/material';
import { ShoppingCartCheckout } from '@mui/icons-material';

const Cart = () => {
  // eslint-disable-next-line no-unused-vars
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems = [], loading, error } = useSelector((state) => state.cart);
  const { discounts } = useSelector((state) => state.discount);
  const { trendingProducts } = useSelector((state) => state.productDetails);

  useEffect(() => {
    setAppliedCoupon(null);
  }, []);

  useEffect(() => {
    dispatch(getCartItems());
    dispatch(getTrendingProducts(8));
  }, [dispatch]);

  if (loading) {
    return <CartSkeleton />;
  }
  const handleUpdateQty = (id, qty) => {
    if (qty > 0) {
      dispatch(updateCartItemQty({ _id: id, qty }));
    }
  };

  const handleDeleteItem = (id) => {
    dispatch(deleteCartItem(id));
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (item.productId?.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const totalDiscount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        ((item.productId?.price * (item.productId?.discount || 0)) / 100) *
          item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = () => {
    return 0;
  };

  const finalTotal = useMemo(() => {
    const finaltotalprice = totalPrice - totalDiscount;
    return finaltotalprice + shipping();
  }, [totalPrice, totalDiscount]);

  const appliedCouponAmount = useMemo(() => {
    const total = finalTotal;
    if (discounts?.discountValue) {
      return Math.max(total * (1 - discounts.discountValue / 100), 0);
    }
    return total;
  }, [finalTotal, discounts]);

  return (
    <>
      <MetaData title="Cart | Faith & Fast" />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
        <motion.h1
          className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Shopping Cart
        </motion.h1>

        {error && <p className="text-red-500 text-center py-10">{error}</p>}

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            message="Looks like you haven't added anything yet. Find something you love and add it to your cart."
            actionLabel="Continue Shopping"
            actionTo="/products"
          />
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={item.productId.images[0].url}
                      alt={item.productId.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <Link
                        to={`/product/${item.productId._id}`}
                        className="text-lg font-semibold text-gray-800 dark:text-white hover:text-blue-500"
                      >
                        {item.productId.name}
                      </Link>
                      <p className="text-gray-500 dark:text-gray-400">
                        ₹{item.productId.price.toFixed(2)}
                      </p>
                      <div className="flex justify-between">
                        <p className="text-gray-600 dark:text-gray-400">
                          Discount
                        </p>
                        <p className="text-red-500 font-medium">
                          -₹
                          {(
                            item.productId.price *
                            (item.productId.discount / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                      {/* Display selected color and size if available */}
                      <div className="mt-2">
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
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <IconButton
                        onClick={() =>
                          handleUpdateQty(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus className="text-gray-700 dark:text-white" />
                      </IconButton>
                      <span className="text-lg font-medium dark:text-white">
                        {item.quantity}
                      </span>
                      <IconButton
                        onClick={() =>
                          handleUpdateQty(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.productId.stock}
                      >
                        <FiPlus className="text-gray-700 dark:text-white" />
                      </IconButton>
                    </div>

                    <IconButton onClick={() => handleDeleteItem(item._id)}>
                      <FiTrash2 className="text-red-500 hover:text-red-700" />
                    </IconButton>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Subtotal</p>
                  <p className="text-gray-800 dark:text-white font-medium">
                    ₹{totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Discount</p>
                  <p className="text-red-500 font-medium">
                    -₹{totalDiscount.toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Shipping</p>
                  <p className="text-gray-800 dark:text-white font-medium">
                    Free Shipping
                  </p>
                </div>

                <div className="flex justify-between border-t pt-3 items-center">
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    Total
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    ₹{appliedCouponAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                className="bg-yellow-500 hover:bg-yellow-700 dark:bg-red-600 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 m-auto mt-4"
                onClick={() => navigate('/checkout')}
              >
                <ShoppingCartCheckout /> Proceed to Checkout
              </button>
            </motion.div>
          </div>
        )}

        {cartItems.length > 0 && (
          <RecommendationSection
            title="You May Also Like"
            products={trendingProducts}
          />
        )}
      </div>
    </>
  );
};

export default Cart;

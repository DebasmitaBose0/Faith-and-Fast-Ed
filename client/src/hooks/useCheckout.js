import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCartItems, deleteCartItem } from '@/store/add-to-cart/addToCart';
import { userAddress } from '@/store/address-slice/addressSlice';
import { getSingleDetail } from '@/store/auth-slice/user';
import {
  createOrder,
  uploadPaymentScreenshot,
} from '@/store/order-slice/order';
import { getPaymentSettings } from '@/store/extra-slice/paymentSettingsSlice';
import { getProducts } from '@/store/product-slice/productSlice';
import {
  applyDiscount,
  clearAppliedDiscount,
} from '@/store/extra-slice/discount';

export const useCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { appliedDiscount, loading: discountLoading } = useSelector(
    (state) => state.discount
  );
  const [couponCode, setCouponCode] = useState('');
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { address } = useSelector((state) => state.address);
  const { product: products = [], loading: productLoading } = useSelector(
    (state) => state.product
  );
  const {
    cartItems = [],
    loading: cartLoading,
    finalTotal,
  } = useSelector((state) => state.cart);
  const { loading: orderLoading, error } = useSelector((state) => state.order);
  const { settings: paymentSettings } = useSelector(
    (state) => state.paymentSettings
  );

  const [upiReference, setUpiReference] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const [orderData, setOrderData] = useState({
    userId: '',
    guestInfo: { name: '', email: '', mobile: '' },
    addressId: '',
    address: {
      address_line: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    products: [],
    paymentMethod: 'COD',
    totalAmount: finalTotal ? finalTotal.toFixed(2) : '0.00',
  });

  // Idempotency key to make double-click / retry safe.
  const getCheckoutIdempotencyKey = () => {
    const key = 'checkout:idempotencyKey';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;

    const uuid =
      (typeof crypto !== 'undefined' &&
        crypto.randomUUID &&
        crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    sessionStorage.setItem(key, uuid);
    return uuid;
  };

  useEffect(() => {
    dispatch(userAddress());
    dispatch(getProducts());
    dispatch(getSingleDetail());
    dispatch(getCartItems());
    dispatch(getPaymentSettings());
    dispatch(clearAppliedDiscount());
    return () => {
      dispatch(clearAppliedDiscount());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      setOrderData((prevData) => ({
        ...prevData,
        userId: user._id,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length > 0 && products.length > 0) {
      const validCartItems = cartItems.filter(
        (item) =>
          item.productId && products.some((p) => p._id === item.productId._id)
      );

      const formattedProducts = validCartItems
        .map((item) => {
          const product = products.find((p) => p._id === item.productId._id);
          return product
            ? {
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                totalPrice: (
                  product.price *
                  item.quantity *
                  (1 - (product.discount || 0) / 100)
                ).toFixed(2),
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
              }
            : null;
        })
        .filter(Boolean);

      const payable =
        appliedDiscount?.newPrice != null
          ? appliedDiscount.newPrice
          : finalTotal;

      setOrderData((prev) => ({
        ...prev,
        products: formattedProducts,
        totalAmount: Number(payable).toFixed(2),
        couponCode: appliedDiscount?.name || '',
        discountAmount: appliedDiscount?.discountAmount || 0,
      }));
    }
  }, [cartItems, products, appliedDiscount, finalTotal]);

  const handleChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file for the screenshot.');
      return;
    }
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!user?._id) {
      toast.error('Please login to apply a coupon');
      return;
    }
    try {
      await dispatch(
        applyDiscount({
          userId: user._id,
          couponCode: code,
          originalPrice: Number(finalTotal),
        })
      ).unwrap();
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(
        (typeof err === 'object' ? err?.message : err) ||
          'Failed to apply coupon'
      );
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedDiscount());
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isGuest = !user?._id;

    if (!isGuest && !orderData.addressId) {
      toast.error('Please select an address!');
      return;
    }

    if (
      isGuest &&
      (!orderData.guestInfo.name ||
        !orderData.guestInfo.email ||
        !orderData.guestInfo.mobile ||
        !orderData.address.address_line ||
        !orderData.address.city ||
        !orderData.address.state ||
        !orderData.address.pincode)
    ) {
      toast.error('Please fill in all guest details and address fields!');
      return;
    }

    const method = orderData.paymentMethod || 'COD';

    if (method === 'STRIPE') {
      toast.info(
        'Use the "Pay with Card" button to complete your card payment.'
      );
      return;
    }

    try {
      let payload = { ...orderData, paymentMethod: method };
      payload = { ...payload, idempotencyKey: getCheckoutIdempotencyKey() };

      if (method === 'ONLINE') {
        if (!screenshotFile) {
          toast.error('Please upload your payment screenshot.');
          return;
        }
        setUploading(true);
        const screenshot = await dispatch(
          uploadPaymentScreenshot(screenshotFile)
        ).unwrap();
        setUploading(false);
        payload = {
          ...payload,
          upiReference: upiReference.trim(),
          paymentScreenshot: screenshot,
        };
      }

      const result = await dispatch(createOrder(payload)).unwrap();
      if (result) {
        toast.success(
          method === 'ONLINE'
            ? 'Order placed! Your payment is pending verification.'
            : 'Order placed successfully (Cash on Delivery)!'
        );
        cartItems.forEach((item) => {
          dispatch(deleteCartItem(item._id));
        });
        dispatch(getCartItems());
        navigate('/order-success', { replace: true });
      }
    } catch (err) {
      setUploading(false);
      toast.error(
        'Failed to place order: ' +
          ((typeof err === 'object' ? err?.message : err) || 'Unknown error')
      );
    }
  };

  const handleStripeSuccess = () => {
    cartItems.forEach((item) => {
      dispatch(deleteCartItem(item._id));
    });
    dispatch(getCartItems());
    navigate('/order-success', { replace: true });
  };

  return {
    dispatch,
    navigate,
    user,
    authLoading,
    address,
    products,
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
    screenshotFile,
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
  };
};

export default useCheckout;

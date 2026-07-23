import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { myOrders } from '@/store/order-slice/order';
import EmptyState from '../components/EmptyState';
import { Package } from 'lucide-react';
import { jsPDF } from 'jspdf';

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(8);

  useEffect(() => {
    dispatch(myOrders());
  }, [dispatch]);

  const handleStatus = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 px-2 py-1 rounded-md font-semibold text-xs sm:text-sm';
      case 'PENDING':
        return 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 px-2 py-1 rounded-md font-semibold text-xs sm:text-sm';
      case 'SHIPPED':
        return 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded-md font-semibold text-xs sm:text-sm';
      case 'CANCELLED':
        return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 px-2 py-1 rounded-md font-semibold text-xs sm:text-sm';
      default:
        return 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-md font-semibold text-xs sm:text-sm';
    }
  };

  const formatDeliveryDate = (date) => {
    if (!date || date === 'To be delivered') return 'To be delivered';
    const deliveryDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const options = {
      month: 'long',
      day: '2-digit',
      year:
        deliveryDate.getFullYear() === today.getFullYear()
          ? undefined
          : 'numeric',
    };

    if (
      deliveryDate.toDateString() === today.toDateString() &&
      deliveryDate.getTime() > today.getTime()
    ) {
      return 'Arriving today by 10 PM';
    }
    if (deliveryDate.toDateString() === tomorrow.toDateString()) {
      return 'Arriving tomorrow by 10 PM';
    }
    if (deliveryDate > today) {
      return `Arriving on ${deliveryDate.toLocaleDateString(
        'en-US',
        options
      )} by 10 PM`;
    }
    if (
      deliveryDate.getDate() === today.getDate() &&
      deliveryDate.getMonth() === today.getMonth() &&
      deliveryDate.getFullYear() === today.getFullYear()
    ) {
      return `Delivered today, ${deliveryDate.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
      })}`;
    }
    return `Delivered on ${deliveryDate.toLocaleDateString('en-US', options)}`;
  };

  const filterOrders = () => {
    let filtered = [...(Array.isArray(orders) ? orders : [])];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    const today = new Date();
    if (timeFilter === 'LAST_7_DAYS') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= sevenDaysAgo
      );
    } else if (timeFilter === 'LAST_30_DAYS') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= thirtyDaysAgo
      );
    } else if (timeFilter !== 'ALL') {
      const year = parseInt(timeFilter, 10);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt).getFullYear() === year
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((order) => {
        const orderId = order._id ? String(order._id).toLowerCase() : '';
        const productNames = order.products
          ?.map((p) => String(p.product?.name || '').toLowerCase())
          .join(' ');
        const colors = order.products
          ?.map((p) => String(p.selectedColor || '').toLowerCase())
          .join(' ');

        return (
          orderId.includes(searchQuery.toLowerCase()) ||
          productNames.includes(searchQuery.toLowerCase()) ||
          colors.includes(searchQuery.toLowerCase())
        );
      });
    }

    const flattenedProducts = filtered.flatMap((order) =>
      order.products.map((product) => ({
        ...product,
        orderId: order._id,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        deliveryDate: order.deliveryDate,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      }))
    );

    return flattenedProducts;
  };

  const filteredProducts = filterOrders();
  const indexOfLastProduct = currentPage * ordersPerPage;
  const indexOfFirstProduct = indexOfLastProduct - ordersPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / ordersPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleDownloadReceipt = (orderId) => {
    const order = (Array.isArray(orders) ? orders : []).find(
      (o) => o._id === orderId
    );
    if (!order) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('Faith AND Fast', 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text('Order Receipt', 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Order ID: ${order._id}`, 14, y);
    y += 6;
    doc.text(`Customer: ${user?.name || 'Customer'}`, 14, y);
    y += 6;
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleString('en-IN')}`,
      14,
      y
    );
    y += 6;
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, y);
    y += 6;
    doc.text(`Payment Status: ${order.paymentStatus}`, 14, y);
    y += 6;
    if (order.upiReference) {
      doc.text(`UPI Reference: ${order.upiReference}`, 14, y);
      y += 6;
    }
    y += 4;

    doc.setFontSize(12);
    doc.text('Items', 14, y);
    y += 6;
    doc.setFontSize(10);
    order.products.forEach((item) => {
      const name = item.product?.name || 'Product';
      const line = `${name}  x${item.quantity}   Rs. ${Number(
        item.totalPrice || 0
      ).toFixed(2)}`;
      doc.text(line, 14, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 4;
    doc.setFontSize(12);
    doc.text(`Total: Rs. ${Number(order.totalAmount).toFixed(2)}`, 14, y);

    doc.save(`receipt-${order._id}.pdf`);
  };

  const uniqueYears = [
    ...new Set(
      Array.isArray(orders)
        ? orders.map((order) => new Date(order.createdAt).getFullYear())
        : []
    ),
  ].sort((a, b) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-2 sm:p-4 lg:p-6"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center">
          My Orders
        </h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 mb-3 sm:mb-4"
      >
        {/* Filters (Sidebar on Desktop, Full Width on Mobile) */}
        <div className="w-full sm:w-1/4 bg-white dark:bg-gray-800 shadow-md rounded-lg p-3 sm:p-4 mb-3 sm:mb-0">
          <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Filters
          </h3>
          <div className="space-y-3">
            <FormControl fullWidth size="small">
              <InputLabel className="dark:text-gray-300 text-xs sm:text-sm">
                Order Status
              </InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="dark:bg-gray-200 dark:text-white dark:border-gray-600 text-xs sm:text-sm"
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel className="dark:text-gray-300 text-xs sm:text-sm">
                Order Time
              </InputLabel>
              <Select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="dark:bg-gray-200 dark:text-white dark:border-gray-600 text-xs sm:text-sm"
              >
                <MenuItem value="ALL">All Time</MenuItem>
                <MenuItem value="LAST_7_DAYS">Last 7 Days</MenuItem>
                <MenuItem value="LAST_30_DAYS">Last 30 Days</MenuItem>
                {uniqueYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="w-full sm:w-3/4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-3 sm:mb-4"
          >
            <TextField
              fullWidth
              label="Search your orders here"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="dark:bg-gray-200 dark:text-white"
              InputProps={{
                className: 'dark:text-gray-300 text-xs sm:text-sm',
                endAdornment: (
                  <Button
                    variant="contained"
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs sm:text-sm"
                  >
                    Search
                  </Button>
                ),
              }}
              InputLabelProps={{
                className: 'dark:text-gray-300 text-xs sm:text-sm',
              }}
            />
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-10">
              <CircularProgress />
            </div>
          ) : error ? (
            <Alert severity="error" className="text-sm sm:text-base">
              {typeof error === 'string' ? error : 'No Orders Available'}
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              message="When you place an order it will appear here, so you can track and revisit it anytime."
              actionLabel="Start Shopping"
              actionTo="/products"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4">
              <AnimatePresence>
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={`${product.orderId}-${product._id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 sm:p-3 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start space-x-2 sm:space-x-4">
                      {/* Product Image */}
                      <Link
                        to={`/product/${product.product._id}`}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                          <img
                            src={
                              product.product.images &&
                              product.product.images.length > 0
                                ? product.product.images[0].url
                                : 'https://via.placeholder.com/64'
                            }
                            alt={product.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      </Link>

                      {/* Product and Order Details */}
                      <div className="flex-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                          {product.product.name || 'Unknown Product'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Color: {product.selectedColor || 'N/A'} | Size:{' '}
                          {product.selectedSize || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                          ₹{product.totalAmount.toFixed(2)}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-1">
                          <span
                            className={`inline-block ${handleStatus(
                              product.orderStatus
                            )}`}
                          >
                            {product.orderStatus}
                          </span>
                          <span
                            className={`inline-block px-2 py-1 rounded-md font-semibold text-xs sm:text-sm ${
                              product.paymentStatus === 'COMPLETED'
                                ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
                                : product.paymentStatus === 'FAILED'
                                  ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100'
                                  : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
                            }`}
                          >
                            {product.paymentMethod} · {product.paymentStatus}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Order Placed on:{' '}
                          {new Date(product.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDeliveryDate(product.deliveryDate)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                          Order ID: {product.orderId}
                        </p>
                        <div className="mt-2 flex space-x-1 sm:space-x-2">
                          <Tooltip title="View Order Details">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link
                                to={`/order/${product.orderId}`}
                                className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-md sm:text-lg"
                              >
                                View Details
                              </Link>
                            </motion.div>
                          </Tooltip>
                          {(product.paymentMethod === 'COD' ||
                            product.paymentStatus === 'COMPLETED') &&
                            product.orderStatus !== 'CANCELLED' && (
                              <Tooltip title="Download Receipt">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleDownloadReceipt(product.orderId)
                                  }
                                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs sm:text-sm"
                                >
                                  Download Receipt
                                </motion.button>
                              </Tooltip>
                            )}
                          {product.orderStatus === 'DELIVERED' && (
                            <Tooltip title="Rate & Review Product">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Link
                                  to={`/product/${product.product._id}`}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm"
                                >
                                  Rate & Review
                                </Link>
                              </motion.div>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center items-center mt-4 space-x-1 sm:space-x-2 p-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700 text-xs sm:text-sm"
              >
                Previous
              </Button>
            </motion.div>
            {Array.from({ length: totalPages }, (_, i) => (
              <motion.div
                key={i + 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={currentPage === i + 1 ? 'contained' : 'outlined'}
                  onClick={() => handlePageChange(i + 1)}
                  className={`${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700'
                  } text-xs sm:text-sm`}
                >
                  {i + 1}
                </Button>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700 text-xs sm:text-sm"
              >
                Next
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyOrders;

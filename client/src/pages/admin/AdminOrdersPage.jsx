import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import {
  deleteOrder,
  getAllOrders,
  updateOrderStatus,
  deleteAllOrders,
  verifyPayment,
} from "@/store/order-slice/AdminOrderSlice";
import { Link } from "react-router-dom";
import MetaData from "../extras/MetaData";
import { hasPermission } from "@/utils/permissions";

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.adminOrders);
  const { user } = useSelector((state) => state.auth);
  const canUpdate = hasPermission(user, "orders:update");
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [notes, setNotes] = useState("");
  const [updatedDeliveryDate, setUpdatedDeliveryDate] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  // Payment verification dialog state
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [verifyOrder, setVerifyOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.orderStatus);
    setTrackingId(order.trackingId || "");
    setNotes("");
    setUpdatedDeliveryDate(
      order.deliveryDate
        ? new Date(order.deliveryDate).toISOString().split("T")[0]
        : ""
    );
    setOpenUpdateDialog(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedOrder) {
      const payload = {
        orderId: selectedOrder._id,
        orderStatus: updateStatus,
        trackingId,
        notes,
        deliveryDate: updatedDeliveryDate || undefined,
      };
      console.log("Sending Payload:", payload);
      dispatch(updateOrderStatus(payload)).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          setOpenUpdateDialog(false);
          dispatch(getAllOrders());
        } else {
          console.error("Update failed:", result.payload);
        }
      });
    }
  };

  const handleDeleteClick = (orderId) => {
    setDeleteOrderId(orderId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteOrderId) {
      dispatch(deleteOrder(deleteOrderId)).then(() => {
        setOpenDeleteDialog(false);
        dispatch(getAllOrders());
      });
    }
  };

  const handleDeleteAllClick = () => {
    setOpenDeleteAllDialog(true);
  };

  const handleDeleteAllConfirm = () => {
    dispatch(deleteAllOrders()).then(() => {
      setOpenDeleteAllDialog(false);
      dispatch(getAllOrders());
    });
  };

  const handleVerifyClick = (order) => {
    setVerifyOrder(order);
    setRejectionReason("");
    setOpenVerifyDialog(true);
  };

  const handleVerifyAction = (action) => {
    if (!verifyOrder) return;
    if (action === "reject" && !rejectionReason.trim()) return;
    dispatch(
      verifyPayment({
        orderId: verifyOrder._id,
        action,
        rejectionReason: action === "reject" ? rejectionReason.trim() : "",
      })
    ).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setOpenVerifyDialog(false);
        setVerifyOrder(null);
        dispatch(getAllOrders());
      }
    });
  };

  const formatDeliveryDate = (date) => {
    if (!date || date === "To be delivered") return "To be delivered";
    const deliveryDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const options = {
      month: "long",
      day: "2-digit",
      year:
        deliveryDate.getFullYear() === today.getFullYear()
          ? undefined
          : "numeric",
    };

    if (
      deliveryDate.toDateString() === today.toDateString() &&
      deliveryDate.getTime() > today.getTime()
    ) {
      return "Arriving today by 10 PM";
    }
    if (deliveryDate.toDateString() === tomorrow.toDateString()) {
      return "Arriving tomorrow by 10 PM";
    }
    if (deliveryDate > today) {
      return `Expected on ${deliveryDate.toLocaleDateString("en-US", options)}`;
    }
    if (
      deliveryDate.getDate() === today.getDate() &&
      deliveryDate.getMonth() === today.getMonth() &&
      deliveryDate.getFullYear() === today.getFullYear()
    ) {
      return `Delivered today, ${deliveryDate.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
      })}`;
    }
    return `Delivered on ${deliveryDate.toLocaleDateString("en-US", options)}`;
  };

  // Filter and sort logic
  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    const today = new Date();
    if (timeFilter === "LAST_7_DAYS") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= sevenDaysAgo
      );
    } else if (timeFilter === "LAST_30_DAYS") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= thirtyDaysAgo
      );
    } else if (timeFilter !== "ALL") {
      const year = parseInt(timeFilter, 10);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt).getFullYear() === year
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.trackingId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const fieldA =
        sortField === "createdAt"
          ? new Date(a.createdAt)
          : new Date(a.deliveryDate || 0);
      const fieldB =
        sortField === "createdAt"
          ? new Date(b.createdAt)
          : new Date(b.deliveryDate || 0);
      return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
    });
  };

  const sortedAndFilteredOrders = filterOrders();
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedAndFilteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(sortedAndFilteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const toggleSort = (field) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
  };

  const uniqueYears = [
    ...new Set(orders.map((order) => new Date(order.createdAt).getFullYear())),
  ].sort((a, b) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8"
    >
      <MetaData title="Admin Orders Dashboard | Faith AND Fast" />
      {/* Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mb-4 sm:mb-6"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center">
          Admin Orders Dashboard
        </h1>
      </motion.header>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4 sm:mb-6"
      >
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 w-full sm:w-auto flex-wrap">
            {/* Filters */}
            <FormControl className="w-full sm:w-36 lg:w-48">
              <InputLabel className="dark:text-gray-700">Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="dark:bg-gray-400 dark:text-white dark:border-gray-600 text-sm sm:text-base"
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="SHIPPED">Shipped</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl className="w-full sm:w-36 lg:w-48">
              <InputLabel className="dark:text-gray-300">Time</InputLabel>
              <Select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="dark:bg-gray-400 dark:text-white dark:border-gray-600 text-sm sm:text-base"
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

            <TextField
              label="Search Orders(Order Id, name, email)"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48 lg:w-64 dark:bg-gray-400 dark:text-white"
              InputProps={{
                className: "dark:text-gray-300 text-sm sm:text-base",
              }}
              InputLabelProps={{ className: "dark:text-gray-300" }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            {canUpdate && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  onClick={handleDeleteAllClick}
                  disabled={loading || orders.length === 0}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-xs sm:text-sm lg:text-base w-full sm:w-auto"
                >
                  Delete All
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                onClick={() => toggleSort("createdAt")}
                className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700 text-xs sm:text-sm lg:text-base w-full sm:w-auto"
              >
                Order Date ({sortField === "createdAt" ? sortOrder : "desc"})
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                onClick={() => toggleSort("deliveryDate")}
                className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700 text-xs sm:text-sm lg:text-base w-full sm:w-auto"
              >
                Delivery ({sortField === "deliveryDate" ? sortOrder : "desc"})
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <CircularProgress />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-10 text-sm sm:text-base">
            {error}
          </p>
        ) : sortedAndFilteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10 text-sm sm:text-base">
            No orders match your filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold">
                      Order ID
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold">
                      User
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold hidden sm:table-cell">
                      Payment
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">
                      Order Date
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold">
                      Delivery Date
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold">
                      Status
                    </th>
                     <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold hidden md:table-cell">
                      Tracking ID
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold">
                      Updated By
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-left text-xs sm:text-sm font-semibold">
                      Total
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-center text-xs sm:text-sm font-semibold">
                      View
                    </th>
                    <th className="p-2 sm:p-3 lg:p-4 text-center text-xs sm:text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate max-w-[100px] sm:max-w-[150px]">
                          {order._id}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-center flex-wrap">
                          {order.user?.name}
                          <br className="sm:hidden" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {order.user?.email}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          <div>{order.paymentMethod}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.paymentStatus === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : order.paymentStatus === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                          {order.paymentMethod === "STRIPE" &&
                            order.stripePaymentIntentId && (
                              <div
                                className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 break-all"
                                title="Stripe transaction ID"
                              >
                                Txn: {order.stripePaymentIntentId}
                              </div>
                            )}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {formatDeliveryDate(order.deliveryDate)}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {order.orderStatus}
                        </td>
                         <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">
                          {order.trackingId || "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {order.lastUpdatedBy ? order.lastUpdatedBy.name : "System"}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-green-600 font-bold">
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-2 sm:p-3 lg:p-4 text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to={`/order/${order._id}`}
                              className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs sm:text-sm"
                            >
                              View
                            </Link>
                          </motion.div>
                        </td>
                         <td className="p-2 sm:p-3 lg:p-4 text-center space-x-1 sm:space-x-2">
                          {canUpdate ? (
                            <>
                              {order.orderStatus !== "DELIVERED" &&
                                order.orderStatus !== "CANCELLED" && (
                                  <Tooltip title="Update Order">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleUpdateClick(order)}
                                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm"
                                    >
                                      Update
                                    </motion.button>
                                  </Tooltip>
                                )}
                              {order.paymentMethod === "ONLINE" &&
                                order.paymentStatus === "PENDING" && (
                                  <Tooltip title="Verify Payment">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleVerifyClick(order)}
                                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs sm:text-sm"
                                    >
                                      Verify
                                    </motion.button>
                                  </Tooltip>
                                )}
                              <Tooltip title="Delete Order">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteClick(order._id)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
                                >
                                  Delete
                                </motion.button>
                              </Tooltip>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap justify-center items-center mt-4 sm:mt-6 space-x-1 sm:space-x-2 p-2"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700 text-xs sm:text-sm m-1"
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
                    variant={currentPage === i + 1 ? "contained" : "outlined"}
                    onClick={() => handlePageChange(i + 1)}
                    className={`${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700"
                    } text-xs sm:text-sm m-1`}
                  >
                    {i + 1}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700 text-xs sm:text-sm m-1"
                >
                  Next
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Update Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="dark:text-white bg-indigo-600 text-white p-3 sm:p-4 text-base sm:text-lg">
          Update Order Status
        </DialogTitle>
        <DialogContent className="dark:bg-gray-800 dark:text-gray-200 p-3 sm:p-4">
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                  Order Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                  Tracking ID
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={updatedDeliveryDate}
                  onChange={(e) => setUpdatedDeliveryDate(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  rows="3"
                />
              </div>
            </motion.div>
          )}
        </DialogContent>
        <DialogActions className="dark:bg-gray-800 p-3 sm:p-4">
          <Button
            onClick={() => setOpenUpdateDialog(false)}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white text-sm sm:text-base"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verify Payment Dialog */}
      <Dialog
        open={openVerifyDialog}
        onClose={() => setOpenVerifyDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="bg-green-600 text-white p-3 sm:p-4 text-base sm:text-lg">
          Verify Payment
        </DialogTitle>
        <DialogContent className="dark:bg-gray-800 dark:text-gray-200 p-3 sm:p-4">
          {verifyOrder && (
            <div className="space-y-4 mt-2">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-semibold">Order:</span> {verifyOrder._id}
                </p>
                <p>
                  <span className="font-semibold">Customer:</span>{" "}
                  {verifyOrder.user?.name} ({verifyOrder.user?.email})
                </p>
                <p>
                  <span className="font-semibold">Amount:</span> ₹
                  {verifyOrder.totalAmount?.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">UPI Reference:</span>{" "}
                  {verifyOrder.upiReference || "Not provided"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Payment Screenshot</p>
                {verifyOrder.paymentScreenshot?.url ? (
                  <a
                    href={verifyOrder.paymentScreenshot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={verifyOrder.paymentScreenshot.url}
                      alt="Payment screenshot"
                      className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-600 object-contain"
                    />
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No screenshot uploaded.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Rejection reason (required to reject)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="2"
                  placeholder="e.g. Screenshot does not match the order amount"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="dark:bg-gray-800 p-3 sm:p-4">
          <Button
            onClick={() => setOpenVerifyDialog(false)}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleVerifyAction("reject")}
            disabled={!rejectionReason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base disabled:opacity-50"
          >
            Reject
          </Button>
          <Button
            onClick={() => handleVerifyAction("approve")}
            className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Single Order Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="dark:text-white bg-red-600 text-white p-3 sm:p-4 text-base sm:text-lg">
          Delete Order
        </DialogTitle>
        <DialogContent className="dark:bg-gray-800 dark:text-gray-300 p-3 sm:p-4">
          <p className="text-sm sm:text-base">
            Are you sure you want to delete this order?
          </p>
        </DialogContent>
        <DialogActions className="dark:bg-gray-800 p-3 sm:p-4">
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-sm sm:text-base"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Orders Dialog */}
      <Dialog
        open={openDeleteAllDialog}
        onClose={() => setOpenDeleteAllDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="dark:text-white bg-red-600 text-white p-3 sm:p-4 text-base sm:text-lg">
          Delete All Orders
        </DialogTitle>
        <DialogContent className="dark:bg-gray-800 dark:text-gray-300 p-3 sm:p-4">
          <p className="text-sm sm:text-base">
            Are you sure you want to delete all orders? This action cannot be
            undone.
          </p>
        </DialogContent>
        <DialogActions className="dark:bg-gray-800 p-3 sm:p-4">
          <Button
            onClick={() => setOpenDeleteAllDialog(false)}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAllConfirm}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-sm sm:text-base"
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AdminOrdersPage;

import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiTruck, FiCheckCircle, FiMapPin } from "react-icons/fi";
import { cancelOrder, getSingleOrder } from "@/store/order-slice/order";
import MetaData from "../extras/MetaData";
import { Alert, CircularProgress } from "@mui/material";
import { FaCheck } from "react-icons/fa6";
import { toast } from "react-toastify";
import ConfirmationModal from "../extras/ConfirmationModal";
import { format } from "date-fns";

const statusOrder = ["PENDING", "SHIPPED", "DELIVERED"];

const StatusStep = ({ step, index, currentStatus }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCompleted = currentIndex >= index;

  return (
    <div className="flex flex-col items-center flex-1 relative">
      <motion.div
        className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl 
          ${
            isCompleted
              ? "bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-lg"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400"
          }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1, type: "spring" }}
      >
        {isCompleted ? (
          <FaCheck className="text-xl" />
        ) : index === 0 ? (
          <FiClock />
        ) : index === 1 ? (
          <FiTruck />
        ) : (
          <FiCheckCircle />
        )}
      </motion.div>
      <motion.span
        className={`mt-2 text-sm font-medium ${
          isCompleted
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-300"
        }`}
      >
        {step}
      </motion.span>

      {index < 2 && (
        <div className="absolute top-7 left-3/4 w-full h-1 bg-gray-200 dark:bg-gray-600">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: isCompleted ? "100%" : "0%" }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

StatusStep.propTypes = {
  step: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  currentStatus: PropTypes.string.isRequired,
};

const OrderDetails = () => {
  const { Id } = useParams();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getSingleOrder(Id));
  }, [dispatch, Id]);

  const handleStatus = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 px-2 py-1 rounded-md font-semibold";
      case "PENDING":
        return "bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 px-2 py-1 rounded-md font-semibold";
      case "SHIPPED":
        return "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded-md font-semibold";
      case "CANCELLED":
        return "bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 px-2 py-1 rounded-md font-semibold";
      default:
        return "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-md font-semibold";
    }
  };

  if (!order) return null;

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      await dispatch(cancelOrder(order._id)).unwrap();
      toast.success("Order canceled successfully!");
      // Re-fetch this order so the status updates in place, no full reload.
      dispatch(getSingleOrder(Id));
    } catch (error) {
      toast.error(error || "Failed to cancel order.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

   const formatDeliveryDate = (date) => {
      if (!date || date === "To be delivered") return "To be delivered";
  
      const deliveryDate = new Date(date);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
  
      const yearFormat =
        deliveryDate.getFullYear() === today.getFullYear()
          ? "MMMM dd"
          : "MMMM dd, yyyy";
  
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
        return `Expected delivery on ${format(deliveryDate, yearFormat)}`;
      }
  
      if (
        deliveryDate.getDate() === today.getDate() &&
        deliveryDate.getMonth() === today.getMonth() &&
        deliveryDate.getFullYear() === today.getFullYear()
      ) {
        return `Delivered today, ${format(deliveryDate, "MMMM dd")}`;
      }
  
      return `Delivered on ${format(deliveryDate, yearFormat)}`;
    };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <MetaData title="Order Details" />
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
      >
        Order Details
      </motion.h2>

      {loading ? (
        <div className="text-center">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error" className="max-w-2xl mx-auto">
          {error}
        </Alert>
      ) : order ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-6 max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Order ID: <span className="font-mono">{order._id}</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm ${handleStatus(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>

          {["PENDING", "SHIPPED", "DELIVERED"].includes(order.orderStatus) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6"
            >
              <div className="flex justify-between items-center px-4">
                {statusOrder.map((status, index) => (
                  <StatusStep
                    key={status}
                    step={status}
                    index={index}
                    currentStatus={order.orderStatus}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <FiMapPin className="text-blue-500" />
                Shipping Address
              </h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p>{order.address.address_line}</p>
                <p>
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.pincode}
                </p>
                <p>{order.address.country}</p>
                <p className="mt-4 font-medium">📱 {order.address.mobile}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Payment & Delivery
              </h4>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{order.totalAmount}
                </p>
                <p>
                  <strong>Tracking ID:</strong>{" "}
                  {order.trackingId || "Not available yet"}
                </p>
                <p>
                  <strong>Delivery:</strong>{" "}
                  {formatDeliveryDate(order.deliveryDate)}
                </p>
              </div>
            </motion.div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Ordered Items
            </h4>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {order.products?.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600"
                >
                  <Link to={`/product/${item.product._id}`} className="block">
                    <img
                      src={
                        item.product?.images?.[0]?.url || "/default-image.jpg"
                      }
                      alt={item.product?.name}
                      className="w-20 h-20 object-contain rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.product?.name}
                      </h5>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300 flex-wrap">
                        <span>Quantity: {item.quantity}</span>
                        {item.selectedColor && (
                          <span className="flex items-center">
                            Color:{" "}
                            <span
                              className="ml-1 w-4 h-4 rounded-full border"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link
              to={`/order/${order._id}/invoice`}
              className="bg-yellow-500 hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out"
            >
              View Invoice
            </Link>
            {order.orderStatus === "PENDING" && (
              <button
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
              >
                {isLoading ? "Canceling..." : "Cancel Order"}
              </button>
            )}
          </div>

          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleCancelOrder}
            title="Cancel Order"
            message="Are you sure you want to cancel this order? This action cannot be undone."
          />
        </motion.div>
      ) : (
        <Alert severity="info" className="max-w-2xl mx-auto">
          Order not found.
        </Alert>
      )}
    </div>
  );
};

export default OrderDetails;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CircularProgress, Alert } from "@mui/material";
import { Download, ArrowLeft } from "lucide-react";
import { jsPDF } from "jspdf";
import { getSingleOrder } from "@/store/order-slice/order";
import MetaData from "../extras/MetaData";
import { calculateInvoiceSummary } from "../../utils/invoiceCalculator";

const Invoice = () => {
  const { Id } = useParams();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getSingleOrder(Id));
  }, [dispatch, Id]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  const { subtotal } = calculateInvoiceSummary(order?.products || []);
  const discount = order?.discountAmount || 0;

  const handleDownloadPDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.text("Faith AND Fast", 14, y);
    y += 8;
    doc.setFontSize(13);
    doc.text("Tax Invoice", 14, y);
    y += 10;

    // Invoice + order meta
    doc.setFontSize(10);
    doc.text(`Invoice No: INV-${order._id}`, 14, y);
    y += 6;
    doc.text(`Order Date: ${formatDate(order.createdAt)}`, 14, y);
    y += 6;
    doc.text(`Order Status: ${order.orderStatus}`, 14, y);
    y += 10;

    // Billing details
    doc.setFontSize(12);
    doc.text("Billed To", 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`${order.user?.name || "Customer"}`, 14, y);
    y += 6;
    if (order.user?.email) {
      doc.text(`${order.user.email}`, 14, y);
      y += 6;
    }
    if (order.address) {
      doc.text(`${order.address.address_line || ""}`, 14, y);
      y += 6;
      doc.text(
        `${order.address.city || ""}, ${order.address.state || ""} ${
          order.address.pincode || ""
        }`,
        14,
        y
      );
      y += 6;
      doc.text(`${order.address.country || ""}`, 14, y);
      y += 6;
      if (order.address.mobile) {
        doc.text(`Phone: ${order.address.mobile}`, 14, y);
        y += 6;
      }
    }
    y += 6;

    // Items header
    doc.setFontSize(12);
    doc.text("Items", 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.text("Product", 14, y);
    doc.text("Qty", 120, y);
    doc.text("Unit", 140, y);
    doc.text("Total", 170, y);
    y += 2;
    doc.line(14, y, 196, y);
    y += 6;

    // Items
    doc.setFontSize(9);
    order.products.forEach((item) => {
      const name = item.product?.name || "Product";
      const truncated = name.length > 50 ? name.slice(0, 47) + "..." : name;
      doc.text(truncated, 14, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`Rs. ${Number(item.price || 0).toFixed(2)}`, 140, y);
      doc.text(`Rs. ${Number(item.totalPrice || 0).toFixed(2)}`, 170, y);
      y += 6;
      if (item.selectedColor || item.selectedSize) {
        doc.setFontSize(8);
        doc.setTextColor(120);
        const variant = [
          item.selectedColor ? `Color: ${item.selectedColor}` : "",
          item.selectedSize ? `Size: ${item.selectedSize}` : "",
        ]
          .filter(Boolean)
          .join("  ");
        doc.text(variant, 16, y);
        doc.setTextColor(0);
        doc.setFontSize(9);
        y += 6;
      }
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    y += 2;
    doc.line(14, y, 196, y);
    y += 8;

    // Totals
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 130, y);
    y += 6;
    if (discount > 0) {
      doc.text(`Discount: - Rs. ${Number(discount).toFixed(2)}`, 130, y);
      y += 6;
      if (order.couponCode) {
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Coupon: ${order.couponCode}`, 130, y);
        doc.setTextColor(0);
        doc.setFontSize(10);
        y += 6;
      }
    }
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs. ${Number(order.totalAmount).toFixed(2)}`, 130, y);
    y += 10;

    // Payment
    doc.setFontSize(10);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, y);
    y += 6;
    doc.text(`Payment Status: ${order.paymentStatus}`, 14, y);

    doc.save(`invoice-${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <CircularProgress />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4">
        <Alert severity="info" className="max-w-2xl mx-auto">
          Invoice not available — order not found.
        </Alert>
        <div className="text-center mt-6">
          <Link
            to="/my-orders"
            className="text-yellow-600 dark:text-red-400 hover:underline"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-all duration-300">
      <MetaData title={`Invoice ${order._id} | Faith AND Fast`} />

      <div className="max-w-3xl mx-auto">
        {/* Action bar — hidden when printing */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            to={`/order/${order._id}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        {/* Invoice card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Faith <span className="text-yellow-500 dark:text-red-500">AND</span> Fast
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tax Invoice
              </p>
            </div>
            <div className="sm:text-right text-sm text-gray-600 dark:text-gray-300">
              <p className="font-mono break-all">
                <span className="font-semibold">Invoice:</span> INV-{order._id}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {formatDate(order.createdAt)}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {order.orderStatus}
              </p>
            </div>
          </div>

          {/* Billing details */}
          <div className="grid sm:grid-cols-2 gap-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                Billed To
              </h2>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {order.user?.name || "Customer"}
              </p>
              {order.user?.email && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.user.email}
                </p>
              )}
              {order.address && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-0.5">
                  <p>{order.address.address_line}</p>
                  <p>
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.pincode}
                  </p>
                  <p>{order.address.country}</p>
                  {order.address.mobile && <p>📱 {order.address.mobile}</p>}
                </div>
              )}
            </div>
            <div className="sm:text-right">
              <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                Payment
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Method:</span>{" "}
                {order.paymentMethod}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Status:</span>{" "}
                {order.paymentStatus}
              </p>
              {order.deliveryDate && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  <span className="font-medium">Delivery:</span>{" "}
                  {formatDate(order.deliveryDate)}
                </p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {item.product?.images?.[0]?.url && (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product?.name || "Product"}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.product?.name || "Product"}
                          </p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.selectedColor &&
                                `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && " · "}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-gray-700 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                      ₹{Number(item.totalPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>
                    Discount
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span>- ₹{Number(discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                <span>Grand Total</span>
                <span>₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            Thank you for shopping with Faith AND Fast.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Invoice;

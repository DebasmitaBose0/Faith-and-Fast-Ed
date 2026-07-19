/**
 * Helper utilities for computing receipt subtotals, tax details, and formats.
 */
export const calculateInvoiceSummary = (products = [], discount = 0) => {
  const subtotal = products.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const gst = subtotal * 0.18; // 18% GST standard
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + gst - discountAmount;

  return {
    subtotal,
    gst,
    discountAmount,
    total,
  };
};

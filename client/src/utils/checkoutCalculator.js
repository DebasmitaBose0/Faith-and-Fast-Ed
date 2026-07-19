/**
 * Helper utilities for computing receipt subtotals, tax details, and formats.
 * Supporting discount percentage and optional referral code commission calculation.
 */
export const calculateInvoiceSummary = (products = [], discount = 0, referralDiscount = 0) => {
  const subtotal = products.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const gst = subtotal * 0.18; // 18% GST standard
  const discountAmount = subtotal * (discount / 100);
  const referralDiscountAmount = subtotal * (referralDiscount / 100);
  const total = Math.max(0, subtotal + gst - discountAmount - referralDiscountAmount);

  return {
    subtotal,
    gst,
    discountAmount,
    referralDiscountAmount,
    total,
  };
};

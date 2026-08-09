import { jsPDF } from 'jspdf';

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('Faith AND Fast', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Invoice for Order', 14, 30);
  
  // Order Details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Order ID: ${order._id}`, 14, 40);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 46);
  doc.text(`Status: ${order.orderStatus}`, 14, 52);
  doc.text(`Payment Method: ${order.paymentMethod}`, 14, 58);

  // Customer Details
  doc.setFontSize(12);
  doc.text('Customer Details:', 120, 30);
  doc.setFontSize(10);
  doc.text(`Name: ${order.shippingAddress?.fullName || 'N/A'}`, 120, 38);
  doc.text(`Email: ${order.user?.email || 'N/A'}`, 120, 44);
  doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 120, 50);

  // Line Separator
  doc.setLineWidth(0.5);
  doc.line(14, 65, 196, 65);

  // Table Headers
  doc.setFontSize(11);
  doc.text('Product', 14, 75);
  doc.text('Quantity', 100, 75);
  doc.text('Price', 140, 75);
  doc.text('Total', 170, 75);

  // Line Separator
  doc.line(14, 79, 196, 79);

  // Table Content
  let yPos = 87;
  doc.setFontSize(10);
  
  if (order.orderItems && order.orderItems.length > 0) {
    order.orderItems.forEach(item => {
      const name = item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name;
      doc.text(name, 14, yPos);
      doc.text(item.quantity.toString(), 100, yPos);
      doc.text(`$${item.price.toFixed(2)}`, 140, yPos);
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 170, yPos);
      yPos += 10;
    });
  }

  // Line Separator
  doc.line(14, yPos + 2, 196, yPos + 2);

  // Totals
  yPos += 12;
  doc.setFontSize(11);
  doc.text(`Subtotal:`, 140, yPos);
  doc.text(`$${order.itemsPrice?.toFixed(2) || '0.00'}`, 170, yPos);
  
  yPos += 8;
  doc.text(`Tax:`, 140, yPos);
  doc.text(`$${order.taxPrice?.toFixed(2) || '0.00'}`, 170, yPos);
  
  yPos += 8;
  doc.text(`Shipping:`, 140, yPos);
  doc.text(`$${order.shippingPrice?.toFixed(2) || '0.00'}`, 170, yPos);

  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0); // Red color for Total
  doc.text(`Total:`, 140, yPos);
  doc.text(`$${order.totalPrice?.toFixed(2) || '0.00'}`, 170, yPos);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing Faith AND Fast!', 105, 280, { align: 'center' });

  // Generate buffer
  return Buffer.from(doc.output('arraybuffer'));
};

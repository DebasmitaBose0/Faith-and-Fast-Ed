const generateReceiptHTML = (order) => {
  const {
    user,
    products,
    totalAmount,
    orderStatus,
    paymentMethod,
    deliveryDate,
  } = order;

  const formatDateOnly = (date) => {
    if (!date) return "To be delivered";
    // Use toLocaleDateString with options for "Month Day, Year" format
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formattedDeliveryDate = formatDateOnly(deliveryDate); // Pre-format the date

  const productList = products
    .map((item) => {
      const productImage =
        item.product.images && item.product.images.length > 0
          ? item.product.images[0].url
          : "";

      return `
      <tr>
        <td><img src="${productImage}" alt="${item.product.name}" width="50" height="50" /></td>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td>${item.totalPrice}</td>
      </tr>
    `;
    })
    .join("");

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 800px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h2, h3 { color: #333; }
          p, td { font-size: 14px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .receipt-footer { margin-top: 20px; font-size: 12px; text-align: center; color: #777; }
          .download-btn { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-align: center; text-decoration: none; }
          .download-btn:hover { background-color: #45a049; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for shopping with Faith AND Fast. Your order has been successfully placed. Below are the order details:</p>

          <h3>Order Details:</h3>
          <table>
            <tr><th>Order Status</th><td>${orderStatus}</td></tr>
            <tr><th>Payment Method</th><td>${paymentMethod}</td></tr>
            <tr><th>Delivery Date</th><td>${formattedDeliveryDate} by 10 PM (expected)</td></tr>
          </table>

          <h3>Products Ordered:</h3>
          <table>
            <thead>
              <tr>
                <th>Product Image</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${productList}
            </tbody>
          </table>

          <h3>Order Summary:</h3>
          <table>
            <tr><th>Subtotal (inclusive of taxes)</th><td>₹${totalAmount}</td></tr>
          </table>

          <div class="receipt-footer">
            <p>We will notify you once your order has been shipped.</p>
            <p>Thank you for choosing Faith AND Fast!</p>
            <p><strong>Contact Us:</strong> support@faithandfast.com</p>
            <p><strong><a href="https://www.faithandfast.com">Faith AND Fast</a></strong></p>
          </div>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', function () {
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download Receipt as PDF';
            downloadBtn.className = 'download-btn';
            downloadBtn.style.display = 'block';
            downloadBtn.style.margin = '20px auto';
            document.body.appendChild(downloadBtn);

            downloadBtn.addEventListener('click', function () {
              const { jsPDF } = window.jspdf; // Assumes jsPDF is loaded globally
              const doc = new jsPDF();
              
              doc.text('Order Confirmation', 20, 20);
              doc.text('Dear ${user.name},', 20, 30);
              doc.text('Thank you for shopping with Faith AND Fast.', 20, 40);
              
              let y = 50;
              ${products
                .map((item) => {
                  return `
                  doc.text('${item.product.name} x ${item.quantity} - ${item.totalPrice}', 20, y);
                  y += 10;
                `;
                })
                .join("")}
              
              doc.save('receipt.pdf');
            });
          });
        </script>
      </body>
    </html>
  `;
};

export default generateReceiptHTML;
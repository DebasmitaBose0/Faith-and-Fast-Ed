import { useEffect } from "react";
import { toast } from "react-toastify";

const NotificationCenter = () => {
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";
    const eventSource = new EventSource(`${backendUrl}/api/notification/subscribe`);

    eventSource.onmessage = (event) => {
      console.log("SSE Connect message:", event.data);
    };

    eventSource.addEventListener("new_order", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast.success(`🎉 New Order placed by ${data.customerName}! Total: ₹${data.totalAmount}`, {
          position: "bottom-right",
          autoClose: 5000,
        });
      } catch (err) {
        console.error("Error parsing order notification:", err);
      }
    });

    eventSource.addEventListener("low_stock", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast.warning(`⚠ Warning: Product "${data.name}" is low on stock (${data.stock} units remaining)!`, {
          position: "bottom-right",
          autoClose: 6000,
        });
      } catch (err) {
        console.error("Error parsing stock notification:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn("SSE connection error, reconnecting:", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return null; // Side-effect only component
};

export default NotificationCenter;

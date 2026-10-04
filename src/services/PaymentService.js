// src/services/PaymentService.js
// All Razorpay interactions are encapsulated here following OOP standards
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

class PaymentService {
  /**
   * Creates a Razorpay order on our backend for the given booking.
   * Returns the order details needed to open the Razorpay checkout modal.
   */
  async createOrder(bookingId) {
    const res = await api.post("/payments/create-order", { bookingId });
    return res.data.data;
  }

  /**
   * Verifies the Razorpay payment signature on our backend.
   * This confirms the booking and issues the ticket.
   */
  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId }) {
    const res = await api.post("/payments/verify", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    });
    return res.data.data;
  }

  /**
   * Opens the Razorpay checkout modal.
   * Returns a Promise that resolves with payment response or rejects on failure/dismiss.
   */
  loadRazorpay() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Opens the Razorpay checkout modal.
   * Returns a Promise that resolves with payment response or rejects on failure/dismiss.
   */
  async openCheckout({ orderId, amount, currency, keyId, bookingRef, userName, userEmail, userContact }) {
    const isLoaded = await this.loadRazorpay();
    return new Promise((resolve, reject) => {
      if (!isLoaded || !window.Razorpay) {
        reject(new Error("Razorpay SDK failed to load. Are you offline or using an adblocker?"));
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Metro Ticketing System",
        description: `Ticket for Booking ${bookingRef}`,
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userContact,
        },
        theme: { color: "#12213A" },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  { method: "upi" }
                ],
              },
              cards: {
                name: "Pay via Cards",
                instruments: [
                  { method: "card" }
                ],
              },
              other: {
                name: "Other Methods",
                instruments: [
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.upi", "block.cards", "block.other"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled by user")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => reject(new Error(response.error.description)));
      rzp.open();
    });
  }
}

export default new PaymentService();

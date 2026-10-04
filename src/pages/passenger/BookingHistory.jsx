import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import paymentService from "../../services/PaymentService";
import { useAuth } from "../../context/AuthContext";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBookingHistory();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (booking) => {
    setPaymentLoading(booking.id);
    try {
      // Create Razorpay order
      const order = await paymentService.createOrder(booking.id);

      // Open checkout
      const paymentResponse = await paymentService.openCheckout({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        bookingRef: order.bookingRef,
        userName: user?.name || "",
        userEmail: user?.email || "",
        userContact: user?.contact || "",
      });

      // Verify payment
      await paymentService.verifyPayment({
        ...paymentResponse,
        bookingId: booking.id,
      });

      // Refresh list
      alert("Payment successful! Your ticket has been issued.");
      fetchBookings();
    } catch (err) {
      if (err.message !== "Payment cancelled by user") {
        alert(err.response?.data?.message || err.message || "Payment failed. Please try again.");
      }
    } finally {
      setPaymentLoading(null);
    }
  };

  const handleCancel = async (bookingRef) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await apiService.cancelBooking(bookingRef);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return <p className="animate-pulse p-10 text-slate">Loading bookings...</p>;
  }

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 3xl:px-16">
      <h1 className="font-display text-h1 font-800 text-ink">My bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-body text-slate">
          No bookings yet — search a route and book your first ticket.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-sm border border-ink/10 bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <p className="text-small text-slate">{b.bookingRef}</p>
                  <span className={`inline-block rounded-sm px-2.5 py-1 text-xs font-bold capitalize ${
                    b.status === "confirmed" ? "bg-green-100 text-green-700" :
                    b.status === "completed" ? "bg-blue-100 text-blue-700" :
                    b.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {b.status.replace("_", " ")}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-h3 font-700 text-ink">{b.route?.summary || "Deleted Route"}</h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-small text-slate">
                  <span>Date: {b.travelDate}</span>
                  <span>Time: {b.schedule?.departureTime || "Any"}</span>
                  <span>Passengers: {b.passengerCount}</span>
                  <span>Fare: ₹{b.fareAmount}</span>
                </div>
              </div>

              {/* Action Buttons based on status */}
              {b.status === "pending_payment" && (
                <div className="mt-4 flex gap-2 border-t border-ink/5 pt-4">
                  <button
                    onClick={() => handleCancel(b.bookingRef)}
                    className="flex-1 rounded-sm border border-ink/15 py-2 text-sm font-semibold text-slate hover:bg-platform-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePayNow(b)}
                    disabled={paymentLoading === b.id}
                    className="flex-1 rounded-sm bg-ink py-2 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50"
                  >
                    {paymentLoading === b.id ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              )}
              {b.status === "confirmed" && (
                <div className="mt-4 border-t border-ink/5 pt-4">
                  <p className="text-xs text-green-600 font-medium">✅ Ticket is active and valid for 2 hours.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
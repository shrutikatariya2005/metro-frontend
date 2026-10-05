import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import paymentService from "../../services/PaymentService";
import { useAuth } from "../../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";

function TicketModal({ booking, onClose }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Priority: Use DB ticket.validUntil, else fallback to 2h from updatedAt/createdAt
    let expiryTime;
    if (booking.ticket?.validUntil) {
      expiryTime = new Date(booking.ticket.validUntil).getTime();
    } else {
      const startTime = new Date(booking.updatedAt || booking.createdAt).getTime();
      expiryTime = startTime + 2 * 60 * 60 * 1000;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("00:00:00");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const qrPayload = JSON.stringify({
    ref: booking.bookingRef,
    ticketRef: booking.ticket?.ticketRef || booking.bookingRef,
    route: booking.route?.summary,
    passengers: booking.passengerCount,
    fare: booking.fareAmount,
    date: booking.travelDate,
  });


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-display font-700 text-lg text-ink">E-Ticket QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none">&times;</button>
        </div>

        {isExpired ? (
          <div className="py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">⏳</div>
            <h4 className="mt-4 font-bold text-gray-800">Ticket Expired</h4>
            <p className="mt-2 text-xs text-gray-500">This 2-hour ticket pass has expired and is no longer valid for entry.</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="mx-auto my-3 inline-block rounded-xl border-4 border-amber-500/20 bg-white p-4 shadow-md">
              <QRCodeSVG value={qrPayload} size={180} level="H" includeMargin />
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600">
              <span>⏳ Expires in:</span>
              <span className="font-mono text-sm">{timeLeft}</span>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left text-xs text-gray-600 space-y-1">
              <p><strong className="text-gray-800">Ref:</strong> {booking.bookingRef}</p>
              <p><strong className="text-gray-800">Route:</strong> {booking.route?.summary}</p>
              <p><strong className="text-gray-800">Passengers:</strong> {booking.passengerCount}</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink-soft"
        >
          Close Ticket
        </button>
      </div>
    </div>
  );
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
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
      const order = await paymentService.createOrder(booking.id);
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

      await paymentService.verifyPayment({
        ...paymentResponse,
        bookingId: booking.id,
      });

      alert("Payment successful! Click on your ticket to view the live QR code.");
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

  // Check if booking is within 2 hours of payment/issue
  const isTicketActive = (b) => {
    if (b.status !== "confirmed") return false;

    // Use DB validUntil timestamp if available
    if (b.ticket?.validUntil) {
      return Date.now() < new Date(b.ticket.validUntil).getTime();
    }

    // Fallback: If payment happened within the last 2 hours
    const paymentTime = new Date(b.updatedAt || b.createdAt).getTime();
    const expiryTime = paymentTime + 2 * 60 * 60 * 1000;
    return Date.now() < expiryTime;
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
          {bookings.map((b) => {
            const active = isTicketActive(b);

            return (
              <div key={b.id} className="rounded-sm border border-ink/10 bg-white p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-small text-slate">{b.bookingRef}</p>
                    <span className={`inline-block rounded-sm px-2.5 py-1 text-xs font-bold capitalize ${
                      b.status === "confirmed" && active ? "bg-green-100 text-green-700" :
                      b.status === "confirmed" && !active ? "bg-gray-100 text-gray-500" :
                      b.status === "completed" ? "bg-blue-100 text-blue-700" :
                      b.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {b.status === "confirmed" && !active ? "Expired Pass" : b.status.replace("_", " ")}
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
                    {active ? (
                      <button
                        onClick={() => setSelectedTicket(b)}
                        className="w-full flex items-center justify-center gap-2 rounded-sm bg-amber py-2.5 text-sm font-bold text-ink hover:bg-amber-dark transition-colors"
                      >
                        📱 View QR Ticket Code
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500 font-medium">⏳ Ticket expired (2 hour pass ended).</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedTicket && (
        <TicketModal booking={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </section>
  );
}
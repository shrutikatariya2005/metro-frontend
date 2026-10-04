import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../services/ApiService";
import paymentService from "../../services/PaymentService";
import { useAuth } from "../../context/AuthContext";

const STEPS = ["Search", "Select Schedule", "Confirm", "Pay", "Ticket"];

export default function BookingFlow() {
  const [step, setStep] = useState(1);

  // Search Step
  const [stations, setStations] = useState([]);
  const [sourceQuery, setSourceQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split("T")[0]);
  const [travelTime, setTravelTime] = useState(""); // HH:MM

  // Schedule Step
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Confirm Step
  const [fare, setFare] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [booking, setBooking] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    apiService.getStations().then(setStations);
  }, []);

  const filteredSource = stations.filter((s) =>
    s.stationName.toLowerCase().includes(sourceQuery.toLowerCase())
  );
  const filteredDest = stations.filter((s) =>
    s.stationName.toLowerCase().includes(destQuery.toLowerCase())
  );

  const handleSearchRoute = async () => {
    setError("");
    if (!sourceId || !destinationId) return setError("Select both source and destination");
    if (sourceId === destinationId) return setError("Source and destination cannot be the same");
    if (!travelDate) return setError("Please select a travel date");

    try {
      const foundRoute = await apiService.searchRoute(sourceId, destinationId);
      const foundSchedules = await apiService.getSchedulesForRoute(foundRoute.id, travelTime || "00:00");
      setRoute(foundRoute);
      setSchedules(foundSchedules);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Route not found");
    }
  };

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      const foundFare = await apiService.calculateFare(route.id, passengerCount);
      setFare(foundFare);
      setStep(3);
    } catch (err) {
      setError("Failed to calculate fare");
    }
  };

  const handlePassengerCountChange = async (count) => {
    setPassengerCount(count);
    if (!route) return;
    try {
      const newFare = await apiService.calculateFare(route.id, count);
      setFare(newFare);
    } catch (err) {
      console.error("Fare calculation error", err);
    }
  };

  const handleConfirmBooking = async () => {
    setError("");
    try {
      const result = await apiService.createBooking({
        route,
        schedule: selectedSchedule,
        passengerCount,
        fareAmount: fare.totalFare,
        travelDate,
      });
      const createdBooking = result.booking;
      setBooking(createdBooking);
      setStep(4); // Move to payment screen
      
      // Auto-trigger Razorpay checkout
      triggerPayment(createdBooking);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Booking failed. Please try again.");
    }
  };

  const triggerPayment = async (bookingToPay) => {
    const targetBooking = bookingToPay || booking;
    if (!targetBooking) return;
    setPaymentLoading(true);
    setError("");
    try {
      const order = await paymentService.createOrder(targetBooking._id || targetBooking.id);
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
      const verified = await paymentService.verifyPayment({
        ...paymentResponse,
        bookingId: targetBooking._id || targetBooking.id,
      });
      setTicket(verified.ticket);
      setBooking(verified.booking);
      setStep(5);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayNow = () => triggerPayment(booking);


  const resetFlow = () => {
    setStep(1);
    setSourceId("");
    setDestinationId("");
    setRoute(null);
    setSchedules([]);
    setSelectedSchedule(null);
    setFare(null);
    setPassengerCount(1);
    setTravelTime("");
    setBooking(null);
    setTicket(null);
    setError("");
    setPaymentLoading(false);
  };

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 3xl:px-16">
      {/* Step indicator */}
      <div className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-small font-700 sm:h-8 sm:w-8 ${
                  step > i + 1
                    ? "bg-route text-white"
                    : step === i + 1
                    ? "bg-amber text-ink"
                    : "bg-ink/10 text-slate"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden text-small font-medium text-ink sm:inline">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="h-[2px] flex-1 bg-ink/10" />}
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-2xl rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
        {error && (
          <p className="mb-4 rounded-sm bg-alert-soft px-4 py-2.5 text-small text-alert">{error}</p>
        )}

        {/* STEP 1 — Search */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 font-700 text-ink">Search station & time</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-small font-medium text-ink">Source station</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={sourceQuery}
                  onChange={(e) => setSourceQuery(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20"
                />
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="mt-2 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body"
                >
                  <option value="">Select source</option>
                  {filteredSource.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-small font-medium text-ink">Destination station</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20"
                />
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="mt-2 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body"
                >
                  <option value="">Select destination</option>
                  {filteredDest.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-small font-medium text-ink">Travel date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body"
                />
              </div>
              <div>
                <label className="block text-small font-medium text-ink">Time (optional)</label>
                <input
                  type="time"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body"
                />
              </div>
            </div>

            <button
              onClick={handleSearchRoute}
              className="mt-4 rounded-sm bg-ink py-3 font-semibold text-platform hover:bg-ink-soft"
            >
              Search trains
            </button>
          </div>
        )}

        {/* STEP 2 — Select Schedule */}
        {step === 2 && route && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 font-700 text-ink">Select a train</h2>
            
            <div className="flex items-center gap-3">
              {route.routeNumber && (
                <span className="inline-block rounded-sm bg-route/10 px-3 py-1 font-mono text-sm font-bold text-route">
                  Route {route.routeNumber}
                </span>
              )}
              <span className="text-body text-ink">{route.summary}</span>
            </div>
            
            {schedules.length === 0 ? (
              <p className="mt-4 rounded-sm bg-amber/10 p-4 text-small text-amber-dark">
                No upcoming schedules found for this route at the selected time.
              </p>
            ) : (
              <div className="mt-2 flex flex-col gap-3">
                {schedules.map(sch => (
                  <button
                    key={sch._id}
                    onClick={() => handleSelectSchedule(sch)}
                    className="flex w-full items-center justify-between rounded-sm border border-ink/15 p-4 text-left transition-colors hover:border-route hover:bg-route-soft"
                  >
                    <div>
                      <p className="font-display text-lg font-700 text-ink">{sch.departureTime}</p>
                      <p className="text-small text-slate">Departs from {route.sourceStation.stationName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-700 text-ink">{sch.arrivalTime}</p>
                      <p className="text-small text-slate">Arrives {route.destinationStation.stationName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              className="mt-4 rounded-sm border border-ink/15 py-3 font-semibold text-ink"
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 3 — Confirm */}
        {step === 3 && route && fare && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 font-700 text-ink">Confirm booking</h2>
            
            <div className="rounded-sm bg-platform-100 p-4">
              <p className="text-body font-medium text-ink">{route.summary}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-small text-slate">
                <p>Date: {travelDate}</p>
                <p>Time: {selectedSchedule.departureTime}</p>
                <p>Distance: {route.distanceKm} km</p>
                <p>Stops: {route.stops}</p>
              </div>
            </div>

            <div>
              <label className="block text-small font-medium text-ink">Number of passengers</label>
              <input
                type="number"
                min="1"
                value={passengerCount}
                onChange={(e) => handlePassengerCountChange(Number(e.target.value) || 1)}
                className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body"
              />
            </div>

            <div className="rounded-sm bg-route-soft px-4 py-3 text-body text-route">
              <p>Base fare: <strong>₹{fare.baseFare}</strong> × {fare.passengerCount} passenger(s)</p>
              <p className="mt-1 font-700">Total: ₹{fare.totalFare}</p>
              <p className="mt-1 text-small text-slate">Sitilink slab fare — distance {route.distanceKm} km</p>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-sm border border-ink/15 py-3 font-semibold text-ink"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 rounded-sm bg-amber py-3 font-semibold text-ink hover:bg-amber-dark"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Pay */}
        {step === 4 && booking && (
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-h2 font-700 text-ink">Complete Payment</h2>

            <div className="rounded-sm border border-dashed border-ink/20 p-5">
              <p className="text-small text-slate">Booking Reference (Pending Payment)</p>
              <p className="font-display text-h3 font-700 tracking-wide text-ink">{booking.bookingRef}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-small text-slate">
                <p>Route: {route?.summary}</p>
                <p>Date: {travelDate}</p>
                <p>Time: {selectedSchedule?.departureTime}</p>
                <p>Passengers: {passengerCount}</p>
              </div>
              <div className="mt-4 rounded-sm bg-route-soft px-4 py-3">
                <p className="text-body font-700 text-route">Total Amount: ₹{booking.fareAmount}</p>
              </div>
            </div>

            {error && <p className="rounded-sm bg-alert-soft px-4 py-2 text-small text-alert">{error}</p>}

            <button
              onClick={handlePayNow}
              disabled={paymentLoading}
              className="w-full rounded-sm bg-ink py-4 font-display text-lg font-700 text-white hover:bg-ink-soft disabled:opacity-50"
            >
              {paymentLoading ? "Processing..." : `Pay ₹${booking.fareAmount} via Razorpay`}
            </button>
            <button
              onClick={() => setStep(3)}
              className="text-sm text-slate hover:underline"
            >
              Go back
            </button>
          </div>
        )}

        {/* STEP 5 — Ticket */}
        {step === 5 && booking && (
          <div className="flex flex-col gap-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-route-soft text-route text-2xl">
              ✓
            </span>
            <h2 className="font-display text-h2 font-700 text-ink">Payment Successful!</h2>
            <p className="text-body text-slate">Your ticket has been confirmed. Have a safe journey!</p>

            <div className="rounded-sm border border-dashed border-ink/20 p-5 text-left">
              <p className="text-small text-slate">Booking Reference</p>
              <p className="font-display text-h3 font-700 tracking-wide text-ink">{booking.bookingRef}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-small text-slate">
                <p>Date: {booking.travelDate}</p>
                <p>Time: {selectedSchedule?.departureTime}</p>
                <p>Passengers: {booking.passengerCount}</p>
                <p>Fare paid: ₹{booking.fareAmount}</p>
              </div>
              {ticket && (
                <div className="mt-3 rounded-sm bg-platform-100 px-3 py-2">
                  <p className="text-small text-slate">Ticket ID</p>
                  <p className="font-mono text-sm font-medium">{ticket.ticketNumber || ticket._id}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={resetFlow}
                className="flex-1 rounded-sm border border-ink/15 py-3 font-semibold text-ink"
              >
                Book another
              </button>
              <Link
                to="/booking-history"
                className="flex-1 rounded-sm bg-ink py-3 text-center font-semibold text-platform hover:bg-ink-soft"
              >
                View my bookings
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
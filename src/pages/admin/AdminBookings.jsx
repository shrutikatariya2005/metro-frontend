import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    try {
      await apiService.updateBookingStatus(id, status);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating booking status");
    }
  };

  if (loading) return <p className="animate-pulse text-slate">Loading bookings...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">View & Manage Bookings</h1>
      </div>

      <div className="rounded-sm border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-platform-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink">Ref ID</th>
              <th className="px-4 py-3 font-semibold text-ink">Route</th>
              <th className="px-4 py-3 font-semibold text-ink">Date</th>
              <th className="px-4 py-3 font-semibold text-ink">Passengers</th>
              <th className="px-4 py-3 font-semibold text-ink">Fare</th>
              <th className="px-4 py-3 font-semibold text-ink">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 font-mono font-medium">{b.bookingRef}</td>
                <td className="px-4 py-3">{b.route?.summary || "Deleted Route"}</td>
                <td className="px-4 py-3 text-slate">{b.travelDate}</td>
                <td className="px-4 py-3 text-slate">{b.passengerCount}</td>
                <td className="px-4 py-3 font-mono">₹{b.fareAmount}</td>
                <td className="px-4 py-3 capitalize font-semibold">
                  <span className={`rounded-sm px-2 py-0.5 text-xs ${
                    b.status === "confirmed" ? "bg-green-100 text-green-700" :
                    b.status === "completed" ? "bg-blue-100 text-blue-700" :
                    b.status === "pending_payment" ? "bg-amber/20 text-amber-dark" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {b.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(b.id, "completed")}
                        className="mr-3 text-blue-600 hover:underline font-medium"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(b.id, "cancelled")}
                        className="text-alert hover:underline font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {b.status !== "confirmed" && <span className="text-slate/50">N/A</span>}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

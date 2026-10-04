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

  if (loading) return <p style={{ color: "#94a3b8" }}>Loading bookings...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", margin: "0 0 4px 0" }}>Manage Bookings</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>View passenger bookings and manage ticket statuses.</p>
      </div>

      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", textAlign: "left", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f172a", borderBottom: "1px solid #334155", color: "#cbd5e1" }}>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Ref ID</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Route</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Date</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Passengers</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fare</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #334155" }}>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#f8fafc" }}>{b.bookingRef}</td>
                <td style={{ padding: "12px 16px", color: "#e2e8f0" }}>{b.route?.summary || "Deleted Route"}</td>
                <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{b.travelDate}</td>
                <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{b.passengerCount}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#f8fafc" }}>₹{b.fareAmount}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background:
                      b.status === "confirmed" ? "#064e3b" :
                      b.status === "completed" ? "#1e3a8a" :
                      b.status === "pending_payment" ? "#78350f" : "#7f1d1d",
                    color:
                      b.status === "confirmed" ? "#6ee7b7" :
                      b.status === "completed" ? "#93c5fd" :
                      b.status === "pending_payment" ? "#fde68a" : "#fca5a5"
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  {b.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(b.id, "completed")}
                        style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", marginRight: 12, fontWeight: 500 }}
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(b.id, "cancelled")}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 500 }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {b.status !== "confirmed" && <span style={{ color: "#64748b" }}>N/A</span>}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
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


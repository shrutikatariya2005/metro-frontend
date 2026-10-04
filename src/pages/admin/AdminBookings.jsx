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

  if (loading) return <p style={{ color: "#5B6472" }}>Loading bookings...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#12213A", fontFamily: "'Archivo Expanded', sans-serif", margin: "0 0 4px 0" }}>Manage Bookings</h1>
        <p style={{ fontSize: 14, color: "#5B6472", margin: 0 }}>View passenger bookings and manage ticket statuses.</p>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid #EDEFF3", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", textAlign: "left", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#EDEFF3", borderBottom: "1px solid #E2E8F0", color: "#12213A" }}>
              <th style={{ padding: "12px 16px", fontWeight: 700 }}>Ref ID</th>
              <th style={{ padding: "12px 16px", fontWeight: 700 }}>Route</th>
              <th style={{ padding: "12px 16px", fontWeight: 700 }}>Date</th>
              <th style={{ padding: "12px 16px", fontWeight: 700 }}>Passengers</th>
              <th style={{ padding: "12px 16px", fontWeight: 700 }}>Fare</th>
              <th style={{ padding: "12px 16px", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "12px 16px", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #EDEFF3" }}>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600, color: "#12213A" }}>{b.bookingRef}</td>
                <td style={{ padding: "12px 16px", color: "#1E3354" }}>{b.route?.summary || "Deleted Route"}</td>
                <td style={{ padding: "12px 16px", color: "#5B6472" }}>{b.travelDate}</td>
                <td style={{ padding: "12px 16px", color: "#5B6472" }}>{b.passengerCount}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600, color: "#12213A" }}>₹{b.fareAmount}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    background:
                      b.status === "confirmed" ? "#E6F2ED" :
                      b.status === "completed" ? "#DBEAFE" :
                      b.status === "pending_payment" ? "#FEF3C7" : "#FBEAEA",
                    color:
                      b.status === "confirmed" ? "#1F7A5C" :
                      b.status === "completed" ? "#1D4ED8" :
                      b.status === "pending_payment" ? "#D97706" : "#D64545"
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  {b.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(b.id, "completed")}
                        style={{ background: "none", border: "none", color: "#1F7A5C", cursor: "pointer", marginRight: 12, fontWeight: 600 }}
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(b.id, "cancelled")}
                        style={{ background: "none", border: "none", color: "#D64545", cursor: "pointer", fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {b.status !== "confirmed" && <span style={{ color: "#94A3B8" }}>N/A</span>}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#5B6472" }}>
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



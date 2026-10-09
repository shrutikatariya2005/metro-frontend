import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import * as XLSX from "xlsx";

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

  const exportBookings = () => {
    if (!bookings.length) return alert("No bookings to export");
    const data = bookings.map((b, i) => ({
      "Sr. No.": i + 1,
      "Ref ID": b.bookingRef,
      "Route": b.route?.summary || "Deleted Route",
      "Passenger Name": b.user?.name || "N/A",
      "Email": b.user?.email || "N/A",
      "Contact": b.user?.contact || "N/A",
      "PAN": b.user?.pan || "N/A",
      "Aadhar": b.user?.aadhar || "N/A",
      "Address": b.user?.address || "N/A",
      "Qualification": b.user?.qualification || "N/A",
      "Ticket Price (₹)": b.fareAmount,
      "Passengers": b.passengerCount,
      "Status": b.status,
      "Date": b.travelDate,
    }));

    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [
      ["All Bookings Report"],
      [`Report Generated On: ${new Date().toLocaleString()}`],
      []
    ]);
    XLSX.utils.sheet_add_json(ws, data, { origin: "A4" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `Bookings_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <p style={{ color: "#5B6472" }}>Loading bookings...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#12213A", fontFamily: "'Archivo Expanded', sans-serif", margin: "0 0 4px 0" }}>View Bookings</h1>
          <p style={{ fontSize: 14, color: "#5B6472", margin: 0 }}>View passenger bookings across the metro network.</p>
        </div>
        <button
          onClick={exportBookings}
          style={{ background: "#12213A", color: "#FFFFFF", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
        >
          Export Excel
        </button>
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
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#5B6472" }}>
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



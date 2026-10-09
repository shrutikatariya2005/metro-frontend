import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import * as XLSX from "xlsx";

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dateRangeType, setDateRangeType] = useState("30days"); // "7days", "30days", "monthly", "yearly", "custom"
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      let startDate = "";
      let endDate = new Date().toISOString().slice(0, 10);

      const d = new Date();
      if (dateRangeType === "7days") {
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().slice(0, 10);
      } else if (dateRangeType === "30days") {
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().slice(0, 10);
      } else if (dateRangeType === "monthly") {
        d.setDate(1); // start of this month
        startDate = d.toISOString().slice(0, 10);
      } else if (dateRangeType === "yearly") {
        d.setMonth(0, 1); // start of this year
        startDate = d.toISOString().slice(0, 10);
      } else if (dateRangeType === "custom") {
        if (!customStart || !customEnd) {
          setLoading(false);
          return; // wait for both
        }
        startDate = customStart;
        endDate = customEnd;
      }

      const [sum, routes, rev, fb] = await Promise.all([
        apiService.getReportsSummary(startDate, endDate),
        apiService.getPopularRoutes(10, startDate, endDate),
        apiService.getRevenueByDate(startDate, endDate),
        apiService.getFeedbackStats(), // feedback usually all-time or needs filter too
      ]);
      setSummary(sum);
      setPopularRoutes(routes);
      setRevenue(rev);
      setFeedback(fb);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeType, customStart, customEnd]);

  const exportToExcel = (data, filename, title) => {
    const dataWithSrNo = data.map((item, i) => ({ "Sr. No.": i + 1, ...item }));
    
    const ws = XLSX.utils.json_to_sheet([]);
    
    const rangeText = dateRangeType === "custom" ? `${customStart} to ${customEnd}` : dateRangeType;
    XLSX.utils.sheet_add_aoa(ws, [
      [title],
      [`Report Generated On: ${new Date().toLocaleString()}`],
      [`Date Filter: ${rangeText}`],
      []
    ]);
    
    XLSX.utils.sheet_add_json(ws, dataWithSrNo, { origin: "A5" });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportRevenue = async () => {
    try {
      let startDate = "";
      let endDate = new Date().toISOString().slice(0, 10);
      const d = new Date();
      if (dateRangeType === "7days") { d.setDate(d.getDate() - 7); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "30days") { d.setDate(d.getDate() - 30); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "monthly") { d.setDate(1); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "yearly") { d.setMonth(0, 1); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "custom") { startDate = customStart; endDate = customEnd; }

      const bookings = await apiService.getDetailedBookings(startDate, endDate);
      if (!bookings || bookings.length === 0) return alert("No revenue data to export");

      const grouped = {};
      bookings.forEach((b) => {
        const monthYear = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        const routeName = `${b.route.sourceStation.stationName} to ${b.route.destinationStation.stationName}`;
        const ticketPrice = b.fareAmount / b.passengerCount;
        const key = `${monthYear}|${routeName}|${ticketPrice}`;

        if (!grouped[key]) {
          grouped[key] = {
            "Month": monthYear,
            "Route Name": routeName,
            "Ticket Price (₹)": ticketPrice,
            "Tickets Booked": 0,
            "Total Revenue (₹)": 0,
          };
        }
        grouped[key]["Tickets Booked"] += b.passengerCount;
        grouped[key]["Total Revenue (₹)"] += b.fareAmount;
      });

      const data = Object.values(grouped);
      exportToExcel(data, "Monthly_Revenue_Report", "Monthly Revenue Report");
    } catch (err) {
      console.error(err);
      alert("Error exporting revenue report");
    }
  };

  const exportRoutes = () => {
    if (!popularRoutes.length) return alert("No route data to export");
    const data = popularRoutes.map((r) => ({
      Route: r.summary,
      Bookings: r.count,
      TotalRevenue: r.totalRevenue,
    }));
    exportToExcel(data, "Popular_Routes_Report", "Route Wise Booking Report");
  };

  const exportDetailed = async () => {
    try {
      let startDate = "";
      let endDate = new Date().toISOString().slice(0, 10);
      const d = new Date();
      if (dateRangeType === "7days") { d.setDate(d.getDate() - 7); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "30days") { d.setDate(d.getDate() - 30); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "monthly") { d.setDate(1); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "yearly") { d.setMonth(0, 1); startDate = d.toISOString().slice(0, 10); }
      else if (dateRangeType === "custom") { startDate = customStart; endDate = customEnd; }

      const bookings = await apiService.getDetailedBookings(startDate, endDate);
      if (!bookings || bookings.length === 0) return alert("No bookings found in this range");

      const data = bookings.map(b => ({
        "Booking Ref": b.bookingRef,
        "Travel Date": b.travelDate,
        "Booking Date": new Date(b.createdAt).toLocaleString(),
        "Route": `${b.route.sourceStation.stationName} to ${b.route.destinationStation.stationName}`,
        "Schedule Time": b.schedule ? `${b.schedule.departureTime} - ${b.schedule.arrivalTime}` : "N/A",
        "Passengers": b.passengerCount,
        "Fare (₹)": b.fareAmount,
        "Payment Method": b.paymentInfo ? b.paymentInfo.method.toUpperCase() : "N/A",
        "Transaction ID": b.paymentInfo ? b.paymentInfo.transactionId : "N/A",
        "User Name": b.user.name,
        "User Email": b.user.email,
        "User Contact": b.user.contact || "N/A",
        "User PAN": b.user.pan || "N/A",
        "User Aadhar": b.user.aadhar || "N/A",
        "User Address": b.user.address || "N/A",
      }));
      exportToExcel(data, "Detailed_Bookings_Report", "Detailed Booking Normal Report");
    } catch (err) {
      console.error(err);
      alert("Error exporting detailed report");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">Reports & Statistics</h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={exportDetailed}
            className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-soft shadow-sm"
          >
            Download Normal Report
          </button>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-sm border border-ink/10 shadow-sm">
          <select
            value={dateRangeType}
            onChange={(e) => setDateRangeType(e.target.value)}
            className="rounded border border-ink/15 px-3 py-1.5 text-small text-ink focus:border-route focus:outline-none"
          >
            <option value="7days">Last 7 Days (Weekly)</option>
            <option value="30days">Last 30 Days</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRangeType === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded border border-ink/15 px-2 py-1.5 text-small text-ink focus:border-route focus:outline-none"
              />
              <span className="text-slate">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded border border-ink/15 px-2 py-1.5 text-small text-ink focus:border-route focus:outline-none"
              />
            </div>
          )}
        </div>
        </div>
      </div>

      {loading && !summary ? (
        <p className="animate-pulse text-slate">Loading reports...</p>
      ) : !summary ? (
        <p className="text-slate">Failed to load report data.</p>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-sm border border-ink/10 bg-white p-5">
              <p className="text-small font-medium text-slate">Total Revenue</p>
              <p className="mt-2 font-display text-h2 font-700 text-route">₹{summary.totalRevenue}</p>
            </div>
            <div className="rounded-sm border border-ink/10 bg-white p-5">
              <p className="text-small font-medium text-slate">Total Bookings</p>
              <p className="mt-2 font-display text-h2 font-700 text-ink">{summary.totalBookings}</p>
              <p className="mt-1 text-xs text-slate">
                {summary.confirmedBookings} confirmed / {summary.completedBookings} completed
              </p>
            </div>
            <div className="rounded-sm border border-ink/10 bg-white p-5">
              <p className="text-small font-medium text-slate">Total Users</p>
              <p className="mt-2 font-display text-h2 font-700 text-ink">{summary.totalUsers}</p>
            </div>
            <div className="rounded-sm border border-ink/10 bg-white p-5">
              <p className="text-small font-medium text-slate">Total Stations & Routes</p>
              <p className="mt-2 font-display text-h2 font-700 text-ink">
                {summary.totalStations} <span className="text-sm font-normal text-slate">/ {summary.totalRoutes}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Popular Routes */}
            <div className="rounded-sm border border-ink/10 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-700">Top Routes (by Bookings)</h2>
                <button
                  onClick={exportRoutes}
                  className="rounded bg-platform-100 px-3 py-1.5 text-xs font-medium text-route transition-colors hover:bg-platform-200"
                >
                  Export Excel
                </button>
              </div>
              {popularRoutes.length > 0 ? (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {popularRoutes.map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded bg-platform-50 p-3">
                      <div>
                        <p className="font-medium text-ink">{r.summary}</p>
                        <p className="text-xs text-slate">{r.count} bookings</p>
                      </div>
                      <p className="font-bold text-route">₹{r.totalRevenue}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate">No booking data found for this period.</p>
              )}
            </div>

            {/* Feedback Stats */}
            <div className="rounded-sm border border-ink/10 bg-white p-6">
              <h2 className="mb-4 font-display text-lg font-700">Customer Satisfaction (All Time)</h2>
              {feedback && feedback.totalFeedback > 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-amber text-h2 font-800 text-ink">
                      {feedback.averageRating}
                    </div>
                    <div>
                      <p className="font-medium text-ink">Average Rating</p>
                      <p className="text-sm text-slate">Based on {feedback.totalFeedback} reviews</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = feedback.distribution[star] || 0;
                      const pct = Math.round((count / feedback.totalFeedback) * 100);
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="w-12 text-slate">{star} Stars</span>
                          <div className="flex-1 h-2 overflow-hidden rounded-full bg-ink/10">
                            <div className="h-full bg-route" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="w-8 text-right text-slate">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-slate">No feedback received yet.</p>
              )}
            </div>
          </div>

          {/* Revenue Graph */}
          <div className="rounded-sm border border-ink/10 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-700">Revenue Breakdown (Day-wise)</h2>
              <button
                onClick={exportRevenue}
                className="rounded bg-platform-100 px-3 py-1.5 text-xs font-medium text-route transition-colors hover:bg-platform-200"
              >
                Export Excel
              </button>
            </div>
            {revenue.length > 0 ? (
              <div className="flex h-48 items-end gap-2 border-b border-l border-ink/10 p-2 overflow-x-auto custom-scrollbar pb-6">
                {revenue.map((d, i) => {
                  const maxRev = Math.max(...revenue.map((r) => r.revenue)) || 1;
                  const height = Math.max((d.revenue / maxRev) * 100, 5);
                  return (
                    <div key={i} className="group relative flex flex-1 flex-col items-center justify-end min-w-[20px]">
                      <div
                        className="w-full max-w-[40px] rounded-t-sm bg-route transition-all hover:bg-route-soft"
                        style={{ height: `${height}%` }}
                      ></div>
                      <p className="mt-2 origin-top-left -rotate-45 text-[10px] text-slate absolute top-full">
                        {d.date.slice(5)}
                      </p>
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white group-hover:block z-10">
                        ₹{d.revenue} ({d.bookings} bookings)
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate">No revenue data for the selected period.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

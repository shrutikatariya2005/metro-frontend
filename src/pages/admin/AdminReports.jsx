import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminReports() {
  const [summary, setSummary] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sum, routes, rev, fb] = await Promise.all([
        apiService.getReportsSummary(),
        apiService.getPopularRoutes(5),
        apiService.getRevenueByDate(7),
        apiService.getFeedbackStats(),
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

  if (loading) return <p className="animate-pulse text-slate">Loading reports...</p>;
  if (!summary) return <p className="text-slate">Failed to load report data.</p>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-h2 font-800 text-ink">Reports & Statistics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-sm border border-ink/10 bg-white p-5">
          <p className="text-small font-medium text-slate">Total Revenue</p>
          <p className="mt-2 font-display text-h2 font-700 text-route">₹{summary.totalRevenue}</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-white p-5">
          <p className="text-small font-medium text-slate">Total Bookings</p>
          <p className="mt-2 font-display text-h2 font-700 text-ink">{summary.totalBookings}</p>
          <p className="text-xs text-slate mt-1">{summary.confirmedBookings} confirmed / {summary.completedBookings} completed</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-white p-5">
          <p className="text-small font-medium text-slate">Total Users</p>
          <p className="mt-2 font-display text-h2 font-700 text-ink">{summary.totalUsers}</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-white p-5">
          <p className="text-small font-medium text-slate">Total Stations & Routes</p>
          <p className="mt-2 font-display text-h2 font-700 text-ink">{summary.totalStations} <span className="text-sm font-normal text-slate">/ {summary.totalRoutes}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Popular Routes */}
        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <h2 className="font-display text-lg font-700 mb-4">Top Routes</h2>
          {popularRoutes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {popularRoutes.map((r, i) => (
                <div key={i} className="flex justify-between items-center rounded bg-platform-50 p-3">
                  <div>
                    <p className="font-medium text-ink">{r.summary}</p>
                    <p className="text-xs text-slate">{r.count} bookings</p>
                  </div>
                  <p className="font-bold text-route">₹{r.totalRevenue}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate">No booking data yet.</p>
          )}
        </div>

        {/* Feedback Stats */}
        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <h2 className="font-display text-lg font-700 mb-4">Customer Satisfaction</h2>
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
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
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
      
      {/* Revenue Last 7 Days */}
      <div className="rounded-sm border border-ink/10 bg-white p-6">
        <h2 className="font-display text-lg font-700 mb-4">Revenue (Last 7 Days)</h2>
        {revenue.length > 0 ? (
          <div className="flex h-48 items-end gap-2 border-b border-l border-ink/10 p-2">
            {revenue.map((d, i) => {
              const maxRev = Math.max(...revenue.map(r => r.revenue)) || 1;
              const height = Math.max((d.revenue / maxRev) * 100, 5); // min 5%
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div 
                    className="w-full max-w-[40px] rounded-t-sm bg-route hover:bg-route-soft transition-all"
                    style={{ height: `${height}%` }}
                  ></div>
                  <p className="mt-2 text-xs text-slate -rotate-45 origin-top-left">{d.date.slice(5)}</p>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white group-hover:block">
                    ₹{d.revenue} ({d.bookings} bookings)
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate">No revenue data for the last 7 days.</p>
        )}
      </div>
    </div>
  );
}

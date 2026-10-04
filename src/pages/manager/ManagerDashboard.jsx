import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait until AuthContext finishes restoring the session
    if (loading) return;
    if (!user || !["admin", "manager"].includes(user.role)) {
      setError("Access denied. You must be logged in as a manager or admin.");
      return;
    }
    apiService.getManagerStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || "Failed to load manager stats"));
  }, [loading, user]);

  if (error) return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <p className="rounded-sm bg-red-50 px-4 py-3 text-body text-red-600">{error}</p>
    </section>
  );

  if (!stats) return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <p className="text-body text-slate">Loading statistics...</p>
    </section>
  );

  const maxCount = Math.max(...stats.popularRoutes.map((r) => r.count), 1);

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 3xl:px-16">
      <h1 className="font-display text-h1 font-800 text-ink">Manager dashboard</h1>
      <p className="mt-2 text-body text-slate">Operational statistics and booking trends.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <p className="text-small text-slate">Total bookings</p>
          <p className="mt-1 font-display text-hero font-800 text-ink">{stats.totalBookings}</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <p className="text-small text-slate">Total revenue</p>
          <p className="mt-1 font-display text-hero font-800 text-route">₹{stats.totalRevenue}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-h3 font-700 text-ink">Most booked routes</h2>
        <div className="mt-4 flex flex-col gap-3">
          {stats.popularRoutes.map((r) => (
            <div key={r.summary}>
              <div className="flex justify-between text-small text-ink">
                <span>{r.summary}</span>
                <span>{r.count} booking(s)</span>
              </div>
              <div className="mt-1 h-2.5 w-full rounded-full bg-platform-100">
                <div
                  className="h-2.5 rounded-full bg-amber"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
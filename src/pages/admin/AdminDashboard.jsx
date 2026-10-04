import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      setError("Access denied. Admin login required.");
      return;
    }
    apiService.getAdminOverview()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard data"));
  }, [loading, user]);

  if (error) return (
    <div>
      <p className="rounded-sm bg-red-50 px-4 py-3 text-body text-red-600">{error}</p>
    </div>
  );

  if (!data) return (
    <div>
      <p className="text-body text-slate">Loading dashboard...</p>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-h1 font-800 text-ink">Dashboard Overview</h1>
      <p className="mt-2 text-body text-slate">Manage stations, routes, fares, and bookings.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active stations" value={data.stations.length} />
        <StatCard label="Active routes" value={data.routes.length} />
        <StatCard label="Total bookings" value={data.bookings.length} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-h3 font-700 text-ink">Stations</h2>
          <div className="mt-3 overflow-x-auto rounded-sm border border-ink/10 bg-white">
            <table className="w-full text-left text-small">
              <thead className="bg-platform-100 text-ink">
                <tr>
                  <th className="px-4 py-2.5">Code</th>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Location</th>
                </tr>
              </thead>
              <tbody>
                {data.stations.map((s) => (
                  <tr key={s.id} className="border-t border-ink/5 text-slate">
                    <td className="px-4 py-2.5 font-medium text-ink">{s.stationCode}</td>
                    <td className="px-4 py-2.5">{s.stationName}</td>
                    <td className="px-4 py-2.5">{s.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-display text-h3 font-700 text-ink">Routes</h2>
          <div className="mt-3 overflow-x-auto rounded-sm border border-ink/10 bg-white">
            <table className="w-full text-left text-small">
              <thead className="bg-platform-100 text-ink">
                <tr>
                  <th className="px-4 py-2.5">Route No.</th>
                  <th className="px-4 py-2.5">Route</th>
                  <th className="px-4 py-2.5">Distance</th>
                  <th className="px-4 py-2.5">Est. time</th>
                </tr>
              </thead>
              <tbody>
                {data.routes.map((r) => (
                  <tr key={r.id} className="border-t border-ink/5 text-slate">
                    <td className="px-4 py-2.5">
                      <span className="rounded-sm bg-route/10 px-2 py-0.5 font-mono text-xs font-bold text-route">{r.routeNumber || "—"}</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-ink">{r.summary}</td>
                    <td className="px-4 py-2.5">{r.distanceKm} km</td>
                    <td className="px-4 py-2.5">{r.estimatedTimeMinutes} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-h3 font-700 text-ink">Recent bookings</h2>
        <div className="mt-3 overflow-x-auto rounded-sm border border-ink/10 bg-white">
          <table className="w-full text-left text-small">
            <thead className="bg-platform-100 text-ink">
              <tr>
                <th className="px-4 py-2.5">Reference</th>
                <th className="px-4 py-2.5">Route</th>
                <th className="px-4 py-2.5">Fare</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((b) => (
                <tr key={b.id} className="border-t border-ink/5 text-slate">
                  <td className="px-4 py-2.5 font-medium text-ink">{b.bookingRef}</td>
                  <td className="px-4 py-2.5">{b.route?.summary || "Deleted Route"}</td>
                  <td className="px-4 py-2.5">₹{b.fareAmount}</td>
                  <td className="px-4 py-2.5 capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white p-6">
      <p className="text-small text-slate">{label}</p>
      <p className="mt-1 font-display text-h1 font-800 text-ink">{value}</p>
    </div>
  );
}
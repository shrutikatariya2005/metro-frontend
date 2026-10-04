import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminFares() {
  const [fares, setFares] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [currentFare, setCurrentFare] = useState({
    routeId: "",
    baseFare: "",
    taxRate: "0",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faresData, routesData] = await Promise.all([
        apiService.getAllFares(),
        apiService.getRoutes(),
      ]);
      setFares(faresData || []);
      setRoutes(routesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCurrentFare({ ...currentFare, [e.target.name]: e.target.value });
  };

  const handleRouteSelect = (e) => {
    const selectedRouteId = e.target.value;
    const existingFare = fares.find((f) => f.route?._id === selectedRouteId || f.route === selectedRouteId);
    
    if (existingFare) {
      setCurrentFare({
        routeId: selectedRouteId,
        baseFare: existingFare.baseFare,
        taxRate: existingFare.taxRate || "0",
      });
    } else {
      setCurrentFare({
        routeId: selectedRouteId,
        baseFare: "",
        taxRate: "0",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentFare.routeId) return alert("Please select a route");
    try {
      await apiService.setFare(currentFare.routeId, {
        baseFare: Number(currentFare.baseFare),
        taxRate: Number(currentFare.taxRate),
      });
      fetchData();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving fare");
    }
  };

  const handleEdit = (fare) => {
    setCurrentFare({
      routeId: fare.route?._id || fare.route,
      baseFare: fare.baseFare,
      taxRate: fare.taxRate || 0,
    });
  };

  const resetForm = () => {
    setCurrentFare({
      routeId: "",
      baseFare: "",
      taxRate: "0",
    });
  };

  if (loading) return <p className="animate-pulse text-slate">Loading fares...</p>;

  // Map fares to routes so we can show all routes even if they don't have a fare set
  const routeFaresMap = {};
  fares.forEach((f) => {
    const rId = f.route?._id || f.route;
    if (rId) routeFaresMap[rId] = f;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">Manage Route Fares</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-700">Set Route Fare</h2>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-small font-medium text-ink">Select Route</label>
              <select
                name="routeId"
                value={currentFare.routeId}
                onChange={handleRouteSelect}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route bg-white"
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeNumber || r.summary}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Base Fare (₹)</label>
              <input
                type="number"
                step="0.01"
                name="baseFare"
                value={currentFare.baseFare}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                name="taxRate"
                value={currentFare.taxRate}
                onChange={handleChange}
                required
                min="0"
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-sm bg-ink py-2 text-sm font-semibold text-white hover:bg-ink-soft"
              >
                Save Fare
              </button>
              {currentFare.routeId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-sm border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Column */}
        <div className="rounded-sm border border-ink/10 bg-white lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-platform-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink">Route</th>
                <th className="px-4 py-3 font-semibold text-ink">Base Fare</th>
                <th className="px-4 py-3 font-semibold text-ink">Tax Rate</th>
                <th className="px-4 py-3 font-semibold text-ink">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const fare = routeFaresMap[r.id];
                return (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-medium text-ink">
                      {r.routeNumber || r.summary}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {fare ? `₹${fare.baseFare}` : "-"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {fare ? `${fare.taxRate || 0}%` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {fare ? (
                        <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Set</span>
                      ) : (
                        <span className="rounded-sm bg-amber/20 px-2 py-0.5 text-xs font-bold text-amber">Not Set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fare ? (
                        <button
                          onClick={() => handleEdit(fare)}
                          className="text-route hover:underline"
                        >
                          Update
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentFare({ routeId: r.id, baseFare: "", taxRate: "0" });
                          }}
                          className="text-route hover:underline"
                        >
                          Set Fare
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {routes.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate">
                    No routes found. Create a route first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

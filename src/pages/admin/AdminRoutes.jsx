import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({
    id: "",
    routeNumber: "",
    sourceStation: "",
    destinationStation: "",
    distanceKm: "",
    estimatedTimeMinutes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesData, stationsData] = await Promise.all([
        apiService.getRoutes(),
        apiService.getStations(),
      ]);
      setRoutes(routesData);
      setStations(stationsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCurrentRoute({ ...currentRoute, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        routeNumber: currentRoute.routeNumber,
        sourceStation: currentRoute.sourceStation,
        destinationStation: currentRoute.destinationStation,
        distanceKm: Number(currentRoute.distanceKm),
        estimatedTimeMinutes: Number(currentRoute.estimatedTimeMinutes),
      };

      if (isEditing) {
        await apiService.updateRoute(currentRoute.id, payload);
      } else {
        await apiService.createRoute(payload);
      }
      fetchData();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving route");
    }
  };

  const handleEdit = (route) => {
    setCurrentRoute({
      id: route.id,
      routeNumber: route.routeNumber || "",
      sourceStation: route.sourceStation?.id || "",
      destinationStation: route.destinationStation?.id || "",
      distanceKm: route.distanceKm || "",
      estimatedTimeMinutes: route.estimatedTimeMinutes || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        await apiService.deleteRoute(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting route");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentRoute({
      id: "",
      routeNumber: "",
      sourceStation: "",
      destinationStation: "",
      distanceKm: "",
      estimatedTimeMinutes: "",
    });
  };

  if (loading) return <p className="animate-pulse text-slate">Loading routes...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">Manage Routes</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-700">{isEditing ? "Edit Route" : "Add New Route"}</h2>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-small font-medium text-ink">Route Number</label>
              <input
                type="text"
                name="routeNumber"
                value={currentRoute.routeNumber}
                onChange={handleChange}
                placeholder="e.g. R1"
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Source Station</label>
              <select
                name="sourceStation"
                value={currentRoute.sourceStation}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route bg-white"
              >
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.stationName} ({s.stationCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Destination Station</label>
              <select
                name="destinationStation"
                value={currentRoute.destinationStation}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route bg-white"
              >
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.stationName} ({s.stationCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                name="distanceKm"
                value={currentRoute.distanceKm}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Est. Time (mins)</label>
              <input
                type="number"
                name="estimatedTimeMinutes"
                value={currentRoute.estimatedTimeMinutes}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-sm bg-ink py-2 text-sm font-semibold text-white hover:bg-ink-soft"
              >
                {isEditing ? "Update" : "Create"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-sm border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5"
                >
                  Cancel
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
                <th className="px-4 py-3 font-semibold text-ink">Route No</th>
                <th className="px-4 py-3 font-semibold text-ink">Source</th>
                <th className="px-4 py-3 font-semibold text-ink">Destination</th>
                <th className="px-4 py-3 font-semibold text-ink">Distance</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-mono font-medium">{r.routeNumber || "N/A"}</td>
                  <td className="px-4 py-3">{r.sourceStation?.stationName || "Deleted"}</td>
                  <td className="px-4 py-3">{r.destinationStation?.stationName || "Deleted"}</td>
                  <td className="px-4 py-3 text-slate">{r.distanceKm} km</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(r)}
                      className="mr-3 text-route hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-alert hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate">
                    No routes found.
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

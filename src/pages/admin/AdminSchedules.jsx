import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const emptyForm = { id: "", routeId: "", departureTime: "", arrivalTime: "", daysOfWeek: [], isActive: true };

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesData, routesData] = await Promise.all([
        apiService.getAllSchedules(),
        apiService.getRoutes(),
      ]);
      setSchedules(schedulesData || []);
      setRoutes(routesData || []);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isActive") {
      setForm((prev) => ({ ...prev, isActive: checked }));
    } else if (type === "checkbox") {
      // days of week checkboxes
      setForm((prev) => {
        const days = checked
          ? [...prev.daysOfWeek, value]
          : prev.daysOfWeek.filter((d) => d !== value);
        return { ...prev, daysOfWeek: days };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.routeId) return alert("Please select a route");
    if (form.daysOfWeek.length === 0) return alert("Please select at least one day");
    try {
      if (isEditing) {
        await apiService.updateSchedule(form.id, {
          route: form.routeId,
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
          daysOfWeek: form.daysOfWeek,
          isActive: form.isActive,
        });
      } else {
        await apiService.createSchedule({
          routeId: form.routeId,
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
          daysOfWeek: form.daysOfWeek,
          isActive: form.isActive,
        });
      }
      fetchData();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving schedule");
    }
  };

  const handleEdit = (s) => {
    setForm({
      id: s._id,
      routeId: s.route?._id || s.route || "",
      departureTime: s.departureTime,
      arrivalTime: s.arrivalTime,
      daysOfWeek: s.daysOfWeek || [],
      isActive: s.isActive,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await apiService.deleteSchedule(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting schedule");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setForm(emptyForm);
  };

  if (loading) return <p className="animate-pulse text-slate">Loading schedules...</p>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-h2 font-800 text-ink">Manage Schedules</h1>
      {error && <p className="rounded-sm bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-700">{isEditing ? "Edit Schedule" : "Add Schedule"}</h2>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-small font-medium text-ink">Route</label>
              <select
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none bg-white focus:border-route focus:ring-1 focus:ring-route"
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeNumber ? `${r.routeNumber} — ` : ""}{r.sourceStation?.stationName} → {r.destinationStation?.stationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-small font-medium text-ink">Departure</label>
                <input type="time" name="departureTime" value={form.departureTime} onChange={handleChange} required
                  className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route" />
              </div>
              <div>
                <label className="block text-small font-medium text-ink">Arrival</label>
                <input type="time" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} required
                  className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route" />
              </div>
            </div>

            <div>
              <label className="block text-small font-medium text-ink mb-1">Days of Operation</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <label key={day} className="flex cursor-pointer items-center gap-1 rounded-sm border border-ink/10 px-2 py-1 text-xs text-slate hover:bg-platform-100">
                    <input type="checkbox" value={day} checked={form.daysOfWeek.includes(day)} onChange={handleChange} className="accent-route" />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-route h-4 w-4" />
              <span className="font-medium text-ink">Active</span>
            </label>

            <div className="flex gap-2 mt-1">
              <button type="submit" className="flex-1 rounded-sm bg-ink py-2 text-sm font-semibold text-white hover:bg-ink-soft">
                {isEditing ? "Update" : "Create"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="rounded-sm border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="rounded-sm border border-ink/10 bg-white lg:col-span-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-platform-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Departure</th>
                <th className="px-4 py-3 font-semibold">Arrival</th>
                <th className="px-4 py-3 font-semibold">Days</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s._id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-medium text-ink">
                    {s.route
                      ? `${s.route.sourceStation?.stationName || "?"} → ${s.route.destinationStation?.stationName || "?"}`
                      : "Deleted Route"}
                  </td>
                  <td className="px-4 py-3 font-mono">{s.departureTime}</td>
                  <td className="px-4 py-3 font-mono">{s.arrivalTime}</td>
                  <td className="px-4 py-3 text-slate text-xs">{s.daysOfWeek?.length === 7 ? "Daily" : s.daysOfWeek?.join(", ")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-sm px-2 py-0.5 text-xs font-bold ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(s)} className="mr-3 text-route hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-alert hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan="6" className="py-6 text-center text-slate">No schedules found. Add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

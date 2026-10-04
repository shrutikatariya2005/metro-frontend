import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentStation, setCurrentStation] = useState({ id: "", stationCode: "", stationName: "", location: "" });

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getStations();
      setStations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCurrentStation({ ...currentStation, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiService.updateStation(currentStation.id, currentStation);
      } else {
        await apiService.createStation(currentStation);
      }
      fetchStations();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving station");
    }
  };

  const handleEdit = (station) => {
    setCurrentStation({
      id: station.id,
      stationCode: station.stationCode,
      stationName: station.stationName,
      location: station.location,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      try {
        await apiService.deleteStation(id);
        fetchStations();
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting station");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentStation({ id: "", stationCode: "", stationName: "", location: "" });
  };

  if (loading) return <p className="animate-pulse text-slate">Loading stations...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">Manage Stations</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 lg:col-span-1">
          <h2 className="font-display text-lg font-700">{isEditing ? "Edit Station" : "Add New Station"}</h2>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-small font-medium text-ink">Station Code</label>
              <input
                type="text"
                name="stationCode"
                value={currentStation.stationCode}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Station Name</label>
              <input
                type="text"
                name="stationName"
                value={currentStation.stationName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-sm border border-ink/15 px-3 py-2 text-sm outline-none focus:border-route focus:ring-1 focus:ring-route"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">Location</label>
              <input
                type="text"
                name="location"
                value={currentStation.location}
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
                <th className="px-4 py-3 font-semibold text-ink">Code</th>
                <th className="px-4 py-3 font-semibold text-ink">Name</th>
                <th className="px-4 py-3 font-semibold text-ink">Location</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-mono font-medium">{s.stationCode}</td>
                  <td className="px-4 py-3">{s.stationName}</td>
                  <td className="px-4 py-3 text-slate">{s.location}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(s)}
                      className="mr-3 text-route hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-alert hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate">
                    No stations found.
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

import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllFeedback();
      setFeedbacks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await apiService.deleteFeedback(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting feedback");
    }
  };

  if (loading) return <p className="animate-pulse text-slate">Loading feedback...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">Manage Feedback & Complaints</h1>
      </div>
      <div className="rounded-sm border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-platform-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink">User</th>
              <th className="px-4 py-3 font-semibold text-ink">Rating</th>
              <th className="px-4 py-3 font-semibold text-ink w-1/2">Comments</th>
              <th className="px-4 py-3 font-semibold text-ink">Date</th>
              <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f) => (
              <tr key={f.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 font-medium text-ink">
                  {f.user ? (
                    <div>
                      <p>{f.user.name}</p>
                      <p className="text-xs text-slate">{f.user.email}</p>
                    </div>
                  ) : "Unknown User"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex text-amber">
                    {"★".repeat(f.rating)}
                    <span className="text-slate/30">{"★".repeat(5 - f.rating)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate">
                  <p className="line-clamp-2" title={f.comments}>{f.comments || <i className="text-slate/50">No comment provided</i>}</p>
                </td>
                <td className="px-4 py-3 text-slate">
                  {new Date(f.createdDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="text-alert hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {feedbacks.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate">
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

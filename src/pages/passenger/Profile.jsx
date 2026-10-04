import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/ApiService";

export default function Profile() {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    dob: "",
    address: "",
    photo: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        contact: user.contact || "",
        dob: user.dob || "",
        address: user.address || "",
        photo: user.photo || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");

    // Contact number is mandatory as per requirement
    if (!formData.contact) {
      setError("Mobile number is strictly required.");
      setLoading(false);
      return;
    }

    try {
      const updatedUser = await apiService.updateProfile(formData);
      setUser(updatedUser); // Update global auth context
      setMsg("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-h1 font-800 text-ink">Personal Profile</h1>
        <p className="text-slate">Update your realistic personal details here.</p>
      </div>

      <div className="rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
        {msg && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2 flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-platform-100 border border-ink/10 flex items-center justify-center overflow-hidden shrink-0">
              {formData.photo ? (
                <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate text-xs text-center">No Photo</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-small font-medium text-ink mb-1">Profile Photo URL</label>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                className="w-full rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-small font-medium text-ink mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-small font-medium text-ink mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full rounded-sm border border-ink/10 bg-platform px-4 py-2.5 text-sm text-slate cursor-not-allowed"
            />
            <p className="text-xs text-slate mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-small font-medium text-ink mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="+91 9876543210"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-small font-medium text-ink mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none text-slate"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-small font-medium text-ink mb-1">Full Residential Address</label>
            <textarea
              rows={3}
              placeholder="Enter your complete address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none resize-none"
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-sm bg-route px-6 py-2.5 font-semibold text-white transition-colors hover:bg-route-soft disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

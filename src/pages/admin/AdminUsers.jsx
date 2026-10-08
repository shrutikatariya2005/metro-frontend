import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", contact: "", password: "", aadhar: "", pan: "", qualification: "", dob: "", address: "", photo: "" });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // For viewing user details
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (id, role) => {
    try {
      await apiService.updateUserRole(id, role);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await apiService.toggleUserStatus(id, !currentStatus);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error toggling status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await apiService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiService.createAdmin(formData);
      setFormData({ name: "", email: "", contact: "", password: "", aadhar: "", pan: "", qualification: "", dob: "", address: "", photo: "" });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating admin");
    } finally {
      setCreating(false);
    }
  };

  const exportUsers = () => {
    if (!users.length) return alert("No users to export");
    const data = users.map((u, i) => ({
      "Sr. No.": i + 1,
      Name: u.name,
      Email: u.email,
      Contact: u.contact || "N/A",
      Role: u.role,
      Status: u.isActive ? "Active" : "Inactive",
      JoinedDate: new Date(u.createdAt).toLocaleDateString(),
      Aadhar: u.aadhar || "N/A",
      PAN: u.pan || "N/A",
      Qualification: u.qualification || "N/A",
      Address: u.address || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet([]);
    
    XLSX.utils.sheet_add_aoa(ws, [
      ["All Users Report"],
      [`Report Generated On: ${new Date().toLocaleString()}`],
      []
    ]);
    
    XLSX.utils.sheet_add_json(ws, data, { origin: "A4" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `Users_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <p className="animate-pulse text-slate">Loading users...</p>;

  const visibleUsers = users.filter(u => u.role !== "admin" || u._id === currentUser.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">Manage Users</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={exportUsers}
            className="rounded-sm bg-platform-100 px-4 py-2 text-sm font-semibold text-route transition-colors hover:bg-platform-200"
          >
            Export to Excel
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            + Create Admin
          </button>
        </div>
      </div>
      <div className="rounded-sm border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-platform-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink">Name</th>
              <th className="px-4 py-3 font-semibold text-ink">Email</th>
              <th className="px-4 py-3 font-semibold text-ink">Role</th>
              <th className="px-4 py-3 font-semibold text-ink">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u._id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 font-medium text-ink flex items-center gap-3">
                  {u.photo ? (
                    <img src={u.photo} alt="" className="w-8 h-8 rounded-full object-cover bg-ink/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center font-bold text-ink/50 text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {u.name}
                  {u._id === currentUser.id && <span className="text-[10px] bg-amber/20 text-amber px-1.5 rounded ml-2">You</span>}
                </td>
                <td className="px-4 py-3 text-slate">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                    className={`rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wider outline-none ${
                      u.role === "admin" ? "bg-amber/20 text-amber" :
                      "bg-ink/5 text-slate"
                    }`}
                  >
                    <option value="passenger">Passenger</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-sm px-2 py-0.5 text-xs font-bold ${
                    u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setViewUser(u)}
                    className="mr-3 text-route font-semibold hover:underline"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                    className="mr-3 text-ink hover:underline"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="text-alert hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-slate">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-sm bg-white p-6 shadow-xl my-8">
            <h2 className="mb-6 font-display text-2xl font-700 text-ink">Create New Admin Profile</h2>
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="col-span-1 md:col-span-2 flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-platform-100 border border-ink/10 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.photo ? <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-slate text-xs text-center leading-tight">No<br/>Photo</span>}
                </div>
                <input
                  type="url"
                  placeholder="Profile Photo URL (Optional)"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none flex-1"
                />
              </div>

              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
              />
              <input
                type="text"
                placeholder="Contact Number (Optional)"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
              />
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate hover:text-ink text-xs font-bold"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <input
                type="date"
                required
                title="Date of Birth"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none text-slate"
              />
              <input
                type="text"
                placeholder="Qualification (e.g. B.Tech, MBA)"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
              />
              <input
                type="text"
                placeholder="Aadhar Number"
                required
                value={formData.aadhar}
                onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none"
              />
              <input
                type="text"
                placeholder="PAN Card Number"
                required
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none uppercase"
              />
              <textarea
                placeholder="Full Residential Address"
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-1 md:col-span-2 rounded-sm border border-ink/20 px-4 py-2.5 text-sm focus:border-amber focus:outline-none resize-none"
              />
              
              <div className="col-span-1 md:col-span-2 mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-sm border border-ink/20 py-2.5 text-sm font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-sm bg-amber py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-6 border-b border-ink/10 pb-4">
              <div className="w-16 h-16 rounded-full bg-platform-100 flex items-center justify-center overflow-hidden shrink-0">
                {viewUser.photo ? <img src={viewUser.photo} alt="Profile" className="w-full h-full object-cover" /> : <span className="font-bold text-ink/50 text-xl">{viewUser.name.charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <h2 className="font-display text-2xl font-700 text-ink leading-none">{viewUser.name}</h2>
                <p className="text-slate text-sm mt-1">{viewUser.email}</p>
                <span className="inline-block mt-1 uppercase text-[10px] font-bold tracking-wider bg-ink/10 px-2 py-0.5 rounded text-ink">{viewUser.role}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate mb-0.5">Contact Number</p>
                <p className="font-medium text-ink">{viewUser.contact || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate mb-0.5">Date of Birth</p>
                <p className="font-medium text-ink">{viewUser.dob || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate mb-0.5">Aadhar Number</p>
                <p className="font-medium text-ink">{viewUser.aadhar || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate mb-0.5">PAN Card</p>
                <p className="font-medium text-ink uppercase">{viewUser.pan || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate mb-0.5">Qualification</p>
                <p className="font-medium text-ink">{viewUser.qualification || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate mb-0.5">Residential Address</p>
                <p className="font-medium text-ink bg-platform-50 p-2 rounded border border-ink/5 mt-1">{viewUser.address || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate mb-0.5">Account Created</p>
                <p className="font-medium text-ink">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setViewUser(null)}
                className="rounded-sm bg-ink px-6 py-2 text-sm font-semibold text-white hover:bg-ink-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

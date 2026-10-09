import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/ApiService";

export default function AdminSettings() {
  const { user, login } = useAuth(); // use login to update local context if needed
  
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    taxPercentage: 5,
    maxTicketsPerUser: 10,
    supportEmail: "support@metro.com"
  });

  const [profile, setProfile] = useState({
    name: "",
    contact: "",
    aadhar: "",
    pan: "",
    address: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [successSettings, setSuccessSettings] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [successProfile, setSuccessProfile] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [successPassword, setSuccessPassword] = useState(false);

  useEffect(() => {
    // Load local settings
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load user profile
    if (user) {
      setProfile({
        name: user.name || "",
        contact: user.contact || "",
        aadhar: user.aadhar || "",
        pan: user.pan || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // Handlers for Settings
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSuccessSettings(false);
    setTimeout(() => {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      // Dispatch storage event manually so same window updates
      window.dispatchEvent(new Event("storage"));
      setSavingSettings(false);
      setSuccessSettings(true);
      setTimeout(() => setSuccessSettings(false), 3000);
    }, 500);
  };

  // Handlers for Profile
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessProfile(false);
    try {
      const updatedUser = await apiService.updateProfile(profile);
      login(updatedUser); // update context
      setSuccessProfile(true);
      setTimeout(() => setSuccessProfile(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handlers for Password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setSuccessPassword(false);
    try {
      await apiService.updatePassword(password);
      setSuccessPassword(true);
      setPassword({ currentPassword: "", newPassword: "" });
      setTimeout(() => setSuccessPassword(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">System & Profile Configuration</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Profile Settings */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-700 text-ink mb-6">Admin Personal Info</h2>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wide">Full Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wide">Mobile Number</label>
                <input type="text" name="contact" value={profile.contact} onChange={handleProfileChange} className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wide">Aadhar Number</label>
                <input type="text" name="aadhar" value={profile.aadhar} onChange={handleProfileChange} className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate uppercase tracking-wide">PAN Card</label>
                <input type="text" name="pan" value={profile.pan} onChange={handleProfileChange} className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none uppercase" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate uppercase tracking-wide">Residential Address</label>
              <textarea name="address" value={profile.address} onChange={handleProfileChange} rows="2" className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none custom-scrollbar"></textarea>
            </div>

            <div className="mt-2 flex items-center gap-4">
              <button type="submit" disabled={savingProfile} className="rounded bg-route px-6 py-2 text-sm font-semibold text-white hover:bg-route-soft disabled:opacity-50">
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
              {successProfile && <span className="text-sm font-medium text-green-600">Profile updated!</span>}
            </div>
          </form>

          <hr className="my-8 border-ink/5" />

          <h2 className="font-display text-lg font-700 text-ink mb-6">Change Password</h2>
          <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate uppercase tracking-wide">Current Password</label>
              <input type="password" name="currentPassword" value={password.currentPassword} onChange={handlePasswordChange} className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate uppercase tracking-wide">New Password</label>
              <input type="password" name="newPassword" value={password.newPassword} onChange={handlePasswordChange} className="rounded border border-ink/20 px-3 py-2 text-sm focus:border-amber focus:outline-none" required />
            </div>
            <div className="mt-2 flex items-center gap-4">
              <button type="submit" disabled={savingPassword} className="rounded bg-ink px-6 py-2 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50">
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
              {successPassword && <span className="text-sm font-medium text-green-600">Password changed!</span>}
            </div>
          </form>
        </div>

        {/* System Settings */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 h-fit shadow-sm">
          <h2 className="font-display text-lg font-700 text-ink mb-6">Platform Settings</h2>
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2 p-4 bg-amber/5 border border-amber/20 rounded">
              <label className="text-sm font-bold text-amber">Maintenance Mode</label>
              <p className="text-xs text-slate">If enabled, the passenger portal will display a maintenance page and block access.</p>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="maintenanceMode" 
                  checked={settings.maintenanceMode} 
                  onChange={handleSettingsChange}
                  className="h-5 w-5 rounded border-ink/20 text-amber focus:ring-amber"
                />
                <span className="text-sm font-semibold text-ink">Enable Maintenance Mode</span>
              </label>
            </div>

            <div className="h-px w-full bg-ink/5"></div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink">Global Tax Rate (%)</label>
              <input 
                type="number" 
                name="taxPercentage" 
                value={settings.taxPercentage}
                onChange={handleSettingsChange}
                min="0"
                max="100"
                className="rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none w-32"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink">Max Tickets Per Booking</label>
              <input 
                type="number" 
                name="maxTicketsPerUser" 
                value={settings.maxTicketsPerUser}
                onChange={handleSettingsChange}
                min="1"
                max="50"
                className="rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none w-32"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-ink">Support Email Address</label>
              <input 
                type="email" 
                name="supportEmail" 
                value={settings.supportEmail}
                onChange={handleSettingsChange}
                className="rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button 
                type="submit" 
                disabled={savingSettings}
                className="rounded-sm bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Platform Settings"}
              </button>
              {successSettings && <span className="text-sm font-medium text-green-600">Settings saved!</span>}
            </div>

          </form>
        </div>
        
      </div>
    </div>
  );
}

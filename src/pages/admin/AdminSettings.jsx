import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    taxPercentage: 5,
    maxTicketsPerUser: 10,
    supportEmail: "support@metro.com"
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h2 font-800 text-ink">System Configuration</h1>
      </div>

      <div className="rounded-sm border border-ink/10 bg-white p-6 max-w-2xl">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Maintenance Mode</label>
            <p className="text-xs text-slate">If enabled, the passenger portal will display a maintenance page.</p>
            <label className="flex items-center gap-2 mt-1 cursor-pointer">
              <input 
                type="checkbox" 
                name="maintenanceMode" 
                checked={settings.maintenanceMode} 
                onChange={handleChange}
                className="h-4 w-4 rounded border-ink/20 text-amber focus:ring-amber"
              />
              <span className="text-sm font-medium">Enable Maintenance Mode</span>
            </label>
          </div>

          <div className="h-px w-full bg-ink/5"></div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Global Tax Rate (%)</label>
            <input 
              type="number" 
              name="taxPercentage" 
              value={settings.taxPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              className="rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-32"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Max Tickets Per Booking</label>
            <input 
              type="number" 
              name="maxTicketsPerUser" 
              value={settings.maxTicketsPerUser}
              onChange={handleChange}
              min="1"
              max="50"
              className="rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-32"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Support Email Address</label>
            <input 
              type="email" 
              name="supportEmail" 
              value={settings.supportEmail}
              onChange={handleChange}
              className="rounded-sm border border-ink/20 px-4 py-2 text-sm focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={saving}
              className="rounded-sm bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {success && <span className="text-sm font-medium text-green-600">Settings saved successfully!</span>}
          </div>

        </form>
      </div>
    </div>
  );
}

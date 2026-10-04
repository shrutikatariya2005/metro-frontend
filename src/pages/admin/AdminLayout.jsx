import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Strict Confidentiality Check
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const links = [
    { name: "Dashboard", path: "/admin" },
    { name: "Users", path: "/admin/users" },
    { name: "Stations", path: "/admin/stations" },
    { name: "Routes", path: "/admin/routes" },
    { name: "Schedules", path: "/admin/schedules" },
    { name: "Fares", path: "/admin/fares" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Feedback", path: "/admin/feedback" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-platform-100 font-sans text-ink overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-ink text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <Link to="/" className="font-display text-xl font-800 tracking-tight text-amber">
            METRO ADMIN
          </Link>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto mt-6 flex flex-col gap-1 px-4 pb-6">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`rounded-sm px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-amber text-ink" : "text-slate hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-ink/10 bg-white px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-ink hover:bg-platform-100 rounded"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h2 className="font-display text-lg font-700 hidden sm:block">Admin Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Hi, {user?.name || "Admin"}</span>
            <button
              onClick={logout}
              className="rounded-sm bg-ink/5 px-4 py-2 text-sm font-semibold hover:bg-alert-soft hover:text-alert"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

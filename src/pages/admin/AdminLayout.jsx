import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const NAV_LINKS = [
  { name: "Dashboard",  path: "/admin",            icon: "📊" },
  { name: "Users",      path: "/admin/users",       icon: "👥" },
  { name: "Stations",   path: "/admin/stations",    icon: "🚉" },
  { name: "Routes",     path: "/admin/routes",      icon: "🗺️" },
  { name: "Schedules",  path: "/admin/schedules",   icon: "🕐" },
  { name: "Fares",      path: "/admin/fares",       icon: "💰" },
  { name: "Bookings",   path: "/admin/bookings",    icon: "🎫" },
  { name: "Feedback",   path: "/admin/feedback",    icon: "💬" },
  { name: "Reports",    path: "/admin/reports",     icon: "📈" },
  { name: "Settings",   path: "/admin/settings",    icon: "⚙️" },
];

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading admin panel…</p>
      </div>
    </div>
  );

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const currentPage = NAV_LINKS.find(l => l.path === location.pathname || (l.path !== "/admin" && location.pathname.startsWith(l.path)))?.name || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f8fafc" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-nav-link { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:8px; font-size:14px; font-weight:500; color:#94a3b8; text-decoration:none; transition:all 0.15s ease; cursor:pointer; }
        .admin-nav-link:hover { background:#1e293b; color:#f8fafc; }
        .admin-nav-link.active { background:#2563eb; color:#ffffff; font-weight:600; }
        .admin-sidebar { width:240px; background:#1e293b; border-right:1px solid #334155; display:flex; flex-direction:column; position:fixed; top:0; bottom:0; left:0; z-index:50; transition:transform 0.2s ease; }
        @media(max-width:1023px) { .admin-sidebar { transform:translateX(-100%); } .admin-sidebar.open { transform:translateX(0); } }
        .admin-main { flex:1; display:flex; flex-direction:column; margin-left:240px; background:#0f172a; min-height:100vh; }
        @media(max-width:1023px) { .admin-main { margin-left:0; } }
        .logout-btn { padding:7px 14px; background:#334155; border:1px solid #475569; border-radius:6px; color:#f1f5f9; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.15s; }
        .logout-btn:hover { background:#475569; }
        .menu-btn { background:#334155; border:1px solid #475569; border-radius:6px; padding:6px 10px; color:#e2e8f0; font-size:18px; cursor:pointer; display:none; }
        @media(max-width:1023px) { .menu-btn { display:block; } }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:40 }} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #334155" }}>
          <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, color:"#ffffff" }}>M</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#f8fafc" }}>Metro Admin</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>Control Panel</div>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div style={{ padding:"12px 20px", borderBottom:"1px solid #334155", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600, fontSize:13, color:"#fff", flexShrink:0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#f8fafc", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Admin"}</div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"12px" }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
            return (
              <Link key={link.name} to={link.path} className={`admin-nav-link${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
                <span style={{ fontSize:16 }}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid #334155" }}>
          <button className="logout-btn" style={{ width:"100%" }} onClick={logout}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <header style={{ height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", background:"#1e293b", borderBottom:"1px solid #334155", position:"sticky", top:0, zIndex:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 style={{ fontSize:16, fontWeight:600, color:"#f8fafc", margin:0 }}>{currentPage}</h1>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:13, color:"#94a3b8" }}>Logged in as <strong style={{ color:"#f8fafc" }}>{user?.name || "Admin"}</strong></span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, overflowY:"auto", padding:"24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}


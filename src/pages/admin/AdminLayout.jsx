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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0f1117 0%,#1a1f2e 100%)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading admin panel…</p>
      </div>
    </div>
  );

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const currentPage = NAV_LINKS.find(l => l.path === location.pathname || (l.path !== "/admin" && location.pathname.startsWith(l.path)))?.name || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg,#0f1117 0%,#1a1f2e 100%)", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .admin-nav-link { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; font-size:13.5px; font-weight:500; color:#94a3b8; text-decoration:none; transition:all 0.18s ease; cursor:pointer; }
        .admin-nav-link:hover { background:rgba(255,255,255,0.06); color:#e2e8f0; }
        .admin-nav-link.active { background:linear-gradient(90deg,#f59e0b,#f97316); color:#0f1117; font-weight:700; box-shadow:0 4px 18px rgba(245,158,11,0.35); }
        .admin-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; backdrop-filter:blur(12px); }
        .admin-content { animation: fadeIn 0.3s ease; }
        .admin-sidebar { width:240px; background:rgba(15,17,23,0.85); border-right:1px solid rgba(255,255,255,0.06); backdrop-filter:blur(20px); display:flex; flex-direction:column; position:fixed; top:0; bottom:0; left:0; z-index:50; transition:transform 0.2s ease; }
        @media(max-width:1023px) { .admin-sidebar { transform:translateX(-100%); } .admin-sidebar.open { transform:translateX(0); } }
        .admin-main { flex:1; display:flex; flex-direction:column; margin-left:240px; }
        @media(max-width:1023px) { .admin-main { margin-left:0; } }
        .logout-btn { padding:8px 16px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); border-radius:8px; color:#f87171; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.18s; }
        .logout-btn:hover { background:rgba(239,68,68,0.22); }
        .menu-btn { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:6px 10px; color:#e2e8f0; font-size:18px; cursor:pointer; display:none; }
        @media(max-width:1023px) { .menu-btn { display:block; } }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:40, backdropFilter:"blur(4px)" }} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, background:"linear-gradient(135deg,#f59e0b,#f97316)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:"#0f1117" }}>M</div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, letterSpacing:1, color:"#f59e0b" }}>METRO ADMIN</div>
                <div style={{ fontSize:10, color:"#475569", letterSpacing:0.5 }}>Control Panel</div>
              </div>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#fff", flexShrink:0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Admin"}</div>
            <div style={{ fontSize:10.5, color:"#64748b" }}>Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"12px 12px" }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
            return (
              <Link key={link.name} to={link.path} className={`admin-nav-link${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
                <span style={{ fontSize:15 }}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <button className="logout-btn" style={{ width:"100%" }} onClick={logout}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Header */}
        <header style={{ height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", background:"rgba(15,17,23,0.7)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"sticky", top:0, zIndex:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>{currentPage}</h1>
              <p style={{ fontSize:11, color:"#475569", margin:0 }}>Metro Booking System</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:12, color:"#64748b" }}>Hi, <span style={{ color:"#f59e0b", fontWeight:600 }}>{user?.name?.split(" ")[0] || "Admin"}</span></div>
            <div style={{ width:1, height:20, background:"rgba(255,255,255,0.1)" }} />
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content" style={{ flex:1, overflowY:"auto", padding:"28px 28px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

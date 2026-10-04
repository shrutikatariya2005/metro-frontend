import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "22px 24px",
      backdropFilter: "blur(12px)",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${color}30`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Glow */}
      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background: color, opacity:0.12, filter:"blur(20px)" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative" }}>
        <div>
          <p style={{ fontSize:12, color:"#64748b", fontWeight:500, marginBottom:8, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</p>
          <p style={{ fontSize:36, fontWeight:800, color:"#f1f5f9", lineHeight:1, marginBottom:4 }}>{value ?? "—"}</p>
          {sub && <p style={{ fontSize:11.5, color:"#475569" }}>{sub}</p>}
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      </div>
    </div>
  );
}

function SectionTable({ title, icon, columns, rows, emptyMsg = "No data", renderRow }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <h2 style={{ fontSize:14.5, fontWeight:700, color:"#e2e8f0", margin:0 }}>{title}</h2>
        <span style={{ marginLeft:"auto", fontSize:11, background:"rgba(255,255,255,0.08)", color:"#94a3b8", borderRadius:20, padding:"2px 10px" }}>{rows.length} total</span>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.04)" }}>
              {columns.map(c => (
                <th key={c} style={{ padding:"10px 16px", textAlign:"left", color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, fontSize:11, whiteSpace:"nowrap" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding:"24px 16px", textAlign:"center", color:"#475569" }}>{emptyMsg}</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r._id || i} style={{ borderTop:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                {renderRow(r)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const statusColors = { confirmed:"#22c55e", pending:"#f59e0b", cancelled:"#ef4444", paid:"#3b82f6" };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") { setError("Access denied."); return; }
    apiService.getAdminOverview()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard data"));
  }, [loading, user]);

  if (error) return (
    <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"16px 20px", color:"#f87171", fontSize:14 }}>
      ⚠️ {error}
    </div>
  );

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", gap:12, color:"#64748b", fontSize:14 }}>
      <div style={{ width:20, height:20, border:"2px solid #f59e0b", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      Loading dashboard…
    </div>
  );

  const revenue = data.bookings.filter(b => b.status === "confirmed" || b.status === "paid").reduce((sum, b) => sum + (b.fareAmount || 0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero welcome */}
      <div style={{ background:"linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(249,115,22,0.06) 100%)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:18, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", margin:"0 0 4px" }}>
            Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p style={{ fontSize:13, color:"#64748b", margin:0 }}>Here's what's happening with your metro system today.</p>
        </div>
        <Link to="/admin/bookings" style={{ background:"linear-gradient(90deg,#f59e0b,#f97316)", color:"#0f1117", fontWeight:700, fontSize:13, padding:"10px 20px", borderRadius:10, textDecoration:"none", whiteSpace:"nowrap" }}>
          View All Bookings →
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
        <StatCard label="Stations" value={data.stations.length} icon="🚉" color="#3b82f6" sub="Active stations" />
        <StatCard label="Routes" value={data.routes.length} icon="🗺️" color="#8b5cf6" sub="Configured routes" />
        <StatCard label="Bookings" value={data.bookings.length} icon="🎫" color="#f59e0b" sub="Total all time" />
        <StatCard label="Revenue" value={`₹${revenue.toLocaleString()}`} icon="💰" color="#22c55e" sub="Confirmed + Paid" />
      </div>

      {/* Tables */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:20 }}>
        <SectionTable
          title="Stations" icon="🚉"
          columns={["Code", "Name", "Location"]}
          rows={data.stations}
          renderRow={s => (<>
            <td style={{ padding:"10px 16px" }}>
              <span style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700, fontFamily:"monospace" }}>{s.stationCode}</span>
            </td>
            <td style={{ padding:"10px 16px", color:"#e2e8f0", fontWeight:500 }}>{s.stationName}</td>
            <td style={{ padding:"10px 16px", color:"#64748b" }}>{s.location}</td>
          </>)}
        />
        <SectionTable
          title="Routes" icon="🗺️"
          columns={["No.", "Route", "Distance", "Time"]}
          rows={data.routes}
          renderRow={r => (<>
            <td style={{ padding:"10px 16px" }}>
              <span style={{ background:"rgba(139,92,246,0.15)", color:"#a78bfa", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{r.routeNumber || "—"}</span>
            </td>
            <td style={{ padding:"10px 16px", color:"#e2e8f0", fontWeight:500, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.summary}</td>
            <td style={{ padding:"10px 16px", color:"#64748b" }}>{r.distanceKm} km</td>
            <td style={{ padding:"10px 16px", color:"#64748b" }}>{r.estimatedTimeMinutes} min</td>
          </>)}
        />
      </div>

      {/* Bookings table */}
      <SectionTable
        title="Recent Bookings" icon="🎫"
        columns={["Reference", "Route", "Fare", "Status", "Date"]}
        rows={data.bookings.slice(0, 10)}
        renderRow={b => {
          const col = statusColors[b.status] || "#64748b";
          return (<>
            <td style={{ padding:"10px 16px", color:"#e2e8f0", fontFamily:"monospace", fontSize:11.5 }}>{b.bookingRef}</td>
            <td style={{ padding:"10px 16px", color:"#94a3b8" }}>{b.route?.summary || "Deleted Route"}</td>
            <td style={{ padding:"10px 16px", color:"#22c55e", fontWeight:600 }}>₹{b.fareAmount}</td>
            <td style={{ padding:"10px 16px" }}>
              <span style={{ background:`${col}18`, color:col, border:`1px solid ${col}30`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600, textTransform:"capitalize" }}>{b.status}</span>
            </td>
            <td style={{ padding:"10px 16px", color:"#475569", fontSize:11.5 }}>{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-IN") : "—"}</td>
          </>);
        }}
      />
    </div>
  );
}
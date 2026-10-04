import { useEffect, useState } from "react";
import apiService from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #EDEFF3",
      borderRadius: 12,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:12, color:"#5B6472", fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:0.6 }}>{label}</p>
          <p style={{ fontSize:32, fontWeight:800, color:"#12213A", lineHeight:1, marginBottom:4, fontFamily:"'Archivo Expanded', sans-serif" }}>{value ?? "—"}</p>
          {sub && <p style={{ fontSize:12, color:"#5B6472", margin:0 }}>{sub}</p>}
        </div>
        <div style={{ width:44, height:44, borderRadius:10, background:`${color}15`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      </div>
    </div>
  );
}

function SectionTable({ title, icon, columns, rows, emptyMsg = "No data", renderRow }) {
  return (
    <div style={{ background:"#FFFFFF", border:"1px solid #EDEFF3", borderRadius:12, overflow:"hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #EDEFF3", display:"flex", alignItems:"center", gap:8, background:"#FFFFFF" }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <h2 style={{ fontSize:15, fontWeight:700, color:"#12213A", margin:0, fontFamily:"'Archivo Expanded', sans-serif" }}>{title}</h2>
        <span style={{ marginLeft:"auto", fontSize:12, background:"#EDEFF3", color:"#5B6472", borderRadius:12, padding:"2px 10px", fontWeight:600 }}>{rows.length} total</span>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#EDEFF3", borderBottom:"1px solid #E2E8F0" }}>
              {columns.map(c => (
                <th key={c} style={{ padding:"10px 16px", textAlign:"left", color:"#12213A", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, fontSize:11, whiteSpace:"nowrap" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding:"24px 16px", textAlign:"center", color:"#5B6472" }}>{emptyMsg}</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r._id || i} style={{ borderTop:"1px solid #EDEFF3", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7F8FA"}
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

const statusColors = { confirmed:"#1F7A5C", pending:"#D97706", cancelled:"#D64545", paid:"#1D4ED8" };
const statusBgColors = { confirmed:"#E6F2ED", pending:"#FEF3C7", cancelled:"#FBEAEA", paid:"#DBEAFE" };

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
    <div style={{ background:"#FBEAEA", border:"1px solid #FCA5A5", borderRadius:10, padding:"16px 20px", color:"#D64545", fontSize:14, fontWeight:600 }}>
      ⚠️ {error}
    </div>
  );

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", gap:12, color:"#5B6472", fontSize:14 }}>
      <div style={{ width:20, height:20, border:"2px solid #FFB100", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      Loading dashboard…
    </div>
  );

  const revenue = data.bookings.filter(b => b.status === "confirmed" || b.status === "paid").reduce((sum, b) => sum + (b.fareAmount || 0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hero welcome */}
      <div style={{ background:"#FFFFFF", border:"1px solid #EDEFF3", borderRadius:14, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#12213A", margin:"0 0 4px", fontFamily:"'Archivo Expanded', sans-serif" }}>
            Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p style={{ fontSize:14, color:"#5B6472", margin:0 }}>Here's what's happening with your metro system today.</p>
        </div>
        <Link to="/admin/bookings" style={{ background:"#FFB100", color:"#12213A", fontWeight:700, fontSize:13, padding:"10px 20px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap", transition:"background 0.15s" }}>
          View All Bookings →
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
        <StatCard label="Stations" value={data.stations.length} icon="🚉" color="#1D4ED8" sub="Active stations" />
        <StatCard label="Routes" value={data.routes.length} icon="🗺️" color="#7C3AED" sub="Configured routes" />
        <StatCard label="Bookings" value={data.bookings.length} icon="🎫" color="#D97706" sub="Total all time" />
        <StatCard label="Revenue" value={`₹${revenue.toLocaleString()}`} icon="💰" color="#1F7A5C" sub="Confirmed + Paid" />
      </div>

      {/* Tables */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:20 }}>
        <SectionTable
          title="Stations" icon="🚉"
          columns={["Code", "Name", "Location"]}
          rows={data.stations}
          renderRow={s => (<>
            <td style={{ padding:"10px 16px" }}>
              <span style={{ background:"#DBEAFE", color:"#1D4ED8", borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700, fontFamily:"monospace" }}>{s.stationCode}</span>
            </td>
            <td style={{ padding:"10px 16px", color:"#12213A", fontWeight:600 }}>{s.stationName}</td>
            <td style={{ padding:"10px 16px", color:"#5B6472" }}>{s.location}</td>
          </>)}
        />
        <SectionTable
          title="Routes" icon="🗺️"
          columns={["No.", "Route", "Distance", "Time"]}
          rows={data.routes}
          renderRow={r => (<>
            <td style={{ padding:"10px 16px" }}>
              <span style={{ background:"#EDE9FE", color:"#6D28D9", borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{r.routeNumber || "—"}</span>
            </td>
            <td style={{ padding:"10px 16px", color:"#12213A", fontWeight:600, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.summary}</td>
            <td style={{ padding:"10px 16px", color:"#5B6472" }}>{r.distanceKm} km</td>
            <td style={{ padding:"10px 16px", color:"#5B6472" }}>{r.estimatedTimeMinutes} min</td>
          </>)}
        />
      </div>

      {/* Bookings table */}
      <SectionTable
        title="Recent Bookings" icon="🎫"
        columns={["Reference", "Route", "Fare", "Status", "Date"]}
        rows={data.bookings.slice(0, 10)}
        renderRow={b => {
          const col = statusColors[b.status] || "#5B6472";
          const bgCol = statusBgColors[b.status] || "#EDEFF3";
          return (<>
            <td style={{ padding:"10px 16px", color:"#12213A", fontFamily:"monospace", fontWeight:600, fontSize:12 }}>{b.bookingRef}</td>
            <td style={{ padding:"10px 16px", color:"#1E3354" }}>{b.route?.summary || "Deleted Route"}</td>
            <td style={{ padding:"10px 16px", color:"#1F7A5C", fontWeight:700 }}>₹{b.fareAmount}</td>
            <td style={{ padding:"10px 16px" }}>
              <span style={{ background:bgCol, color:col, borderRadius:4, padding:"3px 10px", fontSize:11, fontWeight:700, textTransform:"capitalize" }}>{b.status}</span>
            </td>
            <td style={{ padding:"10px 16px", color:"#5B6472", fontSize:12 }}>{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-IN") : "—"}</td>
          </>);
        }}
      />
    </div>
  );
}
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export default function ShellLayout() {
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const settings = localStorage.getItem("adminSettings");
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        if (parsed.maintenanceMode) setMaintenance(true);
      } catch(e) {}
    }
    
    // Listen for storage changes in case admin updates it in another tab
    const handleStorage = () => {
      const s = localStorage.getItem("adminSettings");
      if (s) {
        try {
          const parsed = JSON.parse(s);
          setMaintenance(!!parsed.maintenanceMode);
        } catch(e) {}
      } else {
        setMaintenance(false);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (maintenance) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-ink text-center p-8">
        <h1 className="font-display text-4xl font-800 text-route mb-4">System Under Maintenance</h1>
        <p className="text-slate max-w-md">
          We are currently performing scheduled maintenance on the passenger portal. 
          Please check back later. We apologize for the inconvenience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
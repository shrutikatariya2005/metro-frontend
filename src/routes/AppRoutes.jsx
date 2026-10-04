import { Routes, Route } from "react-router-dom";
import ShellLayout from "../layouts/ShellLayout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import BookingFlow from "../pages/passenger/BookingFlow";
import BookingHistory from "../pages/passenger/BookingHistory";
import Profile from "../pages/passenger/Profile";
import Feedback from "../pages/feedback/Feedback";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminStations from "../pages/admin/AdminStations";
import AdminRoutes from "../pages/admin/AdminRoutes";
import AdminSchedules from "../pages/admin/AdminSchedules";
import AdminFares from "../pages/admin/AdminFares";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminFeedback from "../pages/admin/AdminFeedback";
import AdminReports from "../pages/admin/AdminReports";
import AdminSettings from "../pages/admin/AdminSettings";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Passenger Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/book" element={<BookingFlow />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
      
      {/* Admin routes wrapped in AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stations" element={<AdminStations />} />
        <Route path="routes" element={<AdminRoutes />} />
        <Route path="schedules" element={<AdminSchedules />} />
        <Route path="fares" element={<AdminFares />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
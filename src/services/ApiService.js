// src/services/ApiService.js
import axios from "axios";
import { Station, MetroRoute, Booking, Feedback } from "../models";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://metro-backend-ujgj.onrender.com/api/v1",
  withCredentials: true,
});

class ApiService {
  async getStations(query = "") {
    const res = await api.get(`/stations${query ? `?q=${query}` : ""}`);
    return res.data.data.map((s) => new Station({ id: s._id, ...s }));
  }

  async createStation(data) {
    const res = await api.post("/stations", data);
    return new Station({ id: res.data.data._id, ...res.data.data });
  }

  async updateStation(id, data) {
    const res = await api.put(`/stations/${id}`, data);
    return new Station({ id: res.data.data._id, ...res.data.data });
  }

  async deleteStation(id) {
    const res = await api.delete(`/stations/${id}`);
    return res.data.data;
  }

  // --- ADMIN ROUTES ---
  async getRoutes() {
    const res = await api.get(`/routes`);
    return res.data.data.map((raw) => {
      const source = raw.sourceStation ? new Station({ id: raw.sourceStation._id, ...raw.sourceStation }) : null;
      const dest = raw.destinationStation ? new Station({ id: raw.destinationStation._id, ...raw.destinationStation }) : null;
      return new MetroRoute({ id: raw._id, sourceStation: source, destinationStation: dest, ...raw });
    });
  }

  async createRoute(data) {
    const res = await api.post("/routes", data);
    return res.data.data;
  }

  async updateRoute(id, data) {
    const res = await api.put(`/routes/${id}`, data);
    return res.data.data;
  }

  async deleteRoute(id) {
    const res = await api.delete(`/routes/${id}`);
    return res.data.data;
  }

  // --- ADMIN SCHEDULES ---
  async getAllSchedules() {
    const res = await api.get("/schedules");
    return res.data.data;
  }

  async createSchedule(data) {
    const res = await api.post("/schedules", data);
    return res.data.data;
  }

  async updateSchedule(id, data) {
    const res = await api.put(`/schedules/${id}`, data);
    return res.data.data;
  }

  async deleteSchedule(id) {
    const res = await api.delete(`/schedules/${id}`);
    return res.data.data;
  }

  // --- ADMIN FARES ---
  async getAllFares() {
    const res = await api.get("/fares");
    return res.data.data;
  }

  async setFare(routeId, data) {
    const res = await api.post(`/fares/route/${routeId}`, data);
    return res.data.data;
  }

  // --- ADMIN BOOKINGS ---
  async getAllBookings() {
    const res = await api.get("/bookings");
    return res.data.data.map((b) => {
      let route = null;
      if (b.route) {
        const source = b.route.sourceStation ? new Station({ id: b.route.sourceStation._id, ...b.route.sourceStation }) : null;
        const dest = b.route.destinationStation ? new Station({ id: b.route.destinationStation._id, ...b.route.destinationStation }) : null;
        route = new MetroRoute({ id: b.route._id, sourceStation: source, destinationStation: dest, ...b.route });
      }
      return new Booking({ id: b._id, bookingRef: b.bookingRef, route, schedule: b.schedule, passengerCount: b.passengerCount, fareAmount: b.fareAmount, travelDate: b.travelDate, status: b.status });
    });
  }

  async updateBookingStatus(id, status) {
    const res = await api.put(`/bookings/${id}/status`, { status });
    return res.data.data;
  }

  // --- ADMIN FEEDBACK ---
  async getAllFeedback() {
    const res = await api.get("/feedback");
    return res.data.data.map((f) => new Feedback({ id: f._id, rating: f.rating, comments: f.comments, createdDate: f.createdAt, ...f }));
  }

  async deleteFeedback(id) {
    const res = await api.delete(`/feedback/${id}`);
    return res.data.data;
  }

  // --- ADMIN USERS ---
  async getAllUsers() {
    const res = await api.get("/users");
    return res.data.data;
  }

  async createAdmin(data) {
    const res = await api.post("/users/admin", data);
    return res.data.data;
  }

  async updateUserRole(id, role) {
    const res = await api.put(`/users/${id}/role`, { role });
    return res.data.data;
  }

  async toggleUserStatus(id, isActive) {
    const res = await api.put(`/users/${id}/status`, { isActive });
    return res.data.data;
  }

  async deleteUser(id) {
    const res = await api.delete(`/users/${id}`);
    return res.data.data;
  }

  // --- PASSENGER PROFILE ---
  async updateProfile(data) {
    const res = await api.put("/auth/update", data);
    return res.data.data;
  }

  async searchRoute(sourceId, destinationId) {
    const res = await api.get(`/routes/search?sourceId=${sourceId}&destinationId=${destinationId}`);
    const raw = res.data.data;
    const source = new Station({ id: raw.sourceStation._id, ...raw.sourceStation });
    const dest = new Station({ id: raw.destinationStation._id, ...raw.destinationStation });
    return new MetroRoute({ id: raw._id, sourceStation: source, destinationStation: dest, ...raw });
  }

  async getSchedulesForRoute(routeId, time) {
    const res = await api.get(`/routes/${routeId}/schedules?time=${time}`);
    return res.data.data;
  }

  async calculateFare(routeId, passengerCount = 1) {
    const res = await api.get(`/fares/calculate?routeId=${routeId}&passengerCount=${passengerCount}`);
    return res.data.data;
  }

  async createBooking({ route, schedule, passengerCount, fareAmount, travelDate }) {
    const res = await api.post("/bookings", {
      routeId: route.id,
      scheduleId: schedule?._id,
      passengerCount,
      travelDate,
    });
    const b = res.data.data.booking;
    return new Booking({
      id: b._id,
      bookingRef: b.bookingRef,
      route,
      passengerCount: b.passengerCount,
      fareAmount: b.fareAmount,
      travelDate: b.travelDate,
      status: b.status,
    });
  }

  async getBookingHistory() {
    const res = await api.get("/bookings/history");
    return res.data.data.map((b) => {
      let route = null;
      if (b.route) {
        const source = b.route.sourceStation ? new Station({ id: b.route.sourceStation._id, ...b.route.sourceStation }) : null;
        const dest = b.route.destinationStation ? new Station({ id: b.route.destinationStation._id, ...b.route.destinationStation }) : null;
        route = new MetroRoute({ id: b.route._id, sourceStation: source, destinationStation: dest, ...b.route });
      }
      return new Booking({ id: b._id, bookingRef: b.bookingRef, route, schedule: b.schedule, passengerCount: b.passengerCount, fareAmount: b.fareAmount, travelDate: b.travelDate, status: b.status });
    });
  }

  async submitFeedback({ rating, comments }) {
    const res = await api.post("/feedback", { rating, comments });
    const f = res.data.data;
    return new Feedback({ id: f._id, rating: f.rating, comments: f.comments, createdDate: f.createdAt.slice(0, 10) });
  }

  async getFeedbackList() {
    const res = await api.get("/feedback/my-feedback");
    return res.data.data.map((f) => new Feedback({ id: f._id, rating: f.rating, comments: f.comments, createdDate: f.createdAt.slice(0, 10) }));
  }

  async getAdminOverview() {
    const [stationsRes, routesRes, bookingsRes] = await Promise.all([
      api.get("/stations"),
      api.get("/routes"),
      api.get("/bookings"),
    ]);

    const stations = stationsRes.data.data.map((s) => new Station({ id: s._id, ...s }));
    const routes = routesRes.data.data.map((raw) => {
      const source = raw.sourceStation ? new Station({ id: raw.sourceStation._id, ...raw.sourceStation }) : null;
      const dest = raw.destinationStation ? new Station({ id: raw.destinationStation._id, ...raw.destinationStation }) : null;
      return new MetroRoute({ id: raw._id, sourceStation: source, destinationStation: dest, ...raw });
    });
    const bookings = bookingsRes.data.data.map((b) => {
      let route = null;
      if (b.route) {
        const source = b.route.sourceStation ? new Station({ id: b.route.sourceStation._id, ...b.route.sourceStation }) : null;
        const dest = b.route.destinationStation ? new Station({ id: b.route.destinationStation._id, ...b.route.destinationStation }) : null;
        route = new MetroRoute({ id: b.route._id, sourceStation: source, destinationStation: dest, ...b.route });
      }
      return new Booking({ id: b._id, bookingRef: b.bookingRef, route, schedule: b.schedule, passengerCount: b.passengerCount, fareAmount: b.fareAmount, travelDate: b.travelDate, status: b.status });
    });

    return { stations, routes, bookings };
  }

  // --- Reports & Statistics ---
  async getReportsSummary() {
    const res = await api.get("/reports/summary");
    return res.data.data;
  }

  async getPopularRoutes(limit = 10) {
    const res = await api.get(`/reports/popular-routes?limit=${limit}`);
    return res.data.data;
  }

  async getRevenueByDate(days = 30) {
    const res = await api.get(`/reports/revenue?days=${days}`);
    return res.data.data;
  }

  async getFeedbackStats() {
    const res = await api.get("/reports/feedback-stats");
    return res.data.data;
  }
}

export default new ApiService();

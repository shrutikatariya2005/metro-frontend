import { Station, MetroRoute, Booking, Feedback } from "../models";

const STATIONS_RAW = [
  { id: "s1", stationCode: "STN01", stationName: "Central Station", location: "City Center" },
  { id: "s2", stationCode: "STN02", stationName: "Riverside", location: "East Zone" },
  { id: "s3", stationCode: "STN03", stationName: "Tech Park", location: "West Zone" },
  { id: "s4", stationCode: "STN04", stationName: "Old Town", location: "South Zone" },
];

const ROUTES_RAW = [
  { id: "r1", sourceId: "s1", destinationId: "s2", distanceKm: 5, stops: 3, estimatedTimeMinutes: 12, baseFare: 15 },
  { id: "r2", sourceId: "s1", destinationId: "s3", distanceKm: 8, stops: 5, estimatedTimeMinutes: 18, baseFare: 25 },
  { id: "r3", sourceId: "s1", destinationId: "s4", distanceKm: 3, stops: 2, estimatedTimeMinutes: 8, baseFare: 10 },
];

class MockDataService {
  #stations = STATIONS_RAW.map((s) => new Station({ id: s.id, ...s }));
  #routes = ROUTES_RAW;
  #bookings = this.#seedBookings();
  #feedback = [];

  #seedBookings() {
    const routeA = this.#buildRoute(this.#routes.find((r) => r.id === "r1"));
    const routeB = this.#buildRoute(this.#routes.find((r) => r.id === "r2"));
    return [
      new Booking({ id: "seed1", bookingRef: "TCK-SEED1A", route: routeA, passengerCount: 2, fareAmount: 30, travelDate: "2026-09-01", status: "completed" }),
      new Booking({ id: "seed2", bookingRef: "TCK-SEED2B", route: routeB, passengerCount: 1, fareAmount: 25, travelDate: "2026-09-03", status: "completed" }),
      new Booking({ id: "seed3", bookingRef: "TCK-SEED3C", route: routeA, passengerCount: 3, fareAmount: 45, travelDate: "2026-09-05", status: "confirmed" }),
    ];
  }

  getStations(query = "") {
    const list = query
      ? this.#stations.filter((s) =>
          s.stationName.toLowerCase().includes(query.toLowerCase())
        )
      : this.#stations;
    return Promise.resolve(list);
  }

  #buildRoute(raw) {
    const source = this.#stations.find((s) => s.id === raw.sourceId);
    const destination = this.#stations.find((s) => s.id === raw.destinationId);
    return new MetroRoute({ id: raw.id, sourceStation: source, destinationStation: destination, ...raw });
  }

  searchRoute(sourceId, destinationId) {
    const raw = this.#routes.find(
      (r) => r.sourceId === sourceId && r.destinationId === destinationId
    );
    if (!raw) return Promise.reject(new Error("No available route between the selected stations"));
    return Promise.resolve(this.#buildRoute(raw));
  }

  calculateFare(routeId, passengerCount = 1) {
    const raw = this.#routes.find((r) => r.id === routeId);
    if (!raw) return Promise.reject(new Error("Route not found"));
    return Promise.resolve({
      baseFare: raw.baseFare,
      passengerCount,
      totalFare: raw.baseFare * passengerCount,
    });
  }

  #generateRef() {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TCK-${rand}`;
  }

  createBooking({ route, passengerCount, fareAmount, travelDate }) {
    const booking = new Booking({
      id: `b${this.#bookings.length + 1}`,
      bookingRef: this.#generateRef(),
      route,
      passengerCount,
      fareAmount,
      travelDate,
      status: "confirmed",
    });
    this.#bookings.push(booking);
    return Promise.resolve(booking);
  }

  getBookingHistory() {
    return Promise.resolve([...this.#bookings].reverse());
  }

  submitFeedback({ rating, comments }) {
    const entry = new Feedback({
      id: `f${this.#feedback.length + 1}`,
      rating,
      comments,
      createdDate: new Date().toISOString().slice(0, 10),
    });
    this.#feedback.push(entry);
    return Promise.resolve(entry);
  }

  getFeedbackList() {
    return Promise.resolve([...this.#feedback].reverse());
  }

  getAdminOverview() {
    return Promise.resolve({
      stations: this.#stations,
      routes: this.#routes.map((r) => this.#buildRoute(r)),
      bookings: [...this.#bookings].reverse(),
    });
  }

  getManagerStats() {
    const totalBookings = this.#bookings.length;
    const totalRevenue = this.#bookings.reduce((sum, b) => sum + b.fareAmount, 0);

    const routeCounts = {};
    this.#bookings.forEach((b) => {
      const key = b.route.summary;
      routeCounts[key] = (routeCounts[key] || 0) + 1;
    });
    const popularRoutes = Object.entries(routeCounts)
      .map(([summary, count]) => ({ summary, count }))
      .sort((a, b) => b.count - a.count);

    return Promise.resolve({ totalBookings, totalRevenue, popularRoutes });
  }
}

export default new MockDataService();
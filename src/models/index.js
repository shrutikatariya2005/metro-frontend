export class Station {
  constructor({ id, stationCode, stationName, location }) {
    this.id = id;
    this.stationCode = stationCode;
    this.stationName = stationName;
    this.location = location;
  }

  get label() {
    return `${this.stationName} (${this.stationCode})`;
  }
}

export class MetroRoute {
  constructor({ id, routeNumber, sourceStation, destinationStation, distanceKm, stops, estimatedTimeMinutes }) {
    this.id = id;
    this.routeNumber = routeNumber;           // e.g. "11", "17A"
    this.sourceStation = sourceStation;       // Station instance
    this.destinationStation = destinationStation; // Station instance
    this.distanceKm = distanceKm;
    this.stops = stops;
    this.estimatedTimeMinutes = estimatedTimeMinutes;
  }

  get summary() {
    return `${this.sourceStation.stationName} → ${this.destinationStation.stationName}`;
  }
}

export class Booking {
  constructor({ id, bookingRef, route, schedule, passengerCount, fareAmount, travelDate, status, updatedAt, createdAt, ticket }) {
    this.id = id;
    this._id = id; // alias for MongoDB _id compatibility
    this.bookingRef = bookingRef;
    this.route = route; // MetroRoute instance
    this.schedule = schedule; // Schedule object
    this.passengerCount = passengerCount;
    this.fareAmount = fareAmount;
    this.travelDate = travelDate;
    this.status = status; // "confirmed" | "cancelled" | "completed"
    this.updatedAt = updatedAt || null;
    this.createdAt = createdAt || null;
    this.ticket = ticket || null; // ticket object with validUntil
  }
}
export class Feedback {
  constructor({ id, rating, comments, createdDate }) {
    this.id = id;
    this.rating = rating;
    this.comments = comments;
    this.createdDate = createdDate;
  }
}
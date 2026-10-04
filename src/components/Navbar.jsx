import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const passengerLinks = [
  { label: "Book a ticket", to: "/book" },
  { label: "My bookings", to: "/booking-history" },
  { label: "My Profile", to: "/profile" },
  { label: "Feedback", to: "/feedback" },
];

const staffLinks = [
  { label: "Admin dashboard", to: "/admin" },
  { label: "Manager dashboard", to: "/manager" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-platform">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10 3xl:px-16">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-amber font-display text-lg font-800 text-ink">
            M
          </span>
          <span className="font-display text-lg font-700 tracking-tight sm:text-xl">
            Metro Booking
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {passengerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-amber ${
                  isActive ? "text-amber" : "text-platform/80"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {user && ["admin", "manager"].includes(user.role) && (
            <div className="relative">
              <button
                onClick={() => setStaffOpen((v) => !v)}
                onBlur={() => setTimeout(() => setStaffOpen(false), 150)}
                className="flex items-center gap-1 text-sm font-medium text-platform/80 hover:text-amber"
              >
                Staff
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {staffOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-sm border border-white/10 bg-ink-soft py-1 shadow-lg">
                  {staffLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-4 py-2.5 text-sm text-platform/85 hover:bg-white/5 hover:text-amber"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-platform/80">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-sm bg-white/5 px-4 py-2 text-platform/90 hover:bg-white/10 hover:text-amber"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-sm px-4 py-2 text-sm font-medium text-platform/90 hover:text-amber"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-sm bg-amber px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-amber-dark"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-white/10 bg-ink px-4 pb-4 md:hidden">
          {passengerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block border-b border-white/5 py-3 text-sm font-medium text-platform/85"
            >
              {link.label}
            </NavLink>
          ))}

          {user && ["admin", "manager"].includes(user.role) && (
            <>
              <p className="mt-3 text-small font-medium uppercase tracking-wide text-platform/40">
                Staff
              </p>
              {staffLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/5 py-3 text-sm font-medium text-platform/85"
                >
                  {link.label}
                </NavLink>
              ))}
            </>
          )}

          <div className="mt-3 flex gap-3">
            {user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex-1 rounded-sm border border-white/20 py-2.5 text-center text-sm font-medium"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-sm border border-white/20 py-2.5 text-center text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-sm bg-amber py-2.5 text-center text-sm font-semibold text-ink"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
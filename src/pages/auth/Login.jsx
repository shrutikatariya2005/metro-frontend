// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1600px] items-center px-4 py-10 sm:px-6 lg:px-10 3xl:px-16">
      <div className="mx-auto w-full max-w-md rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
        <p className="font-display text-sm font-700 uppercase tracking-wide text-route">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-h1 font-800 text-ink">Log in</h1>
        <p className="mt-2 text-body text-slate">
          Access your bookings and continue where you left off.
        </p>

        {error && (
          <p className="mt-4 rounded-sm bg-alert-soft px-4 py-2.5 text-small text-alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="block text-small font-medium text-ink">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20"
            />
          </div>
          <div>
            <label className="block text-small font-medium text-ink">Password</label>
            <div className="relative flex items-center mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate hover:text-ink text-xs font-bold"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-sm bg-ink py-3 font-semibold text-platform transition-colors hover:bg-ink-soft"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-small text-slate">
          <div>
            New here?{" "}
            <Link to="/register" className="font-medium text-route hover:underline">
              Create an account
            </Link>
          </div>
          <div>
            <Link to="/forgot-password" className="font-medium text-slate hover:text-route hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
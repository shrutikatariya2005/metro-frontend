import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const { requestOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await requestOtp(email);
      setStep(2);
      setMsg("OTP sent to your email. It is valid for 10 minutes.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await resetPassword({ email, otp, newPassword });
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/book");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <section className="mx-auto flex max-w-[1600px] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-10">
      <div className="w-full max-w-md rounded-sm border border-ink/10 bg-white p-6 sm:p-8">
        <h1 className="font-display text-h2 font-800 text-ink">Reset password</h1>
        <p className="mt-2 text-body text-slate">
          {step === 1 ? "Enter your email to receive an OTP." : "Enter the OTP sent to your email and your new password."}
        </p>

        {error && (
          <p className="mt-4 rounded-sm bg-red-50 px-4 py-2 text-small text-red-600">
            {error}
          </p>
        )}
        {msg && (
          <p className="mt-4 rounded-sm bg-route-soft px-4 py-2 text-small text-route">
            {msg}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-small font-medium text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-sm bg-ink py-3 font-semibold text-platform hover:bg-ink-soft"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-small font-medium text-ink">Email</label>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1 w-full rounded-sm border border-ink/10 bg-platform px-4 py-2.5 text-body text-slate"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-ink">New Password</label>
              <div className="relative flex items-center mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-sm border border-ink/15 px-4 py-2.5 text-body outline-none focus:border-route focus:ring-2 focus:ring-route/20 pr-10"
                  placeholder="••••••••"
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
              className="mt-2 rounded-sm bg-amber py-3 font-semibold text-ink hover:bg-amber-dark"
            >
              Reset & Login
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-small text-slate">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-route hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

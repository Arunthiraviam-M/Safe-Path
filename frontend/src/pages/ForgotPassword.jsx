import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordRequest } from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await forgotPasswordRequest(email);
      setMessage(data.message);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-cyan-400 mb-1">Reset your password</h1>
        <p className="text-white/50 text-sm mb-8">
          Enter your account email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {message && <p className="text-white/70 text-sm mt-4">{message}</p>}

        <p className="text-white/50 text-sm text-center mt-6">
          <Link to="/login" className="text-cyan-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

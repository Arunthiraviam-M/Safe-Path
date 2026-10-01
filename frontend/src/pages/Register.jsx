import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-navy-950">
      <div className="w-full max-w-lg glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-cyan-400 mb-1">Create your account</h1>
        <p className="text-white/50 text-sm mb-8">Join SafePath AI in under a minute.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70">First name</label>
              <input name="firstName" required value={form.firstName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-white/70">Last name</label>
              <input name="lastName" required value={form.lastName} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70">Phone number</label>
              <input name="phoneNumber" required value={form.phoneNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-white/70">Date of birth</label>
              <input type="date" name="dateOfBirth" required value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70">Password</label>
              <input type="password" name="password" required value={form.password} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-white/70">Confirm password</label>
              <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {error && <p className="text-accent-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-white/50 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

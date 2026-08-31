import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [phone, setPhone] = useState("+91 9812345678");
  const [password, setPassword] = useState("farmer123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(phone, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Sign in to KrishiMitra AI</h1>
          <p className="text-xs text-slate-500 mt-1">Access your farming profile, analyses, and dealer messages</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          New farmer or dealer?{" "}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

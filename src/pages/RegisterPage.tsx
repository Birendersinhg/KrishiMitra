import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FARMER" | "DEALER">("FARMER");
  const [district, setDistrict] = useState("Cuttack");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({
        name,
        phone,
        password,
        role,
        district,
        shopName: role === "DEALER" ? shopName : undefined,
      });
      navigate(role === "DEALER" ? "/dealer-dashboard" : "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account.");
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
          <h1 className="text-xl font-bold text-slate-900">Join KrishiMitra AI</h1>
          <p className="text-xs text-slate-500 mt-1">Register as a Farmer or Verified Agro Dealer</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole("FARMER")}
              className={`py-2 rounded-lg transition-all cursor-pointer ${role === "FARMER" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"}`}
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => setRole("DEALER")}
              className={`py-2 rounded-lg transition-all cursor-pointer ${role === "DEALER" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"}`}
            >
              Agro Dealer
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">District (Odisha)</label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Cuttack, Puri, Bhubaneswar, etc."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {role === "DEALER" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shop / Business Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Kisan Seva Kendra"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

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
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creating account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

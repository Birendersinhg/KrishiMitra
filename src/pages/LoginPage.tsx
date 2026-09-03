import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, AlertCircle, Phone, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = clean.length === 10 ? `+91${clean}` : phone;
      await sendOTP(fullPhone);
      setOtpSent(true);
      setStep("otp");
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const clean = phone.replace(/\D/g, "");
      const fullPhone = clean.length === 10 ? `+91${clean}` : phone;
      const success = await verifyOTP(fullPhone, otp);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Account not found. Please register first, or check your OTP.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">AgriNexus</h1>
          <p className="text-xs text-slate-500 mt-1">Smart Kheti Sahayak</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              Change number
            </button>

            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-700 font-semibold">OTP sent to</p>
              <p className="text-sm font-bold text-emerald-900">+91 {phone}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enter 6-digit OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-2xl font-bold text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Check console for demo OTP • Expires in 5 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Naya kisan hai?{" "}
            <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
              Register karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSelector from "../common/LanguageSelector";
import NotificationBell from "../common/NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">KrishiMitra <span className="text-emerald-600">AI</span></span>
              <span className="block text-[9px] font-semibold text-slate-400 tracking-wider uppercase">Farmer's Friend</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/dashboard" className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors">
              {t("dashboard") || "Dashboard"}
            </Link>
            <Link to="/analyze" className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors">
              {t("diagnosisTitle") || "Crop Doctor"}
            </Link>
            <Link to="/weather" className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors">
              {t("weatherTitle") || "Weather"}
            </Link>
            <Link to="/products" className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors">
              Store
            </Link>
            <Link to="/dealers" className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors">
              Dealers
            </Link>

            {/* AI Engines Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAiMenuOpen(!aiMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span>AI Engines</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {aiMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAiMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200/80 p-2 z-50 space-y-1">
                    <Link
                      to="/digital-twin"
                      onClick={() => setAiMenuOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-emerald-50 text-xs transition-colors"
                    >
                      <span className="font-bold text-slate-900 block">?? Digital Twin Engine</span>
                      <span className="text-[11px] text-slate-500">Dynamic farm state & soil strata</span>
                    </Link>
                    <Link
                      to="/consensus-engine"
                      onClick={() => setAiMenuOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-violet-50 text-xs transition-colors"
                    >
                      <span className="font-bold text-slate-900 block">?? Multi-Agent Consensus</span>
                      <span className="text-[11px] text-slate-500">LangGraph / CrewAI debate theater</span>
                    </Link>
                    <Link
                      to="/what-if-simulation"
                      onClick={() => setAiMenuOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-amber-50 text-xs transition-colors"
                    >
                      <span className="font-bold text-slate-900 block">?? "What-If" Simulation</span>
                      <span className="text-[11px] text-slate-500">Climate perturbation & yield curves</span>
                    </Link>
                    <Link
                      to="/agronomy-rag"
                      onClick={() => setAiMenuOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-teal-50 text-xs transition-colors"
                    >
                      <span className="font-bold text-slate-900 block">?? Agronomy RAG & Guardrails</span>
                      <span className="text-[11px] text-slate-500">ICAR / OUAT verified vector store</span>
                    </Link>
                    <Link
                      to="/field-mapping"
                      onClick={() => setAiMenuOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-blue-50 text-xs transition-colors"
                    >
                      <span className="font-bold text-slate-900 block">??? GIS Field Polygon Mapping</span>
                      <span className="text-[11px] text-slate-500">Satellite spectral NDVI overlays</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSelector />
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

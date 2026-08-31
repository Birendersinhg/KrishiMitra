import React from "react";
import { Link } from "react-router-dom";
import { Sprout, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <span>KrishiMitra AI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Empowering farmers across Odisha and India with instant AI crop disease detection, pinpoint city weather forecasting, verified dealer contacts, and authentic marketplace links.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/analyze" className="hover:text-emerald-400">Crop Disease Doctor</Link></li>
              <li><Link to="/soil-analysis" className="hover:text-emerald-400">Soil Health Test</Link></li>
              <li><Link to="/weather" className="hover:text-emerald-400">Pinpoint Weather</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400">Fertilizer Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Regional Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dealers" className="hover:text-emerald-400">Verified Odisha Dealers</Link></li>
              <li><Link to="/assistant" className="hover:text-emerald-400">Odia / Hindi AI Chatbot</Link></li>
              <li><Link to="/learn" className="hover:text-emerald-400">Farming Knowledge Base</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-400">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <span>Built for Farmers of Odisha & India with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>
      </div>
    </footer>
  );
}

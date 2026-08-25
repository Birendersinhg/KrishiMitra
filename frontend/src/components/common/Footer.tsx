import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:kx-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">??</span>
              <span className="text-xl font-bold text-white">KrishiMitra AI</span>
            </div>
            <p className="text-sm">
              AI assistant for Indian farmers. Crop disease detection, weather, and local dealers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/analyze" className="hover:text-emerald-400">Crop Diagnosis</Link></li>
              <li><Link to="/soil-analysis" className="hover:text-emerald-400">Soil Health</Link></li>
              <li><Link to="/weather" className="hover:text-emerald-400">Weather & Forecast</Link></li>
              <li><Link to="/assistant" className="hover:text-emerald-400">AI Chat Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-emerald-400">Amazon & Flipkart Inventory</Link></li>
              <li><Link to="/dealers" className="hover:text-emerald-400">Local Dealers</Link></li>
              <li><Link to="/post-crop" className="hover:text-emerald-400">Post Crop Issue</Link></li>
              <li><Link to="/learn" className="hover:text-emerald-400">Odisha Farming Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Helplines</h4>
            <ul className="space-y-2 text-sm">
              <li>Kisan Call Centre: <a href="tel:18001801551" className="text-emerald-400">1800-180-1551</a></li>
              <li>Odisha Agri Helpline: <a href="tel:155333" className="text-emerald-400">155333</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs">
          &copy; 2026 KrishiMitra AI. Built for Indian Farmers.
        </div>
      </div>
    </footer>
  );
}

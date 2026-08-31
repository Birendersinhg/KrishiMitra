import React, { useState } from "react";
import { User, Save, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function FarmerProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "Ramesh Kumar");
  const [phone, setPhone] = useState(user?.phone || "+91 9812345678");
  const [farmSize, setFarmSize] = useState("3.5 Acres");
  const [primaryCrops, setPrimaryCrops] = useState("Paddy, Tomato, Mustard");
  const [soilType, setSoilType] = useState("Alluvial Loam");
  const [irrigation, setIrrigation] = useState("Canal & Borewell");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Farmer Profile</h1>
            <p className="text-xs text-slate-500">Manage your farming details and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Size (Acres)</label>
              <input type="text" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
              <input type="text" value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Crops</label>
            <input type="text" value={primaryCrops} onChange={(e) => setPrimaryCrops(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation System</label>
            <input type="text" value={irrigation} onChange={(e) => setIrrigation(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2">
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Profile Updated!" : "Save Profile"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

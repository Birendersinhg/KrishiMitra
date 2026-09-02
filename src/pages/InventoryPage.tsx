import React, { useState } from "react";
import { Package, Plus, Trash2, TrendingUp, MapPin, Calendar, Scale, AlertTriangle, Sparkles, X } from "lucide-react";

interface InventoryItem {
  id: string;
  cropName: string;
  quantity: number;
  unit: "kg" | "quintal";
  harvestDate: string;
  grade: "A" | "B" | "C";
  storageLocation: "home" | "warehouse" | "cold-storage";
  pricePerKg: number;
  status: "available" | "listed" | "sold";
  notes: string;
}

const STORAGE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  home: { label: "Home Storage", icon: "🏠", color: "bg-amber-50 text-amber-800 border-amber-200" },
  warehouse: { label: "Co-op Warehouse", icon: "🏭", color: "bg-blue-50 text-blue-800 border-blue-200" },
  "cold-storage": { label: "Cold Storage", icon: "❄️", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
};

const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-rose-100 text-rose-800",
};

const MOCK_INVENTORY: InventoryItem[] = [
  { id: "1", cropName: "Paddy (Swarna Sub-1)", quantity: 45, unit: "quintal", harvestDate: "2026-08-15", grade: "A", storageLocation: "warehouse", pricePerKg: 22.5, status: "available", notes: "High quality long grain" },
  { id: "2", cropName: "Tomato (Hybrid)", quantity: 800, unit: "kg", harvestDate: "2026-08-28", grade: "B", storageLocation: "home", pricePerKg: 18, status: "listed", notes: "Slightly overripe" },
  { id: "3", cropName: "Mustard", quantity: 12, unit: "quintal", harvestDate: "2026-07-20", grade: "A", storageLocation: "warehouse", pricePerKg: 55, status: "available", notes: "Premium yellow mustard" },
  { id: "4", cropName: "Brinjal (Round)", quantity: 350, unit: "kg", harvestDate: "2026-09-01", grade: "A", storageLocation: "cold-storage", pricePerKg: 25, status: "available", notes: "Fresh harvest, stored in cold" },
  { id: "5", cropName: "Maize", quantity: 20, unit: "quintal", harvestDate: "2026-08-05", grade: "C", storageLocation: "home", pricePerKg: 16, status: "sold", notes: "Sold to local miller" },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "available" | "listed" | "sold">("all");

  const [newItem, setNewItem] = useState({
    cropName: "Paddy",
    quantity: "",
    unit: "quintal" as "kg" | "quintal",
    harvestDate: new Date().toISOString().split("T")[0],
    grade: "A" as "A" | "B" | "C",
    storageLocation: "home" as "home" | "warehouse" | "cold-storage",
    pricePerKg: "",
    notes: "",
  });

  const addNewItem = () => {
    if (!newItem.quantity || !newItem.cropName) return;
    const item: InventoryItem = {
      id: Date.now().toString(),
      cropName: newItem.cropName,
      quantity: parseFloat(newItem.quantity),
      unit: newItem.unit,
      harvestDate: newItem.harvestDate,
      grade: newItem.grade,
      storageLocation: newItem.storageLocation,
      pricePerKg: parseFloat(newItem.pricePerKg) || 0,
      status: "available",
      notes: newItem.notes,
    };
    setInventory((prev) => [item, ...prev]);
    setShowAddForm(false);
    setNewItem({ cropName: "Paddy", quantity: "", unit: "quintal", harvestDate: new Date().toISOString().split("T")[0], grade: "A", storageLocation: "home", pricePerKg: "", notes: "" });
  };

  const deleteItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = inventory.filter((item) => filter === "all" || item.status === filter);

  const totalStockKg = inventory
    .filter((i) => i.status !== "sold")
    .reduce((sum, i) => sum + (i.unit === "quintal" ? i.quantity * 100 : i.quantity), 0);

  const totalValue = inventory
    .filter((i) => i.status !== "sold")
    .reduce((sum, i) => {
      const kg = i.unit === "quintal" ? i.quantity * 100 : i.quantity;
      return sum + kg * i.pricePerKg;
    }, 0);

  const avgGrade = inventory.filter((i) => i.status !== "sold").length > 0
    ? inventory.filter((i) => i.status !== "sold").reduce((s, i) => s + (i.grade === "A" ? 3 : i.grade === "B" ? 2 : 1), 0) / inventory.filter((i) => i.status !== "sold").length
    : 0;

  const priceSuggestion = (cropName: string, grade: string): number => {
    const basePrices: Record<string, number> = {
      "Paddy": 22, "Tomato": 20, "Mustard": 55, "Brinjal": 25, "Maize": 17, "Potato": 15, "Chilli": 80,
    };
    const base = basePrices[cropName.split(" ")[0]] || 20;
    const gradeMultiplier = grade === "A" ? 1.15 : grade === "B" ? 1.0 : 0.85;
    return Math.round(base * gradeMultiplier * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>Post-Harvest Produce Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Inventory</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Track, manage, and price your harvested produce</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Harvest</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Stock</p>
                <p className="text-lg font-extrabold text-slate-900">{totalStockKg.toLocaleString()} kg</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Est. Value</p>
                <p className="text-lg font-extrabold text-slate-900">₹{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Avg Grade</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {avgGrade >= 2.5 ? "A" : avgGrade >= 1.5 ? "B" : "C"}
                  <span className="text-xs text-slate-400 font-normal ml-1">({avgGrade.toFixed(1)}/3.0)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "available", "listed", "sold"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === f ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({inventory.filter((i) => i.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No inventory items found</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Harvest" to register your produce</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crop</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grade</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harvest Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price/kg</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Suggested</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const storage = STORAGE_LABELS[item.storageLocation];
                    const suggested = priceSuggestion(item.cropName, item.grade);
                    const priceDiff = item.pricePerKg > 0 ? ((item.pricePerKg - suggested) / suggested) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.cropName}</p>
                            {item.notes && <p className="text-[10px] text-slate-400 mt-0.5">{item.notes}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                          <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${GRADE_COLORS[item.grade]}`}>
                            Grade {item.grade}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${storage.color}`}>
                            <span>{storage.icon}</span>
                            <span>{storage.label}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(item.harvestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-800">₹{item.pricePerKg}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-700">₹{suggested}</span>
                            {item.pricePerKg > 0 && (
                              <span className={`text-[10px] font-semibold ${priceDiff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "available" ? "bg-emerald-50 text-emerald-700" :
                            item.status === "listed" ? "bg-blue-50 text-blue-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Harvested Produce</h3>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Crop Name</label>
                <select value={newItem.cropName} onChange={(e) => setNewItem({ ...newItem, cropName: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {["Paddy", "Tomato", "Mustard", "Potato", "Maize", "Brinjal", "Chilli", "Groundnut", "Moong", "Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity</label>
                  <input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="e.g. 45" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit</label>
                  <div className="flex gap-2">
                    {(["kg", "quintal"] as const).map((u) => (
                      <button key={u} onClick={() => setNewItem({ ...newItem, unit: u })} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${newItem.unit === u ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {u === "quintal" ? "Quintal (100kg)" : "Kilogram"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Harvest Date</label>
                  <input type="date" value={newItem.harvestDate} onChange={(e) => setNewItem({ ...newItem, harvestDate: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quality Grade</label>
                  <div className="flex gap-2">
                    {(["A", "B", "C"] as const).map((g) => (
                      <button key={g} onClick={() => setNewItem({ ...newItem, grade: g })} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${newItem.grade === g ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        Grade {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Storage Location</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["home", "warehouse", "cold-storage"] as const).map((loc) => {
                    const s = STORAGE_LABELS[loc];
                    return (
                      <button key={loc} onClick={() => setNewItem({ ...newItem, storageLocation: loc })} className={`py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${newItem.storageLocation === loc ? "bg-emerald-600 text-white border-emerald-600" : `${s.color} border-current`}`}>
                        <span className="block text-base mb-0.5">{s.icon}</span>
                        <span className="block text-[10px]">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price per Kg (₹)</label>
                <input type="number" value={newItem.pricePerKg} onChange={(e) => setNewItem({ ...newItem, pricePerKg: e.target.value })} placeholder={`AI suggests ₹${priceSuggestion(newItem.cropName, newItem.grade)}/kg`} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Suggested: ₹{priceSuggestion(newItem.cropName, newItem.grade)}/kg for Grade {newItem.grade} {newItem.cropName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes (optional)</label>
                <textarea value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} rows={2} placeholder="e.g. High quality long grain, premium quality..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>
            </div>

            <button onClick={addNewItem} disabled={!newItem.quantity} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer">
              Add to Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

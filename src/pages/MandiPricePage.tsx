import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, MapPin, Sparkles, RefreshCw, ArrowUp, ArrowDown, BarChart3, Clock, Navigation } from "lucide-react";

interface MandiPrice {
  id: string;
  mandi: string;
  district: string;
  crop: string;
  price: number;
  unit: string;
  change: number;
  changePercent: number;
  distance: string;
}

const MANDI_CATALOG: Record<string, MandiPrice[]> = {
  Delhi: [
    { id: "d1", mandi: "Azadpur Mandi", district: "North Delhi", crop: "Paddy", price: 2250, unit: "₹/quintal", change: 50, changePercent: 2.3, distance: "3.2 km" },
    { id: "d2", mandi: "Najafgarh Mandi", district: "South West Delhi", crop: "Paddy", price: 2200, unit: "₹/quintal", change: 30, changePercent: 1.4, distance: "18 km" },
    { id: "d3", mandi: "Okhla Mandi", district: "South Delhi", crop: "Tomato", price: 1980, unit: "₹/quintal", change: -60, changePercent: -2.9, distance: "12 km" },
    { id: "d4", mandi: "Azadpur Mandi", district: "North Delhi", crop: "Tomato", price: 2050, unit: "₹/quintal", change: 40, changePercent: 2.0, distance: "3.2 km" },
    { id: "d5", mandi: "Ghazipur Mandi", district: "East Delhi", crop: "Mustard", price: 5650, unit: "₹/quintal", change: 150, changePercent: 2.7, distance: "8 km" },
    { id: "d6", mandi: "Azadpur Mandi", district: "North Delhi", crop: "Mustard", price: 5600, unit: "₹/quintal", change: 80, changePercent: 1.5, distance: "3.2 km" },
    { id: "d7", mandi: "Okhla Mandi", district: "South Delhi", crop: "Potato", price: 1620, unit: "₹/quintal", change: -30, changePercent: -1.8, distance: "12 km" },
    { id: "d8", mandi: "Ghazipur Mandi", district: "East Delhi", crop: "Maize", price: 1850, unit: "₹/quintal", change: 45, changePercent: 2.5, distance: "8 km" },
  ],
  Maharashtra: [
    { id: "m1", mandi: "Vashi APMC", district: "Navi Mumbai", crop: "Tomato", price: 2200, unit: "₹/quintal", change: 80, changePercent: 3.8, distance: "5 km" },
    { id: "m2", mandi: "Pune APMC", district: "Pune", crop: "Paddy", price: 2180, unit: "₹/quintal", change: 35, changePercent: 1.6, distance: "120 km" },
    { id: "m3", mandi: "Nashik APMC", district: "Nashik", crop: "Onion", price: 1800, unit: "₹/quintal", change: -120, changePercent: -6.3, distance: "170 km" },
    { id: "m4", mandi: "Vashi APMC", district: "Navi Mumbai", crop: "Potato", price: 1580, unit: "₹/quintal", change: 20, changePercent: 1.3, distance: "5 km" },
    { id: "m5", mandi: "Pune APMC", district: "Pune", crop: "Mustard", price: 5400, unit: "₹/quintal", change: 60, changePercent: 1.1, distance: "120 km" },
  ],
  Karnataka: [
    { id: "k1", mandi: "BMIC Requitin Market", district: "Bengaluru", crop: "Tomato", price: 2400, unit: "₹/quintal", change: 120, changePercent: 5.3, distance: "8 km" },
    { id: "k2", mandi: "Mysuru APMC", district: "Mysuru", crop: "Paddy", price: 2150, unit: "₹/quintal", change: 20, changePercent: 0.9, distance: "150 km" },
    { id: "k3", mandi: "BMIC Requitin Market", district: "Bengaluru", crop: "Maize", price: 1780, unit: "₹/quintal", change: -40, changePercent: -2.2, distance: "8 km" },
    { id: "k4", mandi: "Davangere APMC", district: "Davangere", crop: "Paddy", price: 2100, unit: "₹/quintal", change: 15, changePercent: 0.7, distance: "270 km" },
  ],
  "Tamil Nadu": [
    { id: "t1", mandi: "Koyambedu Market", district: "Chennai", crop: "Tomato", price: 2100, unit: "₹/quintal", change: -80, changePercent: -3.7, distance: "15 km" },
    { id: "t2", mandi: "Coimbatore APMC", district: "Coimbatore", crop: "Paddy", price: 2200, unit: "₹/quintal", change: 30, changePercent: 1.4, distance: "510 km" },
    { id: "t3", mandi: "Koyambedu Market", district: "Chennai", crop: "Mustard", price: 5500, unit: "₹/quintal", change: 100, changePercent: 1.9, distance: "15 km" },
  ],
  "Uttar Pradesh": [
    { id: "u1", mandi: "Ghazipur Mandi", district: "Lucknow", crop: "Paddy", price: 2100, unit: "₹/quintal", change: 25, changePercent: 1.2, distance: "10 km" },
    { id: "u2", mandi: "Agra Mandi", district: "Agra", crop: "Potato", price: 1450, unit: "₹/quintal", change: -35, changePercent: -2.4, distance: "330 km" },
    { id: "u3", mandi: "Ghazipur Mandi", district: "Lucknow", crop: "Tomato", price: 1900, unit: "₹/quintal", change: 50, changePercent: 2.7, distance: "10 km" },
    { id: "u4", mandi: "Varanasi Mandi", district: "Varanasi", crop: "Mustard", price: 5350, unit: "₹/quintal", change: 70, changePercent: 1.3, distance: "280 km" },
  ],
  Punjab: [
    { id: "p1", mandi: "Khanna Mandi", district: "Ludhiana", crop: "Paddy", price: 2300, unit: "₹/quintal", change: 40, changePercent: 1.8, distance: "25 km" },
    { id: "p2", mandi: "Ludhiana Mandi", district: "Ludhiana", crop: "Mustard", price: 5700, unit: "₹/quintal", change: 180, changePercent: 3.3, distance: "8 km" },
    { id: "p3", mandi: "Khanna Mandi", district: "Ludhiana", crop: "Potato", price: 1550, unit: "₹/quintal", change: -20, changePercent: -1.3, distance: "25 km" },
  ],
};

const PRICE_HISTORY: Record<string, { date: string; price: number }[]> = {
  Paddy: [
    { date: "Aug 20", price: 2050 }, { date: "Aug 22", price: 2080 }, { date: "Aug 24", price: 2065 },
    { date: "Aug 26", price: 2100 }, { date: "Aug 28", price: 2130 }, { date: "Aug 30", price: 2155 },
    { date: "Sep 1", price: 2180 }, { date: "Sep 2", price: 2200 },
  ],
  Tomato: [
    { date: "Aug 20", price: 2250 }, { date: "Aug 22", price: 2180 }, { date: "Aug 24", price: 2100 },
    { date: "Aug 26", price: 2020 }, { date: "Aug 28", price: 1960 }, { date: "Aug 30", price: 1930 },
    { date: "Sep 1", price: 1950 }, { date: "Sep 2", price: 1980 },
  ],
  Mustard: [
    { date: "Aug 20", price: 5300 }, { date: "Aug 22", price: 5350 }, { date: "Aug 24", price: 5380 },
    { date: "Aug 26", price: 5420 }, { date: "Aug 28", price: 5460 }, { date: "Aug 30", price: 5500 },
    { date: "Sep 1", price: 5530 }, { date: "Sep 2", price: 5560 },
  ],
};

const PREDICTIONS: Record<string, { date: string; predicted: number; confidence: number; trend: "up" | "down" | "stable" }[]> = {
  Paddy: [
    { date: "Sep 3", predicted: 2220, confidence: 88, trend: "up" },
    { date: "Sep 4", predicted: 2235, confidence: 85, trend: "up" },
    { date: "Sep 5", predicted: 2230, confidence: 82, trend: "stable" },
    { date: "Sep 6", predicted: 2215, confidence: 78, trend: "down" },
    { date: "Sep 7", predicted: 2210, confidence: 75, trend: "down" },
    { date: "Sep 8", predicted: 2220, confidence: 72, trend: "up" },
    { date: "Sep 9", predicted: 2240, confidence: 70, trend: "up" },
  ],
  Tomato: [
    { date: "Sep 3", predicted: 1950, confidence: 85, trend: "down" },
    { date: "Sep 4", predicted: 1910, confidence: 80, trend: "down" },
    { date: "Sep 5", predicted: 1880, confidence: 75, trend: "down" },
    { date: "Sep 6", predicted: 1900, confidence: 70, trend: "up" },
    { date: "Sep 7", predicted: 1940, confidence: 68, trend: "up" },
    { date: "Sep 8", predicted: 1970, confidence: 65, trend: "up" },
    { date: "Sep 9", predicted: 1990, confidence: 62, trend: "up" },
  ],
  Mustard: [
    { date: "Sep 3", predicted: 5590, confidence: 90, trend: "up" },
    { date: "Sep 4", predicted: 5610, confidence: 87, trend: "up" },
    { date: "Sep 5", predicted: 5620, confidence: 84, trend: "up" },
    { date: "Sep 6", predicted: 5615, confidence: 80, trend: "stable" },
    { date: "Sep 7", predicted: 5600, confidence: 76, trend: "down" },
    { date: "Sep 8", predicted: 5595, confidence: 73, trend: "stable" },
    { date: "Sep 9", predicted: 5610, confidence: 70, trend: "up" },
  ],
};

const CROPS = ["Paddy", "Tomato", "Mustard", "Potato", "Maize"];

function getStateFromLocation(city: string): string {
  const stateMap: Record<string, string> = {
    "delhi": "Delhi", "mumbai": "Maharashtra", "pune": "Maharashtra", "nashik": "Maharashtra",
    "bengaluru": "Karnataka", "bangalore": "Karnataka", "mysuru": "Karnataka",
    "chennai": "Tamil Nadu", "coimbatore": "Tamil Nadu",
    "lucknow": "Uttar Pradesh", "agra": "Uttar Pradesh", "varanasi": "Uttar Pradesh",
    "ludhiana": "Punjab", "chandigarh": "Punjab",
  };
  const lower = city.toLowerCase();
  for (const [key, state] of Object.entries(stateMap)) {
    if (lower.includes(key)) return state;
  }
  return "Delhi";
}

export default function MandiPricePage() {
  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [userLocation, setUserLocation] = useState({ city: "", state: "" });
  const [locationLoading, setLocationLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state || "";
            const state = data.address?.state || "";
            setUserLocation({ city, state: getStateFromLocation(city || state) });
          } catch {
            setUserLocation({ city: "New Delhi", state: "Delhi" });
          } finally {
            setLocationLoading(false);
          }
        },
        () => {
          setUserLocation({ city: "New Delhi", state: "Delhi" });
          setLocationLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      setUserLocation({ city: "New Delhi", state: "Delhi" });
      setLocationLoading(false);
    }
  }, []);

  const stateName = userLocation.state || "Delhi";
  const mandis = (MANDI_CATALOG[stateName] || MANDI_CATALOG["Delhi"]).filter((p) => p.crop === selectedCrop);
  const bestMandi = mandis.length > 0 ? mandis.reduce((b, c) => (c.price > b.price ? c : b), mandis[0]) : null;
  const worstMandi = mandis.length > 0 ? mandis.reduce((w, c) => (c.price < w.price ? c : w), mandis[0]) : null;
  const avgPrice = mandis.length > 0 ? Math.round(mandis.reduce((s, p) => s + p.price, 0) / mandis.length) : 0;
  const history = PRICE_HISTORY[selectedCrop] || [];
  const predictions = PREDICTIONS[selectedCrop] || [];

  const maxH = Math.max(...history.map((h) => h.price));
  const minH = Math.min(...history.map((h) => h.price));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Live APMC Mandi Prices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Mandi Price Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              {locationLoading ? "Detecting your location..." : `Showing mandis near ${userLocation.city || "you"} (${stateName})`}
            </p>
          </div>
        </div>

        {/* Crop Selector */}
        <div className="flex flex-wrap gap-2">
          {CROPS.map((crop) => (
            <button key={crop} onClick={() => setSelectedCrop(crop)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selectedCrop === crop ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {crop}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Average Price</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">₹{avgPrice.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">per quintal</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <p className="text-[10px] text-emerald-500 font-semibold uppercase">Best Mandi</p>
            <p className="text-sm font-bold text-emerald-700 mt-1">{bestMandi?.mandi || "N/A"}</p>
            <p className="text-[10px] text-emerald-600 font-bold">₹{bestMandi?.price.toLocaleString()}/q</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <p className="text-[10px] text-rose-500 font-semibold uppercase">Lowest Price</p>
            <p className="text-sm font-bold text-rose-700 mt-1">{worstMandi?.mandi || "N/A"}</p>
            <p className="text-[10px] text-rose-600 font-bold">₹{worstMandi?.price.toLocaleString()}/q</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <p className="text-[10px] text-violet-500 font-semibold uppercase">Price Spread</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">₹{bestMandi && worstMandi ? (bestMandi.price - worstMandi.price).toLocaleString() : 0}</p>
            <p className="text-[10px] text-slate-400">max difference</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Price Table */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Nearby Mandi Prices</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Live</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mandis.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No mandi prices for {selectedCrop} in {stateName}</div>
                ) : (
                  mandis.map((p) => (
                    <div key={p.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.mandi}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{p.district} &bull; {p.distance}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-900">₹{p.price.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold flex items-center gap-0.5 justify-end ${p.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {p.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {p.change >= 0 ? "+" : ""}{p.change} ({p.changePercent >= 0 ? "+" : ""}{p.changePercent}%)
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Best Day Advisory */}
            {bestMandi && (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <h3 className="text-xs font-bold">AI Best Day to Sell Advisory</h3>
                </div>
                <p className="text-sm font-semibold mb-2">
                  Sell <span className="font-extrabold">{selectedCrop}</span> at <span className="font-extrabold">{bestMandi.mandi}</span>
                </p>
                <div className="bg-white/15 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-200">📊</span>
                    <span>Best price: <span className="font-bold">₹{bestMandi.price.toLocaleString()}/quintal</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-200">📈</span>
                    <span>7-day outlook: <span className="font-bold">{predictions[0]?.trend === "up" ? "Prices expected to rise" : predictions[0]?.trend === "down" ? "Sell soon — prices may drop" : "Prices stable"}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-200">💡</span>
                    <span className="font-bold">{predictions[0]?.trend === "up" ? "Consider waiting 2-3 days for better prices" : "Sell now to avoid further decline"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Trend & Prediction */}
          <div className="lg:col-span-7 space-y-6">
            {history.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  14-Day Price Trend — {selectedCrop}
                </h3>
                <div className="flex items-end gap-1 h-48">
                  {history.map((h, i) => {
                    const height = ((h.price - minH + 100) / (maxH - minH + 200)) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-semibold text-slate-500">₹{h.price}</span>
                        <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all" style={{ height: `${Math.max(height, 10)}%` }} />
                        <span className="text-[8px] text-slate-400 mt-0.5">{h.date.split(" ")[1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {predictions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    AI 7-Day Price Prediction — {selectedCrop}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold">ML Model</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase">Date</th>
                        <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase">Predicted Price</th>
                        <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase">Confidence</th>
                        <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {predictions.map((pred, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 text-xs font-semibold text-slate-700">{pred.date}</td>
                          <td className="py-2.5 text-xs font-bold text-slate-900">₹{pred.predicted.toLocaleString()}</td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pred.confidence >= 80 ? "bg-emerald-500" : pred.confidence >= 70 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pred.confidence}%` }} />
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500">{pred.confidence}%</span>
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${pred.trend === "up" ? "text-emerald-600" : pred.trend === "down" ? "text-rose-600" : "text-slate-500"}`}>
                              {pred.trend === "up" ? <TrendingUp className="w-3 h-3" /> : pred.trend === "down" ? <TrendingDown className="w-3 h-3" /> : <span className="w-3 h-3 flex items-center justify-center">→</span>}
                              {pred.trend === "up" ? "Rising" : pred.trend === "down" ? "Falling" : "Stable"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mandis.length >= 2 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-4">Mandi Price Comparison</h3>
                <div className="space-y-3">
                  {mandis.sort((a, b) => b.price - a.price).map((p, i) => {
                    const barW = (p.price / (bestMandi?.price || p.price)) * 100;
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 w-4 text-right">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-slate-700">{p.mandi}</span>
                            <span className="text-[11px] font-bold text-slate-900">₹{p.price.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${i === 0 ? "bg-emerald-500" : i === mandis.length - 1 ? "bg-rose-400" : "bg-blue-400"}`} style={{ width: `${barW}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

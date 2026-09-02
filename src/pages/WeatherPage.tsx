import React from "react";
import { Calendar, Sun, Cloud, CloudRain, Wind, Droplets, CheckCircle2, AlertTriangle } from "lucide-react";
import WeatherWidget from "../components/weather/WeatherWidget";

const HARVEST_WINDOWS = [
  { day: "Today", date: "Sep 2", condition: "Clear", temp: "32°C", rain: "0%", recommendation: "optimal", icon: Sun, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { day: "Tomorrow", date: "Sep 3", condition: "Partly Cloudy", temp: "30°C", rain: "10%", recommendation: "good", icon: Cloud, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { day: "Day 3", date: "Sep 4", condition: "Cloudy", temp: "28°C", rain: "30%", recommendation: "caution", icon: Cloud, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { day: "Day 4", date: "Sep 5", condition: "Light Rain", temp: "26°C", rain: "70%", recommendation: "avoid", icon: CloudRain, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  { day: "Day 5", date: "Sep 6", condition: "Heavy Rain", temp: "24°C", rain: "90%", recommendation: "avoid", icon: CloudRain, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  { day: "Day 6", date: "Sep 7", condition: "Rain Stopping", temp: "27°C", rain: "40%", recommendation: "caution", icon: Cloud, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { day: "Day 7", date: "Sep 8", condition: "Clearing", temp: "31°C", rain: "5%", recommendation: "good", icon: Sun, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
];

const RECOMMENDATION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  optimal: { label: "Optimal Harvest Window", icon: CheckCircle2, color: "text-emerald-700" },
  good: { label: "Good to Harvest", icon: CheckCircle2, color: "text-emerald-600" },
  caution: { label: "Harvest with Caution", icon: AlertTriangle, color: "text-amber-600" },
  avoid: { label: "Avoid Harvesting", icon: AlertTriangle, color: "text-rose-600" },
};

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Weather & Harvest Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time weather with smart harvest window recommendations
          </p>
        </div>

        <WeatherWidget showForecast={true} />

        {/* Harvest Window Advisory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">7-Day Harvest Window Advisory</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Based on weather forecast — rain, humidity, and temperature analyzed to find optimal harvest days
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {HARVEST_WINDOWS.map((hw, i) => {
              const Icon = hw.icon;
              const rec = RECOMMENDATION_CONFIG[hw.recommendation];
              const RecIcon = rec.icon;
              return (
                <div key={i} className={`rounded-2xl border p-4 text-center ${hw.bg} transition-all hover:shadow-sm`}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{hw.day}</p>
                  <p className="text-[10px] text-slate-400 mb-2">{hw.date}</p>
                  <Icon className={`w-8 h-8 mx-auto ${hw.color} mb-2`} />
                  <p className="text-xs font-bold text-slate-900">{hw.temp}</p>
                  <p className="text-[10px] text-slate-400">{hw.condition}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-semibold text-blue-600">{hw.rain}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/50">
                    <RecIcon className={`w-4 h-4 mx-auto ${rec.color}`} />
                    <p className={`text-[9px] font-bold ${rec.color} mt-0.5`}>{rec.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Best Harvest Window: Today & Tomorrow</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Clear skies with low humidity — ideal for cutting, drying, and threshing. Rain expected from Sep 5-6, so complete harvest before then. 
                  Grain moisture content will be lowest in early morning (5-8 AM).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

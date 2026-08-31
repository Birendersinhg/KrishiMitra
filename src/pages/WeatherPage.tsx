import React from "react";
import WeatherWidget from "../components/weather/WeatherWidget";

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Pinpoint Local Weather & 5-Day Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time GPS detected city forecasting and customized farming action plans
          </p>
        </div>

        <WeatherWidget showForecast={true} />
      </div>
    </div>
  );
}

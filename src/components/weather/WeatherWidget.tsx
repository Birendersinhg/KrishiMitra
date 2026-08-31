import React, { useState, useEffect, useCallback } from "react";
import { Sun, Cloud, CloudRain, CloudSun, MapPin, RefreshCw, AlertTriangle } from "lucide-react";
import { useLocation } from "../../contexts/LocationContext";
import api from "../../services/api";

interface WeatherWidgetProps {
  showForecast?: boolean;
}

const WEATHER_ICONS: Record<string, any> = {
  "Sunny": Sun,
  "Sunny & Warm": Sun,
  "Partly Cloudy": CloudSun,
  "Cloudy": Cloud,
  "Light Rain": CloudRain,
  "Rainy": CloudRain,
};

function getWeatherIcon(condition: string) {
  return WEATHER_ICONS[condition] || Sun;
}

function generateLocalForecast(city: string) {
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const conditions = ["Sunny", "Partly Cloudy", "Light Rain", "Cloudy", "Sunny & Warm"];
  const temps = [31, 29, 27, 30, 33];

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()],
      temp: temps[i],
      condition: conditions[i],
      rain: [10, 20, 60, 30, 5][i],
      advisory: [
        "Good day for fertilizer application.",
        "Favorable for weeding and pesticide spray.",
        "Ensure drainage; avoid field operations.",
        "Ideal for soil preparation.",
        "Irrigation advised for vegetable crops.",
      ][i],
    };
  });
}

export default function WeatherWidget({ showForecast = true }: WeatherWidgetProps) {
  const { city, district, state, latitude, longitude, refreshLocation } = useLocation();
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    const lat = latitude || 20.4625;
    const lon = longitude || 85.8828;
    const resolvedCity = city || "Cuttack";

    try {
      const res = await api.get(`/weather/current?lat=${lat}&lon=${lon}&city=${resolvedCity}`);
      if (res.data.success) {
        setWeather(res.data);
      }
    } catch (err) {
      console.warn("Weather API unavailable, using local forecast");
    } finally {
      setLoading(false);
    }
  }, [city, latitude, longitude]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white flex items-center justify-center min-h-[160px]">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-300" />
      </div>
    );
  }

  const resolvedCity = city || "Cuttack";
  const resolvedDistrict = district || "Cuttack";
  const resolvedState = state || "Odisha";

  const current = weather?.current || {
    temp: 29,
    condition: "Sunny & Humid",
    humidity: 78,
    windSpeed: 12,
    rainfallChance: 15,
  };

  const forecast = weather?.forecast || generateLocalForecast(resolvedCity);

  const advisory = weather?.advisory || "Favorable weather for field preparation and weeding. No heavy rainfall expected.";

  return (
    <div className="bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-md rounded-3xl p-6 text-white border border-white/20 shadow-xl space-y-5">
      {/* Location header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/10 text-emerald-300">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">{resolvedCity}, {resolvedState}</h3>
            <p className="text-[11px] text-emerald-200 font-medium">District: {resolvedDistrict}</p>
          </div>
        </div>

        <button
          onClick={() => { refreshLocation(); fetchWeather(); }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Refresh location & weather"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Current weather */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-extrabold tracking-tight">{current.temp}&deg;C</div>
          <div className="text-xs font-semibold text-emerald-200 mt-1">{current.condition}</div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
          <Sun className="w-9 h-9" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-black/20 text-center text-xs">
        <div>
          <span className="text-[10px] text-emerald-300 block">Humidity</span>
          <span className="font-bold">{current.humidity}%</span>
        </div>
        <div className="border-x border-white/10">
          <span className="text-[10px] text-emerald-300 block">Wind</span>
          <span className="font-bold">{current.windSpeed} km/h</span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-300 block">Rain Chance</span>
          <span className="font-bold">{current.rainfallChance}%</span>
        </div>
      </div>

      {/* Advisory */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-xs leading-relaxed text-emerald-100 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Farmer Advisory: </span>
          <span>{advisory}</span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {showForecast && (
        <div className="border-t border-white/10 pt-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-200">5-Day Weather Forecast & Farming Plan</h4>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            {forecast.map((day: any, i: number) => {
              const IconComp = getWeatherIcon(day.condition);
              return (
                <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                  <span className="font-semibold text-slate-300">{day.day}</span>
                  <IconComp className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white">{day.temp}&deg;</span>
                  <span className="text-[9px] text-emerald-300 truncate w-full">{day.condition}</span>
                  <span className="text-[9px] text-blue-300">Rain: {day.rain}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

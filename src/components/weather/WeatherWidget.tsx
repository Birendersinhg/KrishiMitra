import React, { useState, useEffect, useCallback } from "react";
import { Sun, Cloud, CloudRain, CloudSun, MapPin, RefreshCw, AlertTriangle, Wind, Droplets } from "lucide-react";
import { useLocation } from "../../contexts/LocationContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface WeatherWidgetProps {
  showForecast?: boolean;
}

// --- Open-Meteo API helpers (completely free, no API key required) ---

function getWMOCondition(code: number): { condition: string; icon: string } {
  // WMO weather interpretation codes from Open-Meteo
  if (code === 0) return { condition: "Clear", icon: "sunny" };
  if (code <= 3) return { condition: "Partly Cloudy", icon: "partlyCloudy" };
  if (code <= 48) return { condition: "Foggy", icon: "cloudy" };
  if (code <= 57) return { condition: "Drizzle", icon: "lightRain" };
  if (code <= 67) return { condition: "Rainy", icon: "lightRain" };
  if (code <= 77) return { condition: "Snowy", icon: "cloudy" };
  if (code <= 82) return { condition: "Rainy", icon: "lightRain" };
  if (code <= 86) return { condition: "Snowy", icon: "cloudy" };
  if (code <= 99) return { condition: "Thunderstorm", icon: "lightRain" };
  return { condition: "Clear", icon: "sunny" };
}

function getConditionLabel(cond: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    "Clear": t("sunny"),
    "Partly Cloudy": t("partlyCloudy"),
    "Foggy": t("cloudy"),
    "Drizzle": t("lightRain"),
    "Rainy": t("lightRain"),
    "Snowy": t("cloudy"),
    "Thunderstorm": t("lightRain"),
  };
  return map[cond] || cond;
}

function getDayLabel(idx: number, t: (k: string) => string): string {
  if (idx === 0) return t("today");
  if (idx === 1) return t("tomorrow");
  const days = [t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")];
  const d = new Date();
  d.setDate(d.getDate() + idx);
  return days[d.getDay()];
}

// --- CSS Weather Animations ---
function WeatherAnimation({ condition }: { condition: string }) {
  if (condition === "Clear") {
    // Animated sun rays
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-3 right-3 w-20 h-20 opacity-20">
          <div className="w-full h-full rounded-full bg-amber-400 animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-[-8px] rounded-full border-2 border-amber-300/30 animate-ping" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-[-16px] rounded-full border border-amber-300/15 animate-ping" style={{ animationDuration: "6s" }} />
        </div>
      </div>
    );
  }
  if (condition === "Rainy" || condition === "Drizzle" || condition === "Thunderstorm") {
    // Animated falling raindrops
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] bg-blue-300/40 rounded-full"
            style={{
              left: `${8 + i * 7.5}%`,
              top: "-10%",
              height: "12px",
              animation: `raindrop 0.8s linear infinite`,
              animationDelay: `${i * 0.12}s`,
              animationDuration: `${0.6 + (i % 3) * 0.2}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes raindrop {
            0% { transform: translateY(-10px); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(220px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }
  if (condition === "Partly Cloudy") {
    // Subtle sun glow + slow-moving clouds
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-4 right-6 w-14 h-14 rounded-full bg-amber-400/15 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-16 -left-4 text-white/10 text-3xl" style={{ animation: "cloudDrift 20s linear infinite" }}>
          ☁
        </div>
        <div className="absolute top-8 -right-2 text-white/8 text-2xl" style={{ animation: "cloudDrift 28s linear infinite reverse" }}>
          ☁
        </div>
        <style>{`
          @keyframes cloudDrift {
            0% { transform: translateX(-30px); }
            50% { transform: translateX(30px); }
            100% { transform: translateX(-30px); }
          }
        `}</style>
      </div>
    );
  }
  if (condition === "Cloudy" || condition === "Foggy") {
    // Gently drifting clouds
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-6 left-0 text-white/10 text-4xl" style={{ animation: "cloudDrift 18s linear infinite" }}>
          ☁
        </div>
        <div className="absolute bottom-20 right-0 text-white/8 text-3xl" style={{ animation: "cloudDrift 24s linear infinite reverse" }}>
          ☁
        </div>
        <div className="absolute top-16 left-1/3 text-white/6 text-2xl" style={{ animation: "cloudDrift 22s linear infinite" }}>
          ☁
        </div>
        <style>{`
          @keyframes cloudDrift {
            0% { transform: translateX(-20px); }
            50% { transform: translateX(20px); }
            100% { transform: translateX(-20px); }
          }
        `}</style>
      </div>
    );
  }
  return null;
}

// --- Weather Icon Selector ---
function getWeatherIcon(condition: string) {
  const condLower = condition.toLowerCase();
  if (condLower.includes("clear") || condLower.includes("sunny")) return Sun;
  if (condLower.includes("cloud") && condLower.includes("part")) return CloudSun;
  if (condLower.includes("cloud") || condLower.includes("fog")) return Cloud;
  if (condLower.includes("rain") || condLower.includes("drizzle") || condLower.includes("thunder")) return CloudRain;
  return Sun;
}

export default function WeatherWidget({ showForecast = true }: WeatherWidgetProps) {
  const { city, district, state, latitude, longitude, refreshLocation } = useLocation();
  const { t } = useLanguage();
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    const lat = latitude || 28.6139;
    const lon = longitude || 77.2090;

    try {
      // Open-Meteo: completely free, no API key needed
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,rain_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=5`
      );
      if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
      const data = await res.json();

      const currentCode = data.current?.weather_code ?? 0;
      const condInfo = getWMOCondition(currentCode);

      const current = {
        temp: Math.round(data.current?.temperature_2m ?? 28),
        condition: condInfo.condition,
        humidity: data.current?.relative_humidity_2m ?? 60,
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 10),
        rainfallChance: data.current?.rain_probability ?? 15,
      };

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      const forecast = (data.daily?.time ?? []).map((dateStr: string, i: number) => {
        const d = new Date(dateStr);
        const dayCode = data.daily?.weather_code?.[i] ?? 0;
        const dayCond = getWMOCondition(dayCode);
        return {
          day: getDayLabel(i, t),
          temp: Math.round(data.daily?.temperature_2m_max?.[i] ?? 30),
          condition: dayCond.condition,
          rain: data.daily?.precipitation_probability_max?.[i] ?? 10,
        };
      });

      // Generate a simple advisory based on conditions
      let advisory = "";
      if (current.rainfallChance > 60) {
        advisory = t("advisoryHeavyRain") || "Heavy rainfall expected. Avoid field operations and ensure proper drainage.";
      } else if (current.rainfallChance > 30) {
        advisory = t("advisoryLightRain") || "Light rain possible. Good day for planning. Avoid spraying pesticides.";
      } else if (current.temp > 38) {
        advisory = t("advisoryHot") || "Very hot today. Irrigate crops early morning. Provide shade to young plants.";
      } else if (current.condition === "Clear" && current.humidity < 50) {
        advisory = t("advisoryGood") || "Good weather for fertilizer application and field preparation.";
      } else {
        advisory = t("advisoryFavorable") || "Favorable weather for field preparation and weeding. No heavy rainfall expected.";
      }

      setWeather({ current, forecast, advisory });
    } catch (err) {
      console.warn("Open-Meteo weather API failed:", err);
      setError("Weather data temporarily unavailable");
      // Fallback data
      setWeather({
        current: { temp: 29, condition: "Partly Cloudy", humidity: 65, windSpeed: 12, rainfallChance: 20 },
        forecast: Array.from({ length: 5 }, (_, i) => ({
          day: getDayLabel(i, t),
          temp: 30 + Math.round(Math.random() * 5 - 2),
          condition: ["Clear", "Partly Cloudy", "Clear", "Cloudy", "Clear"][i],
          rain: [5, 15, 10, 30, 5][i],
        })),
        advisory: t("advisoryFavorable") || "Favorable weather for field preparation and weeding.",
      });
    } finally {
      setLoading(false);
    }
  }, [city, latitude, longitude, t]);

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

  const resolvedCity = city || "Delhi";
  const resolvedDistrict = district || "New Delhi";
  const resolvedState = state || "Delhi";

  const current = weather?.current || {
    temp: 29,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    rainfallChance: 20,
  };

  const forecast = weather?.forecast || [];
  const advisory = weather?.advisory || "";
  const conditionLabel = getConditionLabel(current.condition, t);

  return (
    <div className="bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-md rounded-3xl p-6 text-white border border-white/20 shadow-xl space-y-5 relative">
      {/* Weather animation overlay based on live condition */}
      <WeatherAnimation condition={current.condition} />

      {/* Location header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/10 text-emerald-300">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">{resolvedCity}, {resolvedState}</h3>
            <p className="text-[11px] text-emerald-200 font-medium">{t("district")}: {resolvedDistrict}</p>
          </div>
        </div>

        <button
          onClick={() => { refreshLocation(); fetchWeather(); }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title={t("refresh") || "Refresh location & weather"}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Current weather */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-4xl font-extrabold tracking-tight">{current.temp}&deg;C</div>
          <div className="text-xs font-semibold text-emerald-200 mt-1">{conditionLabel}</div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
          {React.createElement(getWeatherIcon(current.condition), { className: "w-9 h-9" })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-black/20 text-center text-xs relative z-10">
        <div>
          <span className="text-[10px] text-emerald-300 block">{t("humidityLabel")}</span>
          <span className="font-bold">{current.humidity}%</span>
        </div>
        <div className="border-x border-white/10">
          <span className="text-[10px] text-emerald-300 block">{t("windLabel")}</span>
          <span className="font-bold">{current.windSpeed} km/h</span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-300 block">{t("rainChanceLabel")}</span>
          <span className="font-bold">{current.rainfallChance}%</span>
        </div>
      </div>

      {/* Advisory */}
      {advisory && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-xs leading-relaxed text-emerald-100 flex items-start gap-2 relative z-10">
          <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">{t("farmerAdvisory")}: </span>
            <span>{advisory}</span>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {showForecast && forecast.length > 0 && (
        <div className="border-t border-white/10 pt-4 space-y-2 relative z-10">
          <h4 className="text-xs font-bold text-emerald-200">{t("forecast5DayTitle")}</h4>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            {forecast.map((day: any, i: number) => {
              const IconComp = getWeatherIcon(day.condition);
              const dayCondLabel = getConditionLabel(day.condition, t);
              return (
                <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                  <span className="font-semibold text-slate-300">{day.day}</span>
                  <IconComp className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white">{day.temp}&deg;</span>
                  <span className="text-[9px] text-emerald-300 truncate w-full">{dayCondLabel}</span>
                  <span className="text-[9px] text-blue-300">{t("rainLabel")} {day.rain}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-amber-300 text-center relative z-10">{error}</div>
      )}
    </div>
  );
}

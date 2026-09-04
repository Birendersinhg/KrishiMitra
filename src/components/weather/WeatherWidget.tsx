import React, { useState, useEffect, useCallback } from "react";
import { MapPin, RefreshCw, AlertTriangle } from "lucide-react";
import { useLocation } from "../../contexts/LocationContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface WeatherWidgetProps {
  showForecast?: boolean;
}

// --- Open-Meteo API helpers (completely free, no API key required) ---

function getWMOCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear", icon: "sunny" };
  if (code <= 3) return { condition: "Partly Cloudy", icon: "partlyCloudy" };
  if (code <= 48) return { condition: "Foggy", icon: "cloudy" };
  if (code <= 57) return { condition: "Drizzle", icon: "lightRain" };
  if (code <= 67) return { condition: "Rainy", icon: "rain" };
  if (code <= 77) return { condition: "Snowy", icon: "snow" };
  if (code <= 82) return { condition: "Rainy", icon: "rain" };
  if (code <= 86) return { condition: "Snowy", icon: "snow" };
  if (code <= 99) return { condition: "Thunderstorm", icon: "thunder" };
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

// ============================================================
// DRAMATIC LIVE WEATHER ANIMATIONS
// ============================================================

function WeatherAnimation({ condition }: { condition: string }) {
  const condLower = condition.toLowerCase();

  // --- SUNNY / CLEAR ---
  if (condLower.includes("clear") || condLower.includes("sunny")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes sunGlow {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 0.9; }
          }
          @keyframes sunRaySpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes sunPulse {
            0%, 100% { box-shadow: 0 0 40px 15px rgba(251,191,36,0.25), 0 0 80px 30px rgba(251,191,36,0.1); }
            50% { box-shadow: 0 0 60px 25px rgba(251,191,36,0.4), 0 0 120px 50px rgba(251,191,36,0.15); }
          }
        `}</style>
        {/* Main sun orb */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400"
          style={{ animation: "sunPulse 4s ease-in-out infinite", filter: "blur(1px)" }}
        />
        {/* Glow ring */}
        <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full border-2 border-amber-300/30"
          style={{ animation: "sunGlow 3s ease-in-out infinite" }}
        />
        {/* Spinning rays */}
        <div className="absolute top-1 right-1 w-24 h-24 opacity-20"
          style={{ animation: "sunRaySpin 20s linear infinite" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-amber-300 origin-bottom"
              style={{ transform: `translate(-50%, -100%) rotate(${i * 45}deg)` }}
            />
          ))}
        </div>
        {/* Warm overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-orange-500/5 rounded-3xl" />
      </div>
    );
  }

  // --- RAINY / DRIZZLE ---
  if (condLower.includes("rain") || condLower.includes("drizzle")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes rainFall {
            0% { transform: translateY(-20px) rotate(15deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(250px) rotate(15deg); opacity: 0; }
          }
          @keyframes rainFall2 {
            0% { transform: translateY(-10px) rotate(12deg); opacity: 0; }
            15% { opacity: 0.8; }
            85% { opacity: 0.8; }
            100% { transform: translateY(230px) rotate(12deg); opacity: 0; }
          }
          @keyframes dropletSlide {
            0% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(40px) scale(0.9); opacity: 0.9; }
            100% { transform: translateY(80px) scale(0.7); opacity: 0; }
          }
          @keyframes rainSplash {
            0% { transform: scale(0); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `}</style>
        {/* Rain streaks — fast falling lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`rain-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${3 + (i * 5) % 94}%`,
              top: "-5%",
              width: "1.5px",
              height: `${16 + (i % 4) * 6}px`,
              background: `linear-gradient(to bottom, transparent, rgba(147,197,253,${0.3 + (i % 3) * 0.15}))`,
              animation: `rainFall ${0.7 + (i % 5) * 0.15}s linear infinite`,
              animationDelay: `${(i * 0.09) % 1.2}s`,
            }}
          />
        ))}
        {/* Secondary rain layer — slower, thicker */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`rain2-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${5 + (i * 10) % 90}%`,
              top: "-3%",
              width: "2px",
              height: `${20 + (i % 3) * 8}px`,
              background: `linear-gradient(to bottom, transparent, rgba(96,165,250,0.4))`,
              animation: `rainFall2 ${0.9 + (i % 3) * 0.2}s linear infinite`,
              animationDelay: `${(i * 0.13) % 1.5}s`,
            }}
          />
        ))}
        {/* Water droplets on glass */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`drop-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 11) % 50}%`,
              width: `${4 + (i % 3) * 2}px`,
              height: `${5 + (i % 3) * 3}px`,
              background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.5), rgba(147,197,253,0.3))",
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              animation: `dropletSlide ${2 + (i % 3) * 0.8}s ease-in infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        {/* Splash rings at bottom */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`splash-${i}`}
            className="absolute rounded-full border border-blue-300/20"
            style={{
              left: `${10 + (i * 18) % 80}%`,
              bottom: "8%",
              width: "12px",
              height: "6px",
              animation: `rainSplash ${1.5 + (i % 3) * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        {/* Blue-tinted overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/15 via-blue-800/10 to-blue-900/20 rounded-3xl" />
      </div>
    );
  }

  // --- THUNDERSTORM ---
  if (condLower.includes("thunder")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes lightningFlash {
            0%, 100% { opacity: 0; }
            5% { opacity: 0.9; }
            6% { opacity: 0.1; }
            7% { opacity: 0.7; }
            8% { opacity: 0; }
            50% { opacity: 0; }
            52% { opacity: 0.5; }
            53% { opacity: 0; }
          }
          @keyframes lightningBolt1 {
            0%, 100% { opacity: 0; clip-path: polygon(50% 0%, 45% 30%, 55% 30%, 48% 60%, 56% 60%, 42% 100%); }
            4% { opacity: 1; }
            6% { opacity: 0.2; }
            8% { opacity: 0.8; }
            10% { opacity: 0; }
            50% { opacity: 0; }
            51% { opacity: 0.6; }
            52% { opacity: 0; }
          }
          @keyframes thunderRainFall {
            0% { transform: translateY(-15px) rotate(20deg); opacity: 0; }
            10% { opacity: 0.7; }
            100% { transform: translateY(250px) rotate(20deg); opacity: 0; }
          }
          @keyframes stormCloudDrift {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(8px); }
          }
        `}</style>
        {/* Dark storm overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-900/30 to-purple-950/50 rounded-3xl" />
        {/* Lightning bolt 1 */}
        <div className="absolute top-0 left-1/3 w-16 h-full opacity-0"
          style={{ animation: "lightningBolt1 6s ease infinite" }}
        >
          <svg viewBox="0 0 60 200" className="w-full h-full" style={{ filter: "drop-shadow(0 0 15px rgba(251,191,36,0.8))" }}>
            <polygon points="30,0 22,60 38,55 18,130 42,120 25,200 45,110 20,115 40,50 18,55 35,0"
              fill="rgba(251,191,36,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          </svg>
        </div>
        {/* Lightning bolt 2 */}
        <div className="absolute top-0 right-1/4 w-12 h-3/4 opacity-0"
          style={{ animation: "lightningBolt1 6s ease 0.5s infinite", animationDelay: "3s" }}
        >
          <svg viewBox="0 0 40 180" className="w-full h-full" style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,0.6))" }}>
            <polygon points="20,0 14,50 28,45 10,120 30,110 18,180"
              fill="rgba(251,191,36,0.7)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Screen flash */}
        <div className="absolute inset-0 bg-white/0 rounded-3xl"
          style={{ animation: "lightningFlash 6s ease infinite" }}
        />
        {/* Storm rain — heavier, angled */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={`tRain-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${2 + (i * 5.5) % 96}%`,
              top: "-5%",
              width: "2px",
              height: `${18 + (i % 4) * 5}px`,
              background: `linear-gradient(to bottom, transparent, rgba(147,197,253,${0.25 + (i % 3) * 0.1}))`,
              animation: `thunderRainFall ${0.6 + (i % 4) * 0.1}s linear infinite`,
              animationDelay: `${(i * 0.07) % 1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // --- CLOUDY / FOGGY ---
  if (condLower.includes("cloud") || condLower.includes("fog")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes cloudFloat1 {
            0%, 100% { transform: translateX(-15px) translateY(0); }
            50% { transform: translateX(15px) translateY(-3px); }
          }
          @keyframes cloudFloat2 {
            0%, 100% { transform: translateX(10px) translateY(0); }
            50% { transform: translateX(-12px) translateY(2px); }
          }
          @keyframes cloudFloat3 {
            0%, 100% { transform: translateX(-8px) translateY(2px); }
            50% { transform: translateX(10px) translateY(-2px); }
          }
        `}</style>
        {/* Large drifting cloud */}
        <div className="absolute top-2 left-[-10px] text-white/15"
          style={{ animation: "cloudFloat1 12s ease-in-out infinite" }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60">
            <ellipse cx="60" cy="35" rx="55" ry="20" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="40" cy="28" rx="30" ry="18" fill="rgba(255,255,255,0.1)" />
            <ellipse cx="75" cy="30" rx="25" ry="15" fill="rgba(255,255,255,0.08)" />
          </svg>
        </div>
        {/* Medium cloud */}
        <div className="absolute bottom-16 right-[-5px] text-white/10"
          style={{ animation: "cloudFloat2 16s ease-in-out infinite" }}
        >
          <svg width="100" height="50" viewBox="0 0 100 50">
            <ellipse cx="50" cy="28" rx="45" ry="18" fill="rgba(255,255,255,0.1)" />
            <ellipse cx="35" cy="22" rx="25" ry="15" fill="rgba(255,255,255,0.08)" />
          </svg>
        </div>
        {/* Small cloud */}
        <div className="absolute top-12 right-10 text-white/8"
          style={{ animation: "cloudFloat3 14s ease-in-out infinite" }}
        >
          <svg width="70" height="35" viewBox="0 0 70 35">
            <ellipse cx="35" cy="20" rx="30" ry="13" fill="rgba(255,255,255,0.08)" />
            <ellipse cx="25" cy="16" rx="18" ry="10" fill="rgba(255,255,255,0.06)" />
          </svg>
        </div>
      </div>
    );
  }

  // --- PARTLY CLOUDY ---
  if (condLower.includes("part")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes partlySunPulse {
            0%, 100% { box-shadow: 0 0 25px 8px rgba(251,191,36,0.2); transform: scale(1); }
            50% { box-shadow: 0 0 40px 15px rgba(251,191,36,0.35); transform: scale(1.05); }
          }
          @keyframes partlyCloudDrift {
            0%, 100% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
          }
        `}</style>
        {/* Sun behind clouds */}
        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400"
          style={{ animation: "partlySunPulse 4s ease-in-out infinite", filter: "blur(2px)" }}
        />
        {/* Cloud overlay drifting */}
        <div className="absolute top-0 right-0"
          style={{ animation: "partlyCloudDrift 10s ease-in-out infinite" }}
        >
          <svg width="100" height="55" viewBox="0 0 100 55">
            <ellipse cx="55" cy="32" rx="45" ry="18" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="38" cy="25" rx="28" ry="16" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>
        {/* Small drifting cloud */}
        <div className="absolute bottom-20 left-4"
          style={{ animation: "partlyCloudDrift 14s ease-in-out infinite reverse" }}
        >
          <svg width="65" height="30" viewBox="0 0 65 30">
            <ellipse cx="32" cy="18" rx="28" ry="11" fill="rgba(255,255,255,0.08)" />
          </svg>
        </div>
      </div>
    );
  }

  // --- SNOW ---
  if (condLower.includes("snow")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes snowFall {
            0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(220px) translateX(20px) rotate(360deg); opacity: 0.3; }
          }
        `}</style>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`snow-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${5 + (i * 6.5) % 90}%`,
              top: "-5%",
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              opacity: 0.6 + (i % 3) * 0.15,
              animation: `snowFall ${2 + (i % 4) * 0.8}s linear infinite`,
              animationDelay: `${(i * 0.2) % 3}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

// --- Weather Icon Selector (simple SVG icons) ---
function WeatherIcon({ condition }: { condition: string }) {
  const condLower = condition.toLowerCase();

  if (condLower.includes("clear") || condLower.includes("sunny")) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300/20 to-orange-400/20 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="8" fill="#FBBF24" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="18" y1="2" x2="18" y2="6" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
              transform={`rotate(${i * 45} 18 18)`} />
          ))}
        </svg>
      </div>
    );
  }

  if (condLower.includes("rain") || condLower.includes("drizzle")) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <path d="M8 18a8 8 0 0 1 16 0h2a5 5 0 0 1 0 10H6a5 5 0 0 1 0-10h2z" fill="#60A5FA" opacity="0.8" />
          <line x1="12" y1="28" x2="10" y2="34" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="28" x2="16" y2="34" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="28" x2="22" y2="34" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (condLower.includes("thunder")) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-slate-600/20 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <path d="M8 16a8 8 0 0 1 16 0h2a5 5 0 0 1 0 10H6a5 5 0 0 1 0-10h2z" fill="#8B5CF6" opacity="0.7" />
          <polygon points="18,18 15,26 20,24 14,34 22,25 17,27 22,18" fill="#FBBF24" />
        </svg>
      </div>
    );
  }

  if (condLower.includes("cloud") && condLower.includes("part")) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300/15 to-blue-400/15 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="14" cy="14" r="6" fill="#FBBF24" opacity="0.7" />
          <path d="M10 22a6 6 0 0 1 12 0h1a4 4 0 0 1 0 8H9a4 4 0 0 1 0-8h1z" fill="#93C5FD" opacity="0.7" />
        </svg>
      </div>
    );
  }

  if (condLower.includes("cloud") || condLower.includes("fog")) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-300/20 to-blue-400/15 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <path d="M8 20a7 7 0 0 1 14 0h1.5a4.5 4.5 0 0 1 0 9H6.5a4.5 4.5 0 0 1 0-9H8z" fill="#94A3B8" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // Default sun
  return (
    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="8" fill="#FBBF24" />
      </svg>
    </div>
  );
}

function getWeatherIcon(condition: string) {
  const condLower = condition.toLowerCase();
  if (condLower.includes("clear") || condLower.includes("sunny")) return "sunny";
  if (condLower.includes("cloud") && condLower.includes("part")) return "partlyCloudy";
  if (condLower.includes("cloud") || condLower.includes("fog")) return "cloudy";
  if (condLower.includes("rain") || condLower.includes("drizzle")) return "rain";
  if (condLower.includes("thunder")) return "thunder";
  if (condLower.includes("snow")) return "snow";
  return "sunny";
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

      const forecast = (data.daily?.time ?? []).map((dateStr: string, i: number) => {
        const dayCode = data.daily?.weather_code?.[i] ?? 0;
        const dayCond = getWMOCondition(dayCode);
        return {
          day: getDayLabel(i, t),
          temp: Math.round(data.daily?.temperature_2m_max?.[i] ?? 30),
          condition: dayCond.condition,
          rain: data.daily?.precipitation_probability_max?.[i] ?? 10,
        };
      });

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
        advisory = t("advisoryFavorable") || "Favorable weather for field preparation and weeding.";
      }

      setWeather({ current, forecast, advisory });
    } catch (err) {
      console.warn("Open-Meteo weather API failed:", err);
      setError("Weather data temporarily unavailable");
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
    <div className="bg-gradient-to-br from-emerald-800/90 to-teal-900/90 backdrop-blur-md rounded-3xl p-6 text-white border border-white/20 shadow-xl space-y-5 relative overflow-hidden">
      {/* LIVE weather animation based on real condition */}
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
          title={t("refresh") || "Refresh"}
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
        <WeatherIcon condition={current.condition} />
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
              const dayCondLabel = getConditionLabel(day.condition, t);
              return (
                <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                  <span className="font-semibold text-slate-300">{day.day}</span>
                  <WeatherIcon condition={day.condition} />
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

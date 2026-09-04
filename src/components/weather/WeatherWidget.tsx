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
          @keyframes heavyRain {
            0% { transform: translateY(-30px) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 0.9; }
            100% { transform: translateY(320px) translateX(-15px); opacity: 0; }
          }
          @keyframes dropSlide {
            0% { transform: translateY(0) scaleY(1); opacity: 0; }
            20% { opacity: 0.9; }
            80% { opacity: 0.7; }
            100% { transform: translateY(90px) scaleY(1.4); opacity: 0; }
          }
          @keyframes ripple {
            0% { transform: scale(0); opacity: 0.6; border-width: 2px; }
            100% { transform: scale(4); opacity: 0; border-width: 0.5px; }
          }
          @keyframes darkCloudDrift1 {
            0% { transform: translateX(-20px); }
            50% { transform: translateX(15px); }
            100% { transform: translateX(-20px); }
          }
          @keyframes darkCloudDrift2 {
            0% { transform: translateX(10px); }
            50% { transform: translateX(-15px); }
            100% { transform: translateX(10px); }
          }
        `}</style>
        {/* Dark storm clouds at top */}
        <div className="absolute -top-4 -left-6" style={{ animation: "darkCloudDrift1 8s ease-in-out infinite" }}>
          <svg width="220" height="70" viewBox="0 0 220 70" style={{ opacity: 0.7 }}>
            <path d="M20,55 Q20,35 45,33 Q50,18 80,15 Q100,2 125,18 Q140,10 160,25 Q178,18 195,32 Q215,30 220,45 Q220,55 210,55 Z" fill="rgba(30,41,59,0.85)" />
            <path d="M30,55 Q30,38 52,36 Q58,22 85,18 Q102,8 125,22 Q138,14 155,28 Q172,22 188,36 Q208,34 215,48 Q215,55 205,55 Z" fill="rgba(51,65,85,0.6)" />
          </svg>
        </div>
        <div className="absolute top-[10px] right-[-20px]" style={{ animation: "darkCloudDrift2 10s ease-in-out infinite" }}>
          <svg width="180" height="60" viewBox="0 0 180 60" style={{ opacity: 0.6 }}>
            <path d="M15,48 Q15,30 38,28 Q42,16 68,14 Q82,4 102,16 Q115,10 130,22 Q148,16 162,30 Q175,28 180,40 Q180,48 170,48 Z" fill="rgba(30,41,59,0.8)" />
            <path d="M25,48 Q25,34 45,32 Q50,22 72,18 Q85,10 105,20 Q116,14 128,26 Q144,20 158,34 Q172,32 176,42 Q176,48 168,48 Z" fill="rgba(51,65,85,0.6)" />
          </svg>
        </div>
        {/* HEAVY rain streaks — thick, bright, fast */}
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={`rain-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${(i * 2.8) % 98}%`,
              top: "-8%",
              width: `${1.5 + (i % 3) * 0.5}px`,
              height: `${22 + (i % 5) * 10}px`,
              background: `linear-gradient(to bottom, transparent 0%, rgba(147,197,253,0.6) 40%, rgba(96,165,250,0.8) 100%)`,
              animation: `heavyRain ${0.45 + (i % 6) * 0.08}s linear infinite`,
              animationDelay: `${(i * 0.04) % 0.8}s`,
            }}
          />
        ))}
        {/* Water droplets sliding on glass — big and visible */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`drop-${i}`}
            className="absolute"
            style={{
              left: `${5 + (i * 8) % 88}%`,
              top: `${10 + (i * 7) % 55}%`,
              width: `${6 + (i % 4) * 3}px`,
              height: `${8 + (i % 4) * 4}px`,
              background: "radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.7), rgba(147,197,253,0.5) 60%, transparent)",
              borderRadius: "40% 40% 50% 50% / 50% 50% 60% 60%",
              animation: `dropSlide ${1.8 + (i % 4) * 0.6}s ease-in infinite`,
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
        {/* Splash ripples at bottom */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`ripple-${i}`}
            className="absolute rounded-full border border-blue-300/40"
            style={{
              left: `${5 + (i * 12) % 90}%`,
              bottom: `${2 + (i * 3) % 12}%`,
              width: "8px",
              height: "8px",
              animation: `ripple ${1.2 + (i % 3) * 0.4}s ease-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
        {/* Dark rain overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 via-blue-900/20 to-slate-900/30 rounded-3xl" />
      </div>
    );
  }

  // --- THUNDERSTORM ---
  if (condLower.includes("thunder")) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <style>{`
          @keyframes boltFlash1 {
            0%, 100% { opacity: 0; }
            3% { opacity: 1; }
            4% { opacity: 0.1; }
            5% { opacity: 0.9; }
            7% { opacity: 0; }
            40% { opacity: 0; }
            41% { opacity: 0.7; }
            42% { opacity: 0; }
          }
          @keyframes boltFlash2 {
            0%, 100% { opacity: 0; }
            20% { opacity: 0; }
            21% { opacity: 1; }
            23% { opacity: 0.2; }
            24% { opacity: 0.8; }
            26% { opacity: 0; }
          }
          @keyframes stormRain {
            0% { transform: translateY(-25px) translateX(0); opacity: 0; }
            8% { opacity: 1; }
            100% { transform: translateY(320px) translateX(-20px); opacity: 0; }
          }
          @keyframes stormCloudDrift {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(12px); }
          }
          @keyframes stormCloudDrift2 {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-10px); }
          }
        `}</style>
        {/* Very dark storm overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/60 via-slate-900/50 to-purple-950/70 rounded-3xl" />
        {/* MASSIVE dark storm clouds */}
        <div className="absolute -top-4 -left-4" style={{ animation: "stormCloudDrift 6s ease-in-out infinite" }}>
          <svg width="280" height="90" viewBox="0 0 280 90" style={{ opacity: 0.85 }}>
            <path d="M15,70 Q15,42 48,40 Q52,18 95,14 Q120,-2 155,18 Q175,6 200,25 Q225,14 250,35 Q275,30 280,52 Q280,70 265,70 Z" fill="rgba(15,23,42,0.92)" />
            <path d="M30,70 Q30,48 58,45 Q65,24 102,18 Q125,4 155,22 Q172,12 195,30 Q218,20 240,38 Q262,34 270,55 Q270,70 255,70 Z" fill="rgba(30,41,59,0.7)" />
          </svg>
        </div>
        <div className="absolute top-[8px] right-[-30px]" style={{ animation: "stormCloudDrift2 7s ease-in-out infinite" }}>
          <svg width="200" height="75" viewBox="0 0 200 75" style={{ opacity: 0.8 }}>
            <path d="M10,60 Q10,38 38,36 Q42,18 75,14 Q95,2 118,18 Q132,10 150,24 Q168,16 185,32 Q198,30 200,45 Q200,60 188,60 Z" fill="rgba(15,23,42,0.88)" />
            <path d="M20,60 Q20,42 45,40 Q50,24 78,18 Q96,8 118,22 Q132,14 148,28 Q165,20 180,36 Q195,34 198,48 Q198,60 185,60 Z" fill="rgba(30,41,59,0.65)" />
          </svg>
        </div>
        {/* BOLTS — large, bright, dramatic SVG lightning */}
        <div className="absolute top-0 left-[28%] w-20 h-full opacity-0"
          style={{ animation: "boltFlash1 5s ease infinite" }}
        >
          <svg viewBox="0 0 70 250" className="w-full h-full" style={{ filter: "drop-shadow(0 0 20px rgba(251,191,36,0.9)) drop-shadow(0 0 40px rgba(255,255,255,0.4))" }}>
            <polygon points="35,0 28,55 42,48 20,120 48,108 25,180 50,165 18,250 55,155 22,160 45,95 25,100 40,45 22,50 38,0"
              fill="rgba(255,255,200,0.95)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
          </svg>
        </div>
        <div className="absolute top-0 right-[18%] w-14 h-[85%] opacity-0"
          style={{ animation: "boltFlash2 5s ease infinite" }}
        >
          <svg viewBox="0 0 50 220" className="w-full h-full" style={{ filter: "drop-shadow(0 0 15px rgba(251,191,36,0.8))" }}>
            <polygon points="25,0 18,45 32,40 12,100 35,88 20,155 38,145 15,220"
              fill="rgba(255,255,200,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
          </svg>
        </div>
        {/* Whole-screen white flash on lightning */}
        <div className="absolute inset-0 bg-white/0 rounded-3xl"
          style={{ animation: "boltFlash1 5s ease infinite" }}
        />
        {/* HEAVY storm rain — thick, angled, fast */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`tRain-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${(i * 2.5) % 98}%`,
              top: "-8%",
              width: `${2 + (i % 3) * 0.5}px`,
              height: `${20 + (i % 5) * 8}px`,
              background: `linear-gradient(to bottom, transparent 0%, rgba(147,197,253,0.5) 30%, rgba(96,165,250,0.7) 100%)`,
              animation: `stormRain ${0.35 + (i % 6) * 0.06}s linear infinite`,
              animationDelay: `${(i * 0.03) % 0.6}s`,
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
          @keyframes bigCloudDrift1 {
            0% { transform: translateX(-30px); }
            50% { transform: translateX(25px); }
            100% { transform: translateX(-30px); }
          }
          @keyframes bigCloudDrift2 {
            0% { transform: translateX(20px); }
            50% { transform: translateX(-25px); }
            100% { transform: translateX(20px); }
          }
          @keyframes bigCloudDrift3 {
            0% { transform: translateX(-15px) translateY(3px); }
            50% { transform: translateX(20px) translateY(-2px); }
            100% { transform: translateX(-15px) translateY(3px); }
          }
          @keyframes bigCloudDrift4 {
            0% { transform: translateX(10px) translateY(-2px); }
            50% { transform: translateX(-18px) translateY(3px); }
            100% { transform: translateX(10px) translateY(-2px); }
          }
        `}</style>
        {/* Cloud 1 — top left, biggest, proper cloud shape */}
        <div className="absolute top-[-8px] left-[-10px]" style={{ animation: "bigCloudDrift1 10s ease-in-out infinite" }}>
          <svg width="260" height="100" viewBox="0 0 260 100" style={{ opacity: 0.55 }}>
            <path d="M40,80 Q40,55 65,55 Q65,30 100,30 Q125,10 155,30 Q175,20 195,35 Q220,25 235,45 Q260,45 260,65 Q260,80 240,80 Z" fill="rgba(30,58,95,0.8)" />
            <path d="M50,80 Q50,60 75,58 Q80,38 110,35 Q130,20 155,35 Q170,28 185,40 Q200,32 215,48 Q235,48 240,65 Q240,80 225,80 Z" fill="rgba(44,82,130,0.6)" />
          </svg>
        </div>
        {/* Cloud 2 — upper right, proper cloud shape */}
        <div className="absolute top-[15px] right-[-15px]" style={{ animation: "bigCloudDrift2 12s ease-in-out infinite" }}>
          <svg width="220" height="85" viewBox="0 0 220 85" style={{ opacity: 0.45 }}>
            <path d="M30,70 Q30,48 55,48 Q58,28 90,25 Q110,8 135,25 Q155,15 175,30 Q195,22 210,40 Q220,40 220,58 Q220,70 205,70 Z" fill="rgba(30,58,95,0.75)" />
            <path d="M40,70 Q40,52 60,50 Q65,32 95,28 Q112,15 135,30 Q150,22 168,34 Q185,28 200,44 Q215,44 215,58 Q215,70 200,70 Z" fill="rgba(44,82,130,0.55)" />
          </svg>
        </div>
        {/* Cloud 3 — lower left, proper cloud shape */}
        <div className="absolute bottom-[30px] left-[10px]" style={{ animation: "bigCloudDrift3 14s ease-in-out infinite" }}>
          <svg width="180" height="70" viewBox="0 0 180 70" style={{ opacity: 0.38 }}>
            <path d="M25,60 Q25,40 50,38 Q55,22 85,20 Q100,8 120,20 Q135,14 150,28 Q165,22 175,38 Q180,38 180,52 Q180,60 170,60 Z" fill="rgba(30,58,95,0.7)" />
            <path d="M35,60 Q35,44 55,42 Q60,28 88,24 Q102,14 122,26 Q135,20 148,32 Q160,26 170,40 Q178,40 178,52 Q178,60 165,60 Z" fill="rgba(44,82,130,0.5)" />
          </svg>
        </div>
        {/* Cloud 4 — center, smaller */}
        <div className="absolute top-[40px] left-[35%]" style={{ animation: "bigCloudDrift4 11s ease-in-out infinite" }}>
          <svg width="150" height="60" viewBox="0 0 150 60" style={{ opacity: 0.35 }}>
            <path d="M20,50 Q20,32 42,30 Q45,16 72,14 Q88,4 108,16 Q120,10 135,22 Q148,20 150,35 Q150,50 140,50 Z" fill="rgba(44,82,130,0.65)" />
            <path d="M28,50 Q28,36 48,34 Q52,22 75,18 Q90,10 108,22 Q118,16 130,28 Q142,26 145,38 Q145,50 135,50 Z" fill="rgba(30,58,95,0.55)" />
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
            0%, 100% { box-shadow: 0 0 30px 10px rgba(251,191,36,0.25); transform: scale(1); }
            50% { box-shadow: 0 0 50px 20px rgba(251,191,36,0.4); transform: scale(1.08); }
          }
          @keyframes partlyCloudDrift1 {
            0% { transform: translateX(-20px); }
            50% { transform: translateX(15px); }
            100% { transform: translateX(-20px); }
          }
          @keyframes partlyCloudDrift2 {
            0% { transform: translateX(15px); }
            50% { transform: translateX(-18px); }
            100% { transform: translateX(15px); }
          }
        `}</style>
        {/* Sun behind clouds */}
        <div className="absolute -top-4 -right-2 w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400"
          style={{ animation: "partlySunPulse 4s ease-in-out infinite", filter: "blur(2px)" }}
        />
        {/* Large cloud drifting over sun */}
        <div className="absolute top-0 right-[-5px]"
          style={{ animation: "partlyCloudDrift1 9s ease-in-out infinite" }}
        >
          <svg width="160" height="65" viewBox="0 0 160 65" style={{ opacity: 0.6 }}>
            <path d="M15,52 Q15,34 38,32 Q42,18 72,15 Q88,4 108,18 Q122,10 138,24 Q152,18 160,34 Q160,52 148,52 Z" fill="rgba(30,58,95,0.7)" />
            <path d="M25,52 Q25,38 45,36 Q50,24 75,20 Q90,12 108,24 Q120,16 135,28 Q148,22 156,36 Q156,52 145,52 Z" fill="rgba(44,82,130,0.5)" />
          </svg>
        </div>
        {/* Second cloud lower left */}
        <div className="absolute bottom-14 left-0"
          style={{ animation: "partlyCloudDrift2 12s ease-in-out infinite" }}
        >
          <svg width="130" height="50" viewBox="0 0 130 50" style={{ opacity: 0.4 }}>
            <path d="M10,40 Q10,26 30,24 Q34,14 58,12 Q70,4 88,14 Q98,8 112,18 Q125,16 130,28 Q130,40 120,40 Z" fill="rgba(30,58,95,0.6)" />
            <path d="M18,40 Q18,28 35,26 Q40,18 60,14 Q72,8 88,18 Q98,12 110,22 Q122,20 128,30 Q128,40 118,40 Z" fill="rgba(44,82,130,0.45)" />
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
      <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-blue-600 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white flex items-center justify-center min-h-[160px]">
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

  // Dynamic background color based on weather condition
  const condLower = current.condition.toLowerCase();
  let bgClass = "bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600"; // default: bright sky blue
  if (condLower.includes("clear") || condLower.includes("sunny")) {
    bgClass = "bg-gradient-to-br from-sky-400 via-blue-400 to-blue-500";
  } else if (condLower.includes("thunder")) {
    bgClass = "bg-gradient-to-br from-slate-800 via-purple-950 to-slate-900";
  } else if (condLower.includes("rain") || condLower.includes("drizzle")) {
    bgClass = "bg-gradient-to-br from-slate-600 via-blue-800 to-slate-800";
  } else if (condLower.includes("cloud") && condLower.includes("part")) {
    bgClass = "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700";
  } else if (condLower.includes("cloud") || condLower.includes("fog")) {
    bgClass = "bg-gradient-to-br from-blue-700 via-blue-800 to-slate-800";
  } else if (condLower.includes("snow")) {
    bgClass = "bg-gradient-to-br from-blue-400 via-blue-500 to-slate-500";
  }

  return (
    <div className={`${bgClass} backdrop-blur-md rounded-3xl p-6 text-white border border-white/20 shadow-xl space-y-5 relative overflow-hidden`}>
      {/* LIVE weather animation based on real condition */}
      <WeatherAnimation condition={current.condition} />

      {/* Location header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/15 text-white">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">{resolvedCity}, {resolvedState}</h3>
            <p className="text-[11px] text-white/70 font-medium">{t("district")}: {resolvedDistrict}</p>
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
          <div className="text-xs font-semibold text-white/80 mt-1">{conditionLabel}</div>
        </div>
        <WeatherIcon condition={current.condition} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-black/20 text-center text-xs relative z-10">
        <div>
          <span className="text-[10px] text-white/60 block">{t("humidityLabel")}</span>
          <span className="font-bold">{current.humidity}%</span>
        </div>
        <div className="border-x border-white/10">
          <span className="text-[10px] text-white/60 block">{t("windLabel")}</span>
          <span className="font-bold">{current.windSpeed} km/h</span>
        </div>
        <div>
          <span className="text-[10px] text-white/60 block">{t("rainChanceLabel")}</span>
          <span className="font-bold">{current.rainfallChance}%</span>
        </div>
      </div>

      {/* Advisory */}
      {advisory && (
        <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 text-xs leading-relaxed text-white/90 flex items-start gap-2 relative z-10">
          <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{t("farmerAdvisory")}: </span>
            <span>{advisory}</span>
          </div>
        </div>
      )}

      {/* 5-Day Forecast */}
      {showForecast && forecast.length > 0 && (
        <div className="border-t border-white/10 pt-4 space-y-2 relative z-10">
          <h4 className="text-xs font-bold text-white/80">{t("forecast5DayTitle")}</h4>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            {forecast.map((day: any, i: number) => {
              const dayCondLabel = getConditionLabel(day.condition, t);
              return (
                <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                  <span className="font-semibold text-slate-300">{day.day}</span>
                  <WeatherIcon condition={day.condition} />
                  <span className="text-xs font-bold text-white">{day.temp}&deg;</span>
                  <span className="text-[9px] text-white/60 truncate w-full">{dayCondLabel}</span>
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

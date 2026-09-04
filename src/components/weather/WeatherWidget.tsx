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
        <div className="absolute -top-2 left-[-5px]" style={{ animation: "darkCloudDrift1 8s ease-in-out infinite" }}>
          <svg width="230" height="80" viewBox="0 0 230 80" style={{ opacity: 0.7 }}>
            <path d="M25,68 C8,68 3,56 16,52 C6,44 16,26 34,28 C38,12 62,8 78,22 C86,12 108,12 118,24 C128,16 148,22 152,36 C164,30 176,40 172,52 C186,54 186,68 172,68 Z" fill="rgba(30,41,59,0.88)" />
            <path d="M35,65 C20,65 16,55 27,52 C18,44 28,28 42,30 C46,16 66,12 80,24 C88,16 106,16 115,26 C124,20 140,24 144,36 C154,32 162,40 158,50 C168,52 168,65 156,65 Z" fill="rgba(51,65,85,0.55)" />
          </svg>
        </div>
        <div className="absolute top-[12px] right-[-15px]" style={{ animation: "darkCloudDrift2 10s ease-in-out infinite" }}>
          <svg width="190" height="70" viewBox="0 0 190 70" style={{ opacity: 0.6 }}>
            <path d="M18,60 C4,60 0,50 12,47 C4,40 12,24 26,26 C30,14 48,10 60,20 C66,13 82,13 90,22 C98,17 112,22 114,32 C124,28 134,36 130,46 C140,48 140,60 130,60 Z" fill="rgba(30,41,59,0.82)" />
            <path d="M28,57 C16,57 12,49 22,47 C14,40 22,26 34,28 C38,18 52,14 62,22 C68,16 82,16 88,24 C95,20 106,24 108,32 C116,30 122,36 119,44 C126,46 126,57 118,57 Z" fill="rgba(51,65,85,0.5)" />
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
        <div className="absolute -top-2 left-[-5px]" style={{ animation: "stormCloudDrift 6s ease-in-out infinite" }}>
          <svg width="280" height="90" viewBox="0 0 280 90" style={{ opacity: 0.85 }}>
            <path d="M20,78 C0,78 -5,62 14,56 C2,46 14,24 36,27 C40,8 72,2 92,20 C102,8 130,6 144,22 C158,12 182,18 188,36 C204,28 222,40 216,56 C232,58 234,78 214,78 Z" fill="rgba(15,23,42,0.92)" />
            <path d="M35,75 C18,75 14,62 28,58 C18,50 28,32 46,34 C50,18 76,14 92,28 C100,18 124,18 136,30 C146,22 166,28 170,42 C182,36 196,44 192,56 C204,58 204,75 190,75 Z" fill="rgba(30,41,59,0.65)" />
          </svg>
        </div>
        <div className="absolute top-[10px] right-[-25px]" style={{ animation: "stormCloudDrift2 7s ease-in-out infinite" }}>
          <svg width="210" height="80" viewBox="0 0 210 80" style={{ opacity: 0.8 }}>
            <path d="M12,68 C-2,68 -6,56 8,52 C0,44 8,26 24,28 C28,14 50,10 64,22 C72,14 90,14 100,24 C108,18 124,22 128,34 C140,28 152,38 148,50 C160,52 160,68 146,68 Z" fill="rgba(15,23,42,0.88)" />
            <path d="M24,65 C10,65 6,55 18,52 C10,45 18,30 32,32 C35,20 52,16 64,26 C70,20 86,20 94,28 C100,24 114,28 116,38 C126,34 134,42 130,52 C140,54 140,65 130,65 Z" fill="rgba(30,41,59,0.6)" />
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
    // Classic cartoon cloud path: round bumps on top, flat bottom
    const cloudPath1 = "M30,75 C10,75 5,60 20,55 C10,45 20,25 40,28 C45,10 75,5 90,20 C100,8 125,8 135,22 C150,12 175,18 180,35 C195,30 210,42 205,55 C220,58 220,75 200,75 Z";
    const cloudPath2 = "M20,65 C5,65 0,52 15,48 C8,38 18,22 35,24 C40,10 62,6 75,18 C82,10 105,10 112,22 C125,14 145,20 148,34 C160,30 170,40 165,52 C178,54 178,65 162,65 Z";
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
        {/* Cloud 1 — big, top left */}
        <div className="absolute top-[-2px] left-[-5px]" style={{ animation: "bigCloudDrift1 10s ease-in-out infinite" }}>
          <svg width="230" height="90" viewBox="0 0 230 90" style={{ opacity: 0.55 }}>
            <path d="M30,75 C10,75 5,60 20,55 C10,45 20,25 40,28 C45,10 75,5 90,20 C100,8 125,8 135,22 C150,12 175,18 180,35 C195,30 210,42 205,55 C220,58 220,75 200,75 Z" fill="rgba(30,58,95,0.8)" />
            <path d="M40,72 C22,72 18,60 30,56 C22,48 30,32 46,34 C50,20 74,16 86,26 C94,18 114,18 122,28 C132,22 150,26 152,38 C162,34 172,42 168,52 C178,54 178,72 165,72 Z" fill="rgba(44,82,130,0.5)" />
          </svg>
        </div>
        {/* Cloud 2 — upper right */}
        <div className="absolute top-[20px] right-[-10px]" style={{ animation: "bigCloudDrift2 12s ease-in-out infinite" }}>
          <svg width="200" height="80" viewBox="0 0 200 80" style={{ opacity: 0.45 }}>
            <path d="M25,65 C8,65 3,54 16,50 C8,42 16,26 32,28 C36,14 58,10 70,20 C78,12 98,12 106,22 C116,16 132,22 135,34 C146,30 156,40 152,50 C164,52 164,65 150,65 Z" fill="rgba(30,58,95,0.75)" />
            <path d="M35,62 C20,62 16,52 27,49 C20,42 28,28 40,30 C44,18 62,14 72,22 C78,16 95,16 102,24 C110,20 124,24 126,34 C135,31 142,38 139,48 C148,50 148,62 138,62 Z" fill="rgba(44,82,130,0.45)" />
          </svg>
        </div>
        {/* Cloud 3 — lower left, smaller */}
        <div className="absolute bottom-[35px] left-[10px]" style={{ animation: "bigCloudDrift3 14s ease-in-out infinite" }}>
          <svg width="160" height="65" viewBox="0 0 160 65" style={{ opacity: 0.38 }}>
            <path d="M20,55 C6,55 2,46 12,43 C6,36 14,22 28,24 C32,12 50,9 60,18 C66,11 82,11 88,20 C96,15 110,20 112,30 C122,27 130,35 126,44 C136,46 136,55 126,55 Z" fill="rgba(30,58,95,0.7)" />
            <path d="M28,52 C16,52 12,44 22,42 C16,36 22,24 34,26 C37,16 52,13 60,20 C66,14 80,14 85,22 C92,18 104,22 106,30 C114,28 120,34 117,42 C124,44 124,52 116,52 Z" fill="rgba(44,82,130,0.45)" />
          </svg>
        </div>
        {/* Cloud 4 — center */}
        <div className="absolute top-[45px] left-[30%]" style={{ animation: "bigCloudDrift4 11s ease-in-out infinite" }}>
          <svg width="130" height="55" viewBox="0 0 130 55" style={{ opacity: 0.35 }}>
            <path d="M15,45 C4,45 0,38 10,35 C4,30 12,18 24,20 C27,10 42,7 52,15 C57,9 70,9 76,16 C83,12 95,16 97,24 C105,22 112,28 108,36 C116,38 116,45 108,45 Z" fill="rgba(44,82,130,0.65)" />
            <path d="M22,43 C12,43 9,37 18,35 C12,30 19,20 28,22 C32,14 44,11 52,17 C57,12 68,12 73,18 C79,15 90,18 92,25 C98,23 104,28 101,35 C108,37 108,43 100,43 Z" fill="rgba(30,58,95,0.5)" />
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
        <div className="absolute top-[5px] right-[-5px]"
          style={{ animation: "partlyCloudDrift1 9s ease-in-out infinite" }}
        >
          <svg width="170" height="70" viewBox="0 0 170 70" style={{ opacity: 0.6 }}>
            <path d="M18,58 C4,58 0,48 12,45 C4,38 12,22 26,24 C30,12 50,8 62,18 C68,11 84,11 92,20 C100,15 114,20 116,30 C126,26 136,34 132,44 C142,46 142,58 132,58 Z" fill="rgba(30,58,95,0.7)" />
            <path d="M26,55 C14,55 10,47 20,44 C12,38 20,24 32,26 C36,16 52,12 62,20 C68,14 82,14 88,22 C95,18 106,22 108,30 C116,28 122,34 120,42 C128,44 128,55 120,55 Z" fill="rgba(44,82,130,0.45)" />
          </svg>
        </div>
        {/* Second cloud lower left */}
        <div className="absolute bottom-[40px] left-[5px]"
          style={{ animation: "partlyCloudDrift2 12s ease-in-out infinite" }}
        >
          <svg width="140" height="55" viewBox="0 0 140 55" style={{ opacity: 0.4 }}>
            <path d="M12,45 C2,45 -1,38 9,35 C2,30 9,18 22,20 C25,10 40,7 50,15 C55,9 68,9 74,16 C80,12 92,16 94,24 C102,21 110,28 106,36 C114,38 114,45 106,45 Z" fill="rgba(30,58,95,0.6)" />
            <path d="M20,43 C10,43 8,37 16,35 C10,30 16,20 26,22 C30,14 42,11 50,18 C55,13 66,13 72,18 C78,15 88,18 90,25 C96,23 102,28 99,35 C106,37 106,43 98,43 Z" fill="rgba(44,82,130,0.4)" />
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

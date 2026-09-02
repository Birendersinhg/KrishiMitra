import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Sprout, Sun, ShoppingBag, Users, ArrowRight, Sparkles, Package, BarChart3, Store, Truck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import WeatherWidget from "../components/weather/WeatherWidget";
import CameraCaptureModal from "../components/camera/CameraCaptureModal";

export default function LandingPage() {
  const { t } = useLanguage();
  const [cameraOpen, setCameraOpen] = useState(false);
  const navigate = useNavigate();

  const handleCapture = (dataUrl: string) => {
    sessionStorage.setItem("km_pending_image", dataUrl);
    navigate("/analyze");
  };

  const features = [
    {
      path: "/analyze",
      title: t("feature1Title") || "AI Crop Diagnosis",
      desc: t("feature1Desc") || "Snap a leaf photo for instant disease & pest detection.",
      icon: Camera,
      color: "bg-emerald-500",
    },
    {
      path: "/soil-analysis",
      title: "Soil Health Assessment",
      desc: "Analyze soil texture, NPK deficiencies, and suitable crops.",
      icon: Sprout,
      color: "bg-amber-500",
    },
    {
      path: "/weather",
      title: t("feature2Title") || "Local Weather & Advisory",
      desc: t("feature2Desc") || "Pinpoint city weather with 5-day farming advisories.",
      icon: Sun,
      color: "bg-sky-500",
    },
    {
      path: "/inventory",
      title: "Post-Harvest Inventory",
      desc: "Track harvested produce, storage locations, and set selling prices.",
      icon: Package,
      color: "bg-orange-500",
    },
    {
      path: "/mandi-prices",
      title: "Live Mandi Prices",
      desc: "Real-time APMC prices with AI predictions and best-sell advisory.",
      icon: BarChart3,
      color: "bg-blue-600",
    },
    {
      path: "/products",
      title: t("feature3Title") || "Agriculture Inventory",
      desc: t("feature3Desc") || "Buy fertilizers directly from Amazon & Flipkart.",
      icon: ShoppingBag,
      color: "bg-violet-500",
    },
    {
      path: "/dealers",
      title: t("feature4Title") || "Local Dealer Connect",
      desc: t("feature4Desc") || "Call or WhatsApp verified dealers in your district.",
      icon: Users,
      color: "bg-teal-500",
    },
    {
      path: "/marketplace",
      title: "Produce Marketplace",
      desc: "Buy and sell harvested produce directly with verified buyers.",
      icon: Store,
      color: "bg-violet-600",
    },
    {
      path: "/supply-chain",
      title: "Supply Chain Tracker",
      desc: "Track produce from farm to fork with QR verification.",
      icon: Truck,
      color: "bg-indigo-600",
    },
    {
      path: "/assistant",
      title: "AI Chat Assistant",
      desc: "Speak or type in your language for expert guidance.",
      icon: Sparkles,
      color: "bg-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 text-white pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Agricultural AI & LMMs</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Your Smart Agricultural{" "}
                <span className="text-emerald-300">Companion</span> for Healthier Crops
              </h1>

              <p className="text-base sm:text-lg text-emerald-100 max-w-2xl">
                Instantly diagnose crop diseases, get pinpoint local weather advisories, track your harvest inventory, check live mandi prices, and connect with verified dealers across India.
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => setCameraOpen(true)}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-base shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t("openCamera") || "Open Camera"}</span>
                </button>

                <Link
                  to="/assistant"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base transition-colors"
                >
                  <span>{t("assistant") || "AI Chat"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <WeatherWidget showForecast={true} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.path}
              className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${f.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-4">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
      />
    </div>
  );
}

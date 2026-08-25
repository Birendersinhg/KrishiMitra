import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation as useGeoLocation } from "../contexts/LocationContext";
import WeatherWidget from "../components/weather/WeatherWidget";
import CameraCaptureModal from "../components/camera/CameraCaptureModal";
import api from "../services/api";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { city } = useGeoLocation();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/analysis/history")
      .then((res) => { 
        if (res.data.success) setAnalyses(res.data.analyses || []); 
      })
      .catch(() => {});
  }, []);

  const handleCapture = (dataUrl: string) => {
    sessionStorage.setItem("km_pending_image", dataUrl);
    navigate("/analyze");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Namaste, {user ? user.name : "Farmer"} ??
            </h1>
            <p className="text-sm text-slate-500 max-w-xl">
              Location: <span className="font-semibold text-emerald-700">{city || "Cuttack"}, Odisha</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCameraOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Crop</span>
            </button>
            <Link
              to="/post-crop"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post Issue</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeatherWidget showForecast={true} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Diagnoses</h2>
              <Link to="/history" className="text-xs font-semibold text-emerald-600 hover:underline">View All</Link>
            </div>

            {analyses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No diagnoses recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {analyses.slice(0, 3).map((a) => (
                  <Link key={a.id} to={`/analysis/${a.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100">
                    <img src={a.imageUrl} alt="Crop" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-slate-800 truncate">{a.cropName}</h3>
                      <p className="text-[10px] text-rose-600 font-medium">{a.disease || "Healthy"}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CameraCaptureModal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCapture} />
    </div>
  );
}

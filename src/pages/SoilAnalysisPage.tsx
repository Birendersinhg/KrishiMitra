import React, { useState } from "react";
import { Camera, Image, Sprout, Sparkles, AlertCircle, CheckCircle, Volume2 } from "lucide-react";
import CameraCaptureModal from "../components/camera/CameraCaptureModal";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import api from "../services/api";

export default function SoilAnalysisPage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const handleAnalyze = async () => {
    if (!imageData) return;
    setLoading(true);
    try {
      const res = await api.post("/analysis/soil", { imageData });
      if (res.data.success) {
        setResult(res.data.result);
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3">
            <Sprout className="w-3.5 h-3.5" />
            <span>AI Crop & Soil Health</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Soil Health Assessment</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Snap a photo of your farm's soil to detect texture, NPK balance, and suitable crops</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm mb-6">
          {imageData ? (
            <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden">
              <img src={imageData} alt="Soil" className="w-full h-full object-cover" />
              <button onClick={() => setImageData(null)} className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-black/70 cursor-pointer">Retake</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCameraOpen(true)} className="p-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Camera className="w-8 h-8 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Open Camera</span>
              </button>
              <label className="p-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Image className="w-8 h-8 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Upload Photo</span>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onloadend = () => setImageData(r.result as string);
                    r.readAsDataURL(file);
                  }
                }} className="hidden" />
              </label>
            </div>
          )}

          <button onClick={handleAnalyze} disabled={!imageData || loading} className="w-full mt-4 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Analyzing Soil..." : "Analyze Soil Health"}</span>
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{result.soilType}</h2>
              <button onClick={() => speak(`Soil type: ${result.soilType}. Fertility: ${result.fertility}.`)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold cursor-pointer">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 block">Nitrogen (N)</span>
                <span className="text-sm font-bold text-emerald-700">{result.npkBalance?.nitrogen || "Optimal"}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 text-center bg-slate-50">
                <span className="text-[10px] text-slate-500 block">Phosphorus (P)</span>
                <span className="text-sm font-bold text-emerald-700">{result.npkBalance?.phosphorus || "Medium"}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 text-center bg-slate-50">
                <span className="text-[10px] text-slate-500 block">Potassium (K)</span>
                <span className="text-sm font-bold text-emerald-700">{result.npkBalance?.potassium || "Optimal"}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Suitable Crops</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.suitableCrops?.map((crop: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">{crop}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Agricultural Advisory</h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {result.advisories?.map((ad: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{ad}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => { setImageData(dataUrl); setCameraOpen(false); }}
      />
    </div>
  );
}

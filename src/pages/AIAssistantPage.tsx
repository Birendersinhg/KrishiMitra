import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Volume2, Sprout } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import VoiceButton from "../components/voice/VoiceButton";
import api from "../services/api";
import { findFarmingAnswer } from "../utils/farmingKnowledge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const { language } = useLanguage();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Namaste! I am your AgriNexus farming assistant. Ask me anything about crop diseases, fertilizers, weather, or Odisha agricultural schemes." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (query?: string) => {
    const text = query || input.trim();
    if (!text || loading) return;
    setInput("");

    const newMsgs: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setLoading(true);

    // Try backend API first, fall back to local knowledge base
    try {
      const res = await api.post("/analysis/chat", {
        message: text,
        language,
        context: newMsgs.slice(-4),
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.response }]);
      } else {
        // Backend failed, use local knowledge base
        const localResponse = findFarmingAnswer(text);
        setMessages((prev) => [...prev, { role: "assistant", content: localResponse }]);
      }
    } catch (err) {
      // Backend not available, use local knowledge base
      const localResponse = findFarmingAnswer(text);
      setMessages((prev) => [...prev, { role: "assistant", content: localResponse }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "How to control paddy blast disease?",
    "Which fertilizer is best for tomato flowering?",
    "What crops are suitable for Odisha rainy season?",
    "How to use neem oil for pest control?",
    "Government schemes for farmers?",
    "How to set up drip irrigation?",
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[85vh] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold">AgriNexus Assistant</h1>
              <p className="text-[10px] text-emerald-300">Online | Voice & Multi-lingual</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sprout className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-white border border-slate-200/80 text-slate-800 shadow-sm"}`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isSpeaking ? "Stop" : "Listen"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
              <span>AgriNexus is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-slate-100/70 border-t border-slate-200/60 flex flex-wrap gap-1.5">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... (Type or speak)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <VoiceButton onTranscript={(text) => setInput((prev) => (prev ? prev + " " + text : text))} />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

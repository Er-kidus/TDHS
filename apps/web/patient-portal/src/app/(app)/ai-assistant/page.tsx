"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  Upload,
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  Image as ImageIcon,
  Mic,
  MicOff,
  RefreshCw,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageAttached?: boolean;
  urgency?: string;
  specialty?: string;
};

type AnalysisState = {
  urgency: string;
  specialty: string;
  score: number;
  suggestions: string[];
  imageAnalysis?: { detected_conditions: string[]; recommended_specialty: string; confidence: number };
} | null;

const QUICK_PROMPTS = [
  "I have a headache and fever since yesterday",
  "My chest hurts when I breathe",
  "I have a skin rash that appeared this morning",
  "I've been feeling very anxious and can't sleep",
  "I have severe stomach pain and nausea",
  "My eye is red and painful",
];

const URGENCY_STYLES: Record<string, string> = {
  emergent: "border-red-200 bg-red-50 text-red-800",
  urgent:   "border-amber-200 bg-amber-50 text-amber-800",
  moderate: "border-blue-200 bg-blue-50 text-blue-800",
  low:      "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisState>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState("image/jpeg");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  useEffect(() => () => {
    stopCamera();
    recognitionRef.current?.stop();
  }, [stopCamera]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Init with welcome message
  useEffect(() => {
    setMessages([{
      id: uid(),
      role: "assistant",
      content: "👋 Hello! I'm your personal health assistant. I can help you understand your symptoms, analyze photos of skin conditions or injuries, and connect you with the right doctor.\n\nHow are you feeling today? Tell me what's bothering you, or use the quick prompts below.",
      timestamp: new Date(),
    }]);
  }, []);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      setError("Camera access denied. Please upload an image instead.");
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl.split(",")[1]);
    setImageType("image/jpeg");
    stopCamera();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setImageType(file.type);
    };
    reader.readAsDataURL(file);
  }

  function startVoice() {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition ||
               (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) { setError("Voice input is not supported in your browser."); return; }
    const rec = new (SR as any)();
    rec.continuous = false;
    rec.lang = "en-US";
    rec.onresult = (ev: any) => {
      const text = Array.from(ev.results).map((r: any) => r[0].transcript).join(" ");
      setInput(p => p ? `${p} ${text}` : text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function sendMessage(textOverride?: string) {
    const text = (textOverride || input).trim();
    if (!text && !imageBase64) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text || "(Image uploaded for analysis)",
      timestamp: new Date(),
      imageAttached: !!imageBase64,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");
    const capturedImage = imageBase64;
    const capturedType = imageType;
    if (imageBase64) { setImagePreview(null); setImageBase64(null); }

    try {
      const res = await fetch("/api/ai-symptom-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: text,
          imageBase64: capturedImage,
          imageType: capturedType,
          ageGroup: "",
          severity: 5,
        }),
      });

      const data = await res.json() as {
        urgency?: string;
        specialty?: string;
        score?: number;
        suggestions?: string[];
        reasons?: string[];
        imageAnalysis?: { detected_conditions: string[]; recommended_specialty: string; confidence: number };
        error?: string;
      };

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Build readable reply
      const urgency = data.urgency || "low";
      const specialty = data.specialty || "General Practice";

      let reply = `Based on what you've shared, here's what I found:\n\n`;
      reply += `**Priority Level:** ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}\n`;
      reply += `**Recommended Specialist:** ${specialty}\n\n`;

      if (data.imageAnalysis?.detected_conditions?.length) {
        reply += `**Visual Assessment:** ${data.imageAnalysis.detected_conditions.join(", ")}\n\n`;
      }

      if (data.suggestions?.length) {
        reply += `**What to do:**\n${data.suggestions.map(s => `• ${s}`).join("\n")}\n\n`;
      }

      if (urgency === "emergent") {
        reply += `⚠️ **Your symptoms may require immediate attention.** Please call emergency services or go to the nearest emergency room now.\n\n`;
      } else {
        reply += `I recommend connecting with a ${specialty} specialist. Click "Talk to a Doctor" below to find available doctors.\n\n`;
      }

      reply += `_⚕️ This is not a medical diagnosis. Always consult a qualified healthcare professional._`;

      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
        urgency,
        specialty,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setAnalysis({
        urgency,
        specialty,
        score: data.score ?? 0,
        suggestions: data.suggestions ?? [],
        imageAnalysis: data.imageAnalysis,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function resetChat() {
    setMessages([{
      id: uid(),
      role: "assistant",
      content: "👋 Hello again! Tell me about your symptoms, or share a photo for visual analysis.",
      timestamp: new Date(),
    }]);
    setAnalysis(null);
    setInput("");
    setError("");
  }

  function renderContent(content: string) {
    // Simple markdown-lite renderer
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold text-foreground mt-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("**") && line.includes(":**")) {
        const [label, ...rest] = line.replace(/\*\*/g, "").split(":");
        return <p key={i} className="mt-1 text-sm"><span className="font-semibold">{label}:</span>{rest.join(":")}</p>;
      }
      if (line.startsWith("• ")) return <li key={i} className="ml-4 text-sm list-disc">{line.slice(2)}</li>;
      if (line.startsWith("⚠️")) return <p key={i} className="mt-2 font-semibold text-red-700">{line}</p>;
      if (line.startsWith("_") && line.endsWith("_")) return <p key={i} className="mt-2 text-xs text-muted-foreground italic">{line.slice(1, -1)}</p>;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-sm">{line}</p>;
    });
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 rounded-t-2xl border border-b-0 border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Health Assistant</h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Powered by AI • Not a medical diagnosis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {analysis && (
              <button
                type="button"
                onClick={() => router.push("/telemedicine")}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <HeartHandshake className="h-4 w-4" /> Talk to a Doctor
              </button>
            )}
            <button
              type="button"
              onClick={resetChat}
              title="Start new conversation"
              className="rounded-xl border border-border p-2 text-muted-foreground transition hover:bg-muted/40"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Analysis banner */}
        {analysis && (
          <div className={`mt-3 rounded-xl border px-4 py-3 ${URGENCY_STYLES[analysis.urgency] || URGENCY_STYLES.low}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">AI Assessment</p>
                <p className="mt-0.5 text-sm font-bold">
                  {analysis.urgency.charAt(0).toUpperCase() + analysis.urgency.slice(1)} priority • {analysis.specialty}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/telemedicine?specialty=${encodeURIComponent(analysis.specialty)}`)}
                className="flex items-center gap-1.5 rounded-lg bg-current/10 px-3 py-1.5 text-xs font-semibold"
              >
                Find {analysis.specialty} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border-x border-border bg-card/80 px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-background border border-border text-foreground rounded-bl-sm"
            }`}>
              {msg.imageAttached && (
                <div className="mb-2 flex items-center gap-1.5 text-xs opacity-70">
                  <ImageIcon className="h-3.5 w-3.5" /> Image attached
                </div>
              )}
              <div className={`leading-relaxed ${msg.role === "user" ? "text-sm text-primary-foreground" : "text-foreground"}`}>
                {msg.role === "assistant" ? renderContent(msg.content) : <p className="text-sm">{msg.content}</p>}
              </div>
              <p className={`mt-1.5 text-[10px] opacity-50 text-right ${msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-muted-foreground">Analysing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Camera view */}
      {cameraOpen && (
        <div className="border-x border-border bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-48 object-cover" />
          <div className="flex gap-2 p-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground"
            >
              📸 Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image preview strip */}
      {imagePreview && (
        <div className="border-x border-border bg-card px-4 py-2">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="attached" className="h-12 w-12 rounded-lg object-cover border border-border" />
            <span className="flex-1 text-xs text-muted-foreground">Photo attached — AI will analyze for visual symptoms</span>
            <button
              type="button"
              onClick={() => { setImagePreview(null); setImageBase64(null); }}
              className="rounded-full border border-border p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border-x border-border bg-card px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button type="button" onClick={() => setError("")} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Quick prompts (only when no messages beyond welcome) */}
      {messages.length <= 1 && (
        <div className="border-x border-border bg-card/80 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => void sendMessage(p)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:border-primary/40 hover:bg-primary/5"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 rounded-b-2xl border border-t-0 border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-end gap-2">
          {/* Attach / Camera buttons */}
          <div className="flex gap-1.5 pb-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Upload image"
              className="rounded-xl border border-border p-2.5 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void openCamera()}
              title="Take photo"
              className="rounded-xl border border-border p-2.5 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              title={listening ? "Stop recording" : "Voice input"}
              className={`rounded-xl border p-2.5 transition ${listening ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"}`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />

          {/* Send */}
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={loading || (!input.trim() && !imageBase64)}
            className="mb-0.5 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Safety notice */}
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 shrink-0 text-primary/60" />
          Your messages are processed securely. This AI provides guidance only — it does not replace a doctor.
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
    </div>
  );
}

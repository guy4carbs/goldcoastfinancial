"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RADIUS, COLORS } from "@/lib/heritageDesignSystem";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  existingAudioUrl?: string | null;
  isUploading?: boolean;
  maxDuration?: number;
  className?: string;
}

type RecorderState = "idle" | "recording" | "recorded" | "previewing" | "error";

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "audio/webm";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({
  onRecordingComplete,
  existingAudioUrl,
  isUploading = false,
  maxDuration = 60,
  className,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>(existingAudioUrl ? "recorded" : "idle");
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(0));
  const [errorMsg, setErrorMsg] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  // Waveform animation loop
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const sampled = Array.from({ length: 32 }, (_, i) => {
      const idx = Math.floor((i / 32) * data.length);
      return data[idx] / 255;
    });
    setWaveformData(sampled);
    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const startRecording = async () => {
    try {
      setErrorMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio context for waveform
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;
        stream.getTracks().forEach((t) => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setWaveformData(Array(32).fill(0));
        setState("recorded");
        onRecordingComplete(blob, duration);
      };

      recorder.start(100);
      setState("recording");
      setDuration(0);

      // Timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setDuration(elapsed);
        if (elapsed >= maxDuration) {
          recorder.stop();
        }
      }, 100);

      // Start waveform
      updateWaveform();
    } catch (err: any) {
      console.error("[VoiceRecorder] Mic error:", err);
      if (err.name === "NotAllowedError") {
        setErrorMsg("Microphone access denied. Please allow microphone permissions in your browser settings.");
      } else {
        setErrorMsg("Could not access microphone. Please check your device settings.");
      }
      setState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const playPreview = () => {
    const url = blobRef.current
      ? URL.createObjectURL(blobRef.current)
      : existingAudioUrl;
    if (!url) return;

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pausePreview = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resetRecording = () => {
    blobRef.current = null;
    setDuration(0);
    setWaveformData(Array(32).fill(0));
    setState("idle");
    setIsPlaying(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Main orb button */}
      <div className="relative mb-6">
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
          style={{
            background: state === "recording"
              ? `radial-gradient(circle, ${COLORS.primary.violet[500]}30, transparent 70%)`
              : "transparent",
            width: 200, height: 200, left: -36, top: -36,
          }}
          animate={{
            scale: state === "recording" ? [1, 1.2, 1] : 1,
            opacity: state === "recording" ? [0.3, 0.6, 0.3] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.button
          type="button"
          onClick={() => {
            if (state === "idle" || state === "error") startRecording();
            else if (state === "recording") stopRecording();
          }}
          disabled={isUploading}
          className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-2",
            state === "recording"
              ? "border-red-400 bg-gradient-to-br from-red-500/20 to-violet-500/20 shadow-lg shadow-red-500/20"
              : state === "recorded"
                ? "border-emerald-400 bg-gradient-to-br from-emerald-500/10 to-violet-500/10"
                : state === "error"
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gradient-to-br from-violet-500/10 to-purple-500/10 hover:border-violet-300 cursor-pointer"
          )}
          whileHover={state === "idle" ? { scale: 1.05 } : undefined}
          whileTap={state === "idle" || state === "recording" ? { scale: 0.95 } : undefined}
        >
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
              </motion.div>
            ) : state === "recording" ? (
              <motion.div key="stop" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Square className="w-10 h-10 text-red-500 fill-red-500" />
              </motion.div>
            ) : state === "error" ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertCircle className="w-12 h-12 text-red-400" />
              </motion.div>
            ) : (
              <motion.div key="mic" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <Mic className="w-12 h-12 text-violet-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulse rings while recording */}
        <AnimatePresence>
          {state === "recording" && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400/30 pointer-events-none"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-violet-400/20 pointer-events-none"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform */}
      <div className="flex items-center justify-center gap-[2px] h-12 mb-4">
        {waveformData.map((v, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-[3px] rounded-full",
              state === "recording" ? "bg-violet-500" : "bg-gray-200"
            )}
            animate={{ height: Math.max(4, v * 40) }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>

      {/* Status + Timer */}
      <div className="text-center mb-4">
        <p className={cn(
          "text-sm font-medium",
          state === "recording" ? "text-red-500" :
          state === "recorded" ? "text-emerald-600" :
          state === "error" ? "text-red-500" :
          "text-gray-500"
        )}>
          {state === "idle" && "Tap the microphone to start recording"}
          {state === "recording" && "Recording..."}
          {state === "recorded" && "Recording complete"}
          {state === "error" && errorMsg}
          {isUploading && "Saving voicemail..."}
        </p>
        {(state === "recording" || state === "recorded") && (
          <p className="text-lg font-mono font-bold text-gray-900 mt-1">
            {formatTime(duration)}
          </p>
        )}
        {state === "recording" && (
          <p className="text-[10px] text-gray-400 mt-0.5">Max {maxDuration}s</p>
        )}
      </div>

      {/* Preview + Re-record controls */}
      {(state === "recorded" || (state === "idle" && existingAudioUrl)) && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={isPlaying ? pausePreview : playPreview}
            className="gap-2"
            style={{ borderRadius: RADIUS.button }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetRecording}
            className="gap-2 text-violet-600"
            style={{ borderRadius: RADIUS.button }}
          >
            <Mic className="w-4 h-4" />
            Re-record
          </Button>
        </div>
      )}
    </div>
  );
}

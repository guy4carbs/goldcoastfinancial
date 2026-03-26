import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEED_OPTIONS = [1, 1.5, 2];

interface AudioPlayerProps {
  recordingId: string;
  duration?: number;
  mode: "compact" | "full";
  className?: string;
}

export function AudioPlayer({ recordingId, duration: preloadedDuration, mode, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(preloadedDuration || 0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const src = `/api/calls/${recordingId}/recording`;

  const togglePlay = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (!isLoaded) {
      audio.src = src;
      audio.load();
      setIsLoaded(true);
    }

    if (isPlaying) {
      audio.pause();
    } else {
      await audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isLoaded, src]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const cycleSpeed = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[nextIndex];
    }
  }, [speedIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  if (mode === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)} onClick={(e) => e.stopPropagation()}>
        <audio ref={audioRef} preload="none" />
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "w-8 h-8 rounded-full shrink-0",
            isPlaying ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </Button>
        <span className="text-xs text-gray-500 tabular-nums">
          {isPlaying ? formatDuration(currentTime) : formatDuration(duration || preloadedDuration || 0)}
        </span>
      </div>
    );
  }

  // Full mode
  return (
    <div className={cn("space-y-3", className)} onClick={(e) => e.stopPropagation()}>
      <audio ref={audioRef} preload="none" />

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "w-10 h-10 rounded-full shrink-0",
            isPlaying ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>

        {/* Seek bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 accent-violet-600 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs text-gray-500 tabular-nums w-10">
            {formatDuration(duration || preloadedDuration || 0)}
          </span>
        </div>

        {/* Speed toggle */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs font-semibold tabular-nums shrink-0"
          onClick={cycleSpeed}
        >
          {SPEED_OPTIONS[speedIndex]}x
        </Button>

        {/* Download */}
        <a
          href={src}
          download={`recording-${recordingId}.mp3`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <Button size="icon" variant="ghost" className="w-8 h-8">
            <Download className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}

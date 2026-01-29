/**
 * VideoPlayer - Training video player component
 *
 * Features:
 * - HTML5 video player with custom controls
 * - Playback speed control
 * - Transcript panel (synced to playback)
 * - Bookmark capability
 * - Progress tracking
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Bookmark,
  BookmarkCheck,
  SkipBack,
  SkipForward,
  Clock,
  FileText,
  ChevronRight,
  Film
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  thumbnailUrl: string;
  videoUrl: string;
  transcript?: TranscriptSegment[];
  moduleId?: string;
  tags: string[];
  isPlaceholder?: boolean;
}

export interface TranscriptSegment {
  timestamp: number;
  text: string;
}

interface VideoPlayerProps {
  video: TrainingVideo;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onBookmark?: (timestamp: number) => void;
  bookmarks?: number[];
  className?: string;
}

export function VideoPlayer({
  video,
  onProgress,
  onComplete,
  onBookmark,
  bookmarks = [],
  className
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get current transcript segment
  const getCurrentTranscript = useCallback(() => {
    if (!video.transcript) return null;
    return video.transcript.find(
      (seg, idx, arr) =>
        currentTime >= seg.timestamp &&
        (idx === arr.length - 1 || currentTime < arr[idx + 1].timestamp)
    );
  }, [video.transcript, currentTime]);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (video.isPlaceholder) return;

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, video.isPlaceholder]);

  // Handle seek
  const handleSeek = useCallback((value: number[]) => {
    if (video.isPlaceholder || !videoRef.current) return;
    const time = (value[0] / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, [duration, video.isPlaceholder]);

  // Handle volume
  const handleVolumeChange = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    const vol = value[0] / 100;
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Handle playback rate
  const handlePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Skip forward/back
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + seconds)
    );
  }, [duration]);

  // Handle time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);

      // Check if complete (within last 5 seconds)
      if (video.duration - video.currentTime < 5 && !video.ended) {
        onComplete?.();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onProgress, onComplete]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => {
        if (isPlaying) setShowControls(false);
      });
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Placeholder state
  if (video.isPlaceholder) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Film className="w-10 h-10 text-white/50" />
            </div>
            <h3 className="text-xl font-semibold">{video.title}</h3>
            <Badge variant="secondary" className="mt-2">
              Coming Soon
            </Badge>
            <p className="text-sm text-white/60 mt-4 text-center max-w-md px-4">
              {video.description}
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
              <Clock className="w-4 h-4" />
              <span>{formatTime(video.duration)}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex gap-4", className)}>
      {/* Video container */}
      <Card className="flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="relative aspect-video bg-black group"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-full"
            poster={video.thumbnailUrl}
          />

          {/* Controls overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity",
              showControls ? "opacity-100" : "opacity-0"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="text-white font-medium truncate">{video.title}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowTranscript(!showTranscript)}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                {onBookmark && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => onBookmark(currentTime)}
                  >
                    {bookmarks.includes(Math.floor(currentTime)) ? (
                      <BookmarkCheck className="w-4 h-4 text-violet-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress bar */}
              <div className="mb-4">
                <Slider
                  value={[(currentTime / duration) * 100]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="cursor-pointer"
                />
                {/* Bookmark markers */}
                {bookmarks.map((time) => (
                  <div
                    key={time}
                    className="absolute w-1 h-3 bg-violet-500 rounded"
                    style={{ left: `${(time / duration) * 100}%`, bottom: "60px" }}
                  />
                ))}
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => skip(-10)}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => skip(10)}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      className="w-20"
                    />
                  </div>

                  <span className="text-white text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        {playbackRate}x
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <DropdownMenuItem
                          key={rate}
                          onClick={() => handlePlaybackRate(rate)}
                        >
                          {rate}x {rate === playbackRate && "✓"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Transcript panel */}
      {showTranscript && video.transcript && (
        <Card className="w-80 flex-shrink-0">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-violet-500" />
              Transcript
            </h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {video.transcript.map((segment, idx) => {
                  const isCurrent = getCurrentTranscript()?.timestamp === segment.timestamp;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded cursor-pointer transition-colors",
                        isCurrent
                          ? "bg-violet-500/10 border-l-2 border-violet-500"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = segment.timestamp;
                        }
                      }}
                    >
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatTime(segment.timestamp)}
                      </span>
                      <p className="text-sm mt-0.5">{segment.text}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

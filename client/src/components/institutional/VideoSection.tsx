import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface VideoSectionProps {
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  subtitle?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
  className?: string;
  onPlay?: () => void;
}

export function VideoSection({
  videoSrc,
  posterSrc,
  title,
  subtitle,
  aspectRatio = "16/9",
  className = "",
  onPlay,
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play();
        setIsPlaying(true);
        onPlay?.();
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const aspectClasses = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
  };

  // Placeholder when no video is provided
  if (!videoSrc) {
    return (
      <div className={className}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`relative ${aspectClasses[aspectRatio]} bg-gradient-to-br from-primary/90 to-primary rounded-xl overflow-hidden`}
        >
          {/* Placeholder content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
            {title && (
              <h3 className="text-xl font-medium mb-2">{title}</h3>
            )}
            {subtitle && (
              <p className="text-white/70 text-sm">{subtitle}</p>
            )}
            <p className="text-white/50 text-xs mt-4">Video coming soon</p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/10 -skew-x-12 transform translate-x-1/4" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`relative ${aspectClasses[aspectRatio]} rounded-xl overflow-hidden bg-black group`}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          onLoadedData={() => setIsLoaded(true)}
          playsInline
        />

        {/* Play/Pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${
            isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
          }`}
          onClick={handlePlayClick}
        >
          {/* Gradient overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          )}

          {/* Play button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary" />
            ) : (
              <Play className="w-8 h-8 text-primary ml-1" />
            )}
          </motion.div>

          {/* Title overlay when paused */}
          {!isPlaying && (title || subtitle) && (
            <div className="absolute bottom-6 left-6 right-6 text-white">
              {subtitle && (
                <p className="text-xs uppercase tracking-wider text-secondary mb-2">{subtitle}</p>
              )}
              {title && (
                <h3 className="text-xl md:text-2xl font-serif">{title}</h3>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Compact video card for grids
export function VideoCard({
  videoSrc,
  posterSrc,
  title,
  duration,
  className = "",
}: {
  videoSrc?: string;
  posterSrc?: string;
  title: string;
  duration?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group cursor-pointer ${className}`}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
        {posterSrc ? (
          <img src={posterSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary" />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}
      </div>

      <h4 className="font-medium text-primary group-hover:text-primary/80 transition-colors">
        {title}
      </h4>
    </motion.div>
  );
}

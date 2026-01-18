import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPlayerProps {
  src: string;
  alt?: string;
  className?: string;
  blurred?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  previewOnly?: boolean;
}

/**
 * Sprawdza typ mediów na podstawie URL lub data URI
 */
export function getMediaType(url: string): "image" | "video" | "gif" {
  if (!url) return "image";
  
  const lowerUrl = url.toLowerCase();
  
  // Sprawdź rozszerzenie
  if (lowerUrl.includes(".mp4") || lowerUrl.includes(".webm") || lowerUrl.includes(".mov") || lowerUrl.includes(".ogg")) {
    return "video";
  }
  
  if (lowerUrl.includes(".gif")) {
    return "gif";
  }
  
  // Sprawdź data URI
  if (url.startsWith("data:")) {
    if (url.startsWith("data:video/")) {
      return "video";
    }
    if (url.startsWith("data:image/gif")) {
      return "gif";
    }
  }
  
  return "image";
}

/**
 * Sprawdza czy plik jest obsługiwanym typem mediów
 */
export function isValidMediaFile(file: File): boolean {
  const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  const validVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  
  return validImageTypes.includes(file.type) || validVideoTypes.includes(file.type);
}

/**
 * Sprawdza czy plik jest video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * Maksymalne rozmiary plików
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_GIF_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Komponent do wyświetlania mediów (zdjęcia, video, gif)
 */
export function MediaPlayer({
  src,
  alt = "",
  className = "",
  blurred = false,
  showControls = true,
  autoPlay = false,
  loop = true,
  muted = true,
  previewOnly = false,
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const mediaType = getMediaType(src);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  // Blurowane media
  const blurClass = blurred ? "premium-blur scale-110" : "";
  
  if (mediaType === "video") {
    return (
      <div className={`relative group ${className}`}>
        <video
          ref={videoRef}
          src={src}
          className={`w-full h-full object-cover ${blurClass}`}
          loop={previewOnly ? false : loop}
          muted={isMuted}
          autoPlay={previewOnly ? false : autoPlay}
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video controls overlay */}
        {showControls && !blurred && !previewOnly && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Play button overlay when paused */}
        {!isPlaying && !blurred && !previewOnly && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="p-4 rounded-full bg-black/50 backdrop-blur-sm">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // GIF lub obraz
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-cover ${blurClass} ${className}`}
    />
  );
}

/**
 * Badge pokazujący typ mediów
 */
export function MediaTypeBadge({ src }: { src: string }) {
  const mediaType = getMediaType(src);
  
  if (mediaType === "video") {
    return (
      <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-black/60 text-white rounded-md flex items-center gap-1">
        <Play className="h-3 w-3" />
        Video
      </span>
    );
  }
  
  if (mediaType === "gif") {
    return (
      <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-black/60 text-white rounded-md">
        GIF
      </span>
    );
  }
  
  return null;
}


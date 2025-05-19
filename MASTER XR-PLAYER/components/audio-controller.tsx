"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ThumblessSlider } from "@/components/ui/thumbless-slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Menu, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Helper function to format time in MM:SS format
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export interface AudioControllerProps {
  /** External audio element reference */
  externalAudioRef?: React.RefObject<HTMLAudioElement | null>
  /** URL of the audio file to play (only used if externalAudioRef is not provided) */
  src?: string
  /** Whether the audio is currently playing */
  isPlaying?: boolean
  /** Current playback time in seconds */
  currentTime?: number
  /** Total duration of the audio in seconds */
  duration?: number
  /** Whether the audio is muted */
  isMuted?: boolean
  /** Callback fired when the play/pause button is clicked */
  onPlayPause?: () => void
  /** Callback fired when the mute button is clicked */
  onMuteToggle?: () => void
  /** Callback fired when the user seeks to a new position */
  onSeek?: (time: number) => void
  /** Callback fired when the track reaches its end (only used if externalAudioRef is not provided) */
  onTrackEnd?: () => void
  /** Callback fired when the track starts playing (only used if externalAudioRef is not provided) */
  onPlay?: () => void
  /** Callback fired when the track is paused (only used if externalAudioRef is not provided) */
  onPause?: () => void
  /** Callback fired when the track time is updated (only used if externalAudioRef is not provided) */
  onTimeUpdate?: (currentTime: number, duration: number) => void
  /** Whether the component is in XR mode */
  isXR?: boolean
  /** Whether there's an error with the audio */
  hasError?: boolean
}

export function AudioController({
  externalAudioRef,
  src,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  isMuted = false,
  onPlayPause,
  onMuteToggle,
  onSeek,
  onTrackEnd,
  onPlay,
  onPause,
  onTimeUpdate,
  isXR = false,
  hasError = false,
}: AudioControllerProps) {
  // Only create internal audio ref if external is not provided
  const internalAudioRef = useRef<HTMLAudioElement | null>(null)
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [internalCurrentTime, setInternalCurrentTime] = useState(0)
  const [internalDuration, setInternalDuration] = useState(0)
  const [internalIsMuted, setInternalIsMuted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [internalHasError, setInternalHasError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      )
      setIsMobile(isMobileDevice)
    }

    checkMobile()
  }, [])

  // Determine if we're using external or internal audio control
  const usingExternalControl = !!externalAudioRef

  // Set up internal audio element if needed
  useEffect(() => {
    if (!usingExternalControl && src) {
      const audio = internalAudioRef.current || new Audio()
      internalAudioRef.current = audio

      const updateTime = () => {
        if (!isDragging) {
          const newTime = audio.currentTime
          setInternalCurrentTime(newTime)

          if (onTimeUpdate) {
            onTimeUpdate(newTime, audio.duration)
          }
        }
      }

      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setInternalDuration(audio.duration)
          setInternalHasError(false)
        }
      }

      const handleEnded = () => {
        setInternalIsPlaying(false)
        setInternalCurrentTime(0)
        audio.currentTime = 0

        if (onTrackEnd) {
          onTrackEnd()
        }
      }

      const handlePlay = () => {
        setInternalIsPlaying(true)
        if (onPlay) {
          onPlay()
        }
      }

      const handlePause = () => {
        setInternalIsPlaying(false)
        if (onPause) {
          onPause()
        }
      }

      const handleError = (e: Event) => {
        console.error("Audio error in controller:", e)
        setInternalIsPlaying(false)
        setInternalHasError(true)
      }

      audio.addEventListener("timeupdate", updateTime)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("play", handlePlay)
      audio.addEventListener("pause", handlePause)
      audio.addEventListener("error", handleError)

      if (audio.src !== src) {
        audio.src = src
        audio.preload = "auto"
        audio.crossOrigin = "anonymous" // Add this to handle CORS for external sources
        audio.load()
      }

      return () => {
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("play", handlePlay)
        audio.removeEventListener("pause", handlePause)
        audio.removeEventListener("error", handleError)
      }
    }
  }, [usingExternalControl, src, isDragging, onTrackEnd, onPlay, onPause, onTimeUpdate])

  // Play/pause toggle
  const togglePlayPause = () => {
    console.log("Play/Pause toggled, isPlaying:", isPlaying)
    if (usingExternalControl && onPlayPause) {
      onPlayPause()
    } else if (internalAudioRef.current) {
      if (internalIsPlaying) {
        internalAudioRef.current.pause()
      } else {
        // Make sure the source is set correctly
        if (!internalAudioRef.current.src && src) {
          internalAudioRef.current.src = src
          internalAudioRef.current.load()
        }

        internalAudioRef.current.play().catch((err) => {
          console.error("Error playing audio in controller:", err)
          setInternalIsPlaying(false)
          setInternalHasError(true)
        })
      }
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (usingExternalControl && onMuteToggle) {
      onMuteToggle()
    } else if (internalAudioRef.current) {
      internalAudioRef.current.muted = !internalAudioRef.current.muted
      setInternalIsMuted(!internalIsMuted)
    }
  }

  // Handle slider change during dragging
  const handleSliderChange = (value: number[]) => {
    console.log("Slider value changing:", value[0])
    const newTime = value[0]
    if (usingExternalControl) {
      // Update visual state during dragging
      // This is important - we need to show the position changing even before commit
      if (onSeek && isDragging) {
        onSeek(newTime) // Update in real-time during drag
      }
    } else {
      setInternalCurrentTime(newTime)
    }
  }

  // Handle slider release - update audio position
  const handleSliderCommit = (value: number[]) => {
    console.log("Slider value committed:", value[0])
    const newTime = value[0]

    if (usingExternalControl && onSeek) {
      onSeek(newTime)
    } else if (internalAudioRef.current) {
      internalAudioRef.current.currentTime = newTime
      setInternalCurrentTime(newTime)
    }

    setIsDragging(false)
  }

  // Placeholder functions for previous and next buttons
  const handlePrevious = () => {
    console.log("Previous track")
  }

  const handleNext = () => {
    console.log("Next track")
  }

  // Use either external or internal state
  const effectiveIsPlaying = usingExternalControl ? isPlaying : internalIsPlaying
  const effectiveCurrentTime = usingExternalControl ? currentTime : internalCurrentTime
  const effectiveDuration = usingExternalControl ? duration : internalDuration
  const effectiveIsMuted = usingExternalControl ? isMuted : internalIsMuted
  const effectiveHasError = usingExternalControl ? hasError : internalHasError

  // Determine text color based on XR mode
  const textColor = isXR ? "text-white" : "text-foreground"
  const mutedTextColor = isXR ? "text-white/60" : "text-muted-foreground"

  // Determine border color based on XR mode
  const borderColor = isXR ? "border-blue-400/30" : "border-blue-200/30"

  // Larger icon sizes
  const iconSize = isMobile ? 56 : 64 // For the play/pause button (h-20 w-20 = 80px container)
  const smallIconSize = isMobile ? 40 : 48 // For the other buttons (h-16 w-16 = 64px container)

  return (
    <div className={cn(
      "w-full space-y-4", 
      textColor, 
      "border rounded-xl p-4", 
      borderColor,
      isXR ? "bg-black/70" : ""
    )}>
      {/* Only render audio element if using internal control */}
      {!usingExternalControl && src && <audio ref={internalAudioRef} src={src} preload="metadata" />}

      {/* Error message */}
      {effectiveHasError && (
        <div
          className={cn(
            "flex items-center justify-center gap-2 py-3 px-4 rounded-md mb-3",
            isXR ? "bg-red-900/50 text-white" : "bg-red-100 text-red-800",
          )}
        >
          <AlertCircle className="h-6 w-6" />
          <span className="text-base">Audio could not be loaded. Click play to try again.</span>
        </div>
      )}

      <div className="space-y-2">
        <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <ThumblessSlider
            aria-label="Playback position"
            color={isXR ? "primary" : isDragging ? "primary" : isHovering ? "secondary" : "default"}
            value={[effectiveCurrentTime]}
            max={effectiveDuration || 100}
            step={0.1}
            hideThumb={true}
            onValueChange={(value) => {
              setIsDragging(true)
              handleSliderChange(value)
            }}
            onValueCommit={(value) => {
              handleSliderCommit(value)
              setIsDragging(false) // Remove the timeout and set immediately
            }}
            className={cn(
              "h-3", // Increased height for better touch target
              isXR ? "opacity-90 hover:opacity-100" : "",
              isDragging ? "scale-y-125" : "",
              isHovering && !isDragging ? "scale-y-110" : "",
              effectiveHasError ? "opacity-50" : "",
            )}
          />
        </div>

        <div className={cn("flex justify-between text-base", mutedTextColor)}>
          <span>{formatTime(effectiveCurrentTime)}</span>
          <span>{formatTime(effectiveDuration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Left side - Hamburger menu */}
        <Button
          variant="ghost"
          size="lg"
          className={cn("rounded-full h-16 w-16", isXR ? "text-white hover:text-white/80 hover:bg-white/10" : "")}
          id="playlist-btn"
          aria-label="Open playlist"
        >
          <Menu size={smallIconSize} />
        </Button>

        {/* Center - Playback controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="lg"
            className={cn("rounded-full h-16 w-16", isXR ? "text-white hover:text-white/80 hover:bg-white/10" : "")}
            onClick={handlePrevious}
            aria-label="Previous track"
          >
            <SkipBack size={smallIconSize} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "h-20 w-20 rounded-full",
              effectiveIsPlaying ? "bg-primary text-primary-foreground hover:bg-primary/90" : "",
              isXR && !effectiveIsPlaying ? "text-white border-white/20 hover:bg-white/10" : "",
              effectiveHasError ? "border-red-500" : "",
            )}
            onClick={togglePlayPause}
            aria-label={effectiveIsPlaying ? "Pause" : "Play"}
          >
            {effectiveIsPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} />}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={cn("rounded-full h-16 w-16", isXR ? "text-white hover:text-white/80 hover:bg-white/10" : "")}
            onClick={handleNext}
            aria-label="Next track"
          >
            <SkipForward size={smallIconSize} />
          </Button>
        </div>

        {/* Right side - Volume toggle */}
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "rounded-full h-16 w-16",
            "transition-colors duration-300",
            effectiveIsMuted && "text-red-500 animate-pulse-slow hover:text-red-400",
            isXR && !effectiveIsMuted ? "text-white hover:text-white/80 hover:bg-white/10" : "",
          )}
          onClick={toggleMute}
          aria-label={effectiveIsMuted ? "Unmute" : "Mute"}
        >
          {effectiveIsMuted ? <VolumeX size={smallIconSize} /> : <Volume2 size={smallIconSize} />}
        </Button>
      </div>
    </div>
  )
}

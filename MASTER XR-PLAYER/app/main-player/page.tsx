"use client"

import { useState, useEffect, useRef } from "react"
import { ImageSlider } from "@/components/image-slider"
import { AudioController } from "@/components/audio-controller"
import { TrackInfo } from "@/components/track-info"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { RotateCcw, Music } from "lucide-react"
import XRVideoPlayer from "@/components/xr-video-player"
import { defaultXRContent, xrContentList, DEFAULT_AUDIO_SRC } from "@/config/xr-content"

// Sample images from the project
const images = [
  "/colorful-abstract-album-cover.png",
  "/abstract-soundscape.png",
  "/abstract-art-1.png",
  "/abstract-art-2.png",
  "/abstract-art-3.png",
]

// Fallback audio sources - we'll try these if the primary source fails
const fallbackAudioSources = [
  DEFAULT_AUDIO_SRC,
  "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-dreamy-ambient-piano-notification-225.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-guitar-loop-668.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
]

export default function MainPlayerPage() {
  // Audio element ref - this will persist across mode changes
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioSourceIndex, setAudioSourceIndex] = useState(0)
  const [audioLoadError, setAudioLoadError] = useState(false)

  // XR mode state
  const [isXRModeActive, setIsXRModeActive] = useState(false)
  const [currentXRContent, setCurrentXRContent] = useState(defaultXRContent)
  const [preloadedXRContent, setPreloadedXRContent] = useState(defaultXRContent.xrSrc)
  
  // Track when XR content has been preloaded
  const [isXRContentPreloaded, setIsXRContentPreloaded] = useState(false)
  
  // Image slider state
  const [currentSlide, setCurrentSlide] = useState(0)

  // Audio player state - completely independent from image slider
  const [audioSrc, setAudioSrc] = useState(defaultXRContent.audioSrc)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  // Track info state - independent from image slider
  const [chapterOrder, setChapterOrder] = useState(1)
  const [chapterName, setChapterName] = useState(defaultXRContent.name)
  const [tourName, setTourName] = useState("XR Experience")
  const [isXRTrack, setIsXRTrack] = useState(true) // Set to true for demonstration

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Try the next audio source if the current one fails
  const tryNextAudioSource = () => {
    const nextIndex = audioSourceIndex + 1
    if (nextIndex < fallbackAudioSources.length) {
      setAudioSourceIndex(nextIndex)
      setAudioSrc(fallbackAudioSources[nextIndex])
      setAudioLoadError(false)

      toast({
        title: "Trying alternative audio source",
        description: "The original audio file couldn't be loaded. Trying an alternative source.",
      })
    } else {
      setAudioLoadError(true)
      toast({
        title: "Audio Error",
        description: "Could not load any audio sources. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio()

      // Set up event listeners
      const playHandler = () => setIsPlaying(true)
      const pauseHandler = () => setIsPlaying(false)

      audio.addEventListener("play", playHandler)
      audio.addEventListener("pause", pauseHandler)
      audio.addEventListener("ended", handleTrackEnd)
      audio.addEventListener("timeupdate", handleAudioTimeUpdate)
      audio.addEventListener("loadedmetadata", handleMetadataLoaded)
      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e)
        // Log more details about the error
        if (audio.error) {
          console.error("Audio error code:", audio.error.code)
          console.error("Audio error message:", audio.error.message)
        }
        tryNextAudioSource()
      })

      // Set the source to our reliable external source
      try {
        audio.src = audioSrc
        audio.preload = "auto"
        audio.crossOrigin = "anonymous" // Add this to handle CORS for external sources
        audio.load()
      } catch (err) {
        console.error("Error setting up audio:", err)
        tryNextAudioSource()
      }

      audioRef.current = audio

      // Cleanup function
      return () => {
        audio.pause()
        audio.removeEventListener("play", playHandler)
        audio.removeEventListener("pause", pauseHandler)
        audio.removeEventListener("ended", handleTrackEnd)
        audio.removeEventListener("timeupdate", handleAudioTimeUpdate)
        audio.removeEventListener("loadedmetadata", handleMetadataLoaded)
        audio.removeEventListener("error", (e) => console.error("Audio error:", e))
      }
    }
  }, [])

  // Update audio source if it changes
  useEffect(() => {
    if (audioRef.current && audioRef.current.src !== audioSrc) {
      const wasPlaying = !audioRef.current.paused

      try {
        // Update the source
        audioRef.current.src = audioSrc
        audioRef.current.load()

        // If it was playing before, try to resume playback after a short delay
        if (wasPlaying) {
          const playPromise = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch((err) => {
                console.error("Error resuming playback after source change:", err)
                tryNextAudioSource()
              })
            }
          }, 300)

          return () => clearTimeout(playPromise)
        }
      } catch (err) {
        console.error("Error changing audio source:", err)
        tryNextAudioSource()
      }
    }
  }, [audioSrc])

  // Detect mobile devices and handle viewport height
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      )
      setIsMobile(isMobileDevice)
    }

    const updateViewportHeight = () => {
      // Use the visual viewport API if available (more accurate on mobile)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        setViewportHeight(window.innerHeight)
      }
    }

    checkMobile()
    updateViewportHeight()

    // Update on resize and orientation change
    window.addEventListener("resize", updateViewportHeight)
    window.addEventListener("orientationchange", updateViewportHeight)

    // For iOS Safari, we need to listen to the visualViewport resize event
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportHeight)
    }

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.removeEventListener("orientationchange", updateViewportHeight)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateViewportHeight)
      }
    }
  }, [])

  // Disable scrolling and zooming when component mounts
  useEffect(() => {
    // Save original styles to restore them later
    const originalOverflow = document.body.style.overflow
    const originalHeight = document.body.style.height
    const originalTouchAction = document.body.style.touchAction

    // Disable scrolling and zooming
    document.body.style.overflow = "hidden"
    document.body.style.height = "100%"
    document.body.style.touchAction = "none"

    // Add meta tag to prevent zooming
    const metaTag = document.createElement("meta")
    metaTag.name = "viewport"
    metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    document.head.appendChild(metaTag)

    // Cleanup function to restore original styles when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.height = originalHeight
      document.body.style.touchAction = originalTouchAction
      document.head.removeChild(metaTag)
    }
  }, [])

  // Handle slide changes - only affects the image display and preloads XR content
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index)
    
    // Update XR content for potential future XR mode activation, but don't change audio
    if (index < xrContentList.length) {
      const newContent = xrContentList[index]
      setCurrentXRContent(newContent)
      setChapterName(newContent.name)
      
      // Preload the XR content for this slide
      setPreloadedXRContent(newContent.xrSrc)
      setIsXRContentPreloaded(false)
    }
  }

  // Audio event handlers
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }

  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0)
      setAudioLoadError(false)
    }
  }

  const handleTrackEnd = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  // Audio control functions
  const togglePlayPause = () => {
    if (audioLoadError) {
      // If we've had errors with all sources, try the first fallback again
      setAudioSourceIndex(0)
      setAudioSrc(fallbackAudioSources[0])
      setAudioLoadError(false)
      return
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Make sure the source is set before playing
        if (!audioRef.current.src || audioRef.current.src === "") {
          audioRef.current.src = audioSrc
          audioRef.current.load()
        }

        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err)
          // If we get the "no supported sources" error, try the next source
          if (err.message && err.message.includes("no supported sources")) {
            tryNextAudioSource()
          } else {
            // For other errors, just log and show the error state
            setAudioLoadError(true)
            toast({
              title: "Audio Error",
              description: err.message || "Could not play audio",
              variant: "destructive",
            })
          }
        })
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Handle XR mode button click
  const handleXRModeClick = () => {
    console.log("XR-mode-button-clicked")
    
    // If the XR content isn't preloaded yet, show a toast
    if (!isXRContentPreloaded) {
      toast({
        title: "Loading XR Experience",
        description: "Please wait while the XR content loads..."
      })
    }
    
    // Make sure currentXRContent.xrSrc matches the preloaded content
    if (currentXRContent.xrSrc !== preloadedXRContent) {
      // Find the matching content for the preloaded source
      const matchingContent = xrContentList.find(content => content.xrSrc === preloadedXRContent);
      if (matchingContent) {
        setCurrentXRContent(matchingContent);
      }
    }
    
    // Activate XR mode
    setIsXRModeActive(true)

    toast({
      title: "XR Mode Activated",
      description: `Entering ${currentXRContent.sceneName} experience`,
      action: <ToastAction altText="Close">Close</ToastAction>,
    })
  }

  // Handle audio only button click in XR mode
  const handleAudioOnlyClick = () => {
    console.log("Audio only clicked")
    setIsXRModeActive(false)

    toast({
      title: "XR Mode Deactivated",
      description: "Returning to audio-only mode",
    })
  }

  // Handle recenter button click in XR mode
  const handleRecenterClick = () => {
    console.log("Recenter button clicked in main player")

    // Call the global recenterCamera function directly
    if (typeof window !== "undefined") {
      if (window.recenterCamera) {
        console.log("Found window.recenterCamera function, calling it now")
        window.recenterCamera();
      } else {
        console.error("window.recenterCamera function not found");
        // Try to find the camera entity directly as a fallback
        if (typeof document !== "undefined") {
          const cameraEntity = document.getElementById("cameraEntity");
          if (cameraEntity) {
            console.log("Found camera entity, attempting to reset rotation");
            cameraEntity.setAttribute("rotation", "0 0 0");
          } else {
            console.error("Camera entity not found");
          }
        }
      }
    }

    toast({
      title: "Recenter",
      description: "Recentering XR experience",
    })
  }

  // Extract and format filename from audio path
  const getAudioName = (src: string) => {
    // First check if this audio source matches one of our XR contents
    const matchingContent = xrContentList.find(content => content.audioSrc === src)
    if (matchingContent) {
      return matchingContent.name
    }
    
    // Fallback to extracting from URL
    const filename = src.split("/").pop() || "Audio Player"
    const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "")
    const formattedName = nameWithoutExtension.replace(/[_-]/g, " ")
    
    return formattedName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to handle when XR content is preloaded
  const handleXRContentPreloaded = () => {
    console.log("XR content preloaded successfully")
    setIsXRContentPreloaded(true)
  }

  // Render both mode UIs but control visibility with CSS
  return (
    <div className="min-h-screen h-full bg-background overflow-hidden">
      {/* XR Mode UI - hidden when not active */}
      <div className={`fixed inset-0 bg-black overflow-hidden ${isXRModeActive ? 'block' : 'hidden'}`}>
        {/* Top controls for XR mode */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAudioOnlyClick}
            className="bg-black/50 text-white border-white/20 hover:bg-black/70 hover:text-white"
          >
            <Music className="h-8 w-8 mr-2" />
            <span className="text-lg">Audio Only</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleRecenterClick}
            className="bg-black/50 text-white border-white/20 hover:bg-black/70 hover:text-white"
          >
            <RotateCcw className="h-8 w-8 mr-2" />
            <span className="text-lg">Recenter</span>
          </Button>
        </div>

        {/* XR content area - always loaded but only visible in XR mode */}
        <div className="w-full h-full">
          <XRVideoPlayer 
            xrSrc={preloadedXRContent}
            audioRef={audioRef}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onRecenter={handleRecenterClick}
          />
        </div>
      </div>

      {/* Audio-only mode UI - hidden when XR mode is active */}
      <div 
        className={`flex justify-center min-h-screen h-full ${isXRModeActive ? 'hidden' : 'block'}`}
        style={{
          paddingTop: isMobile ? "1rem" : "1rem",
          paddingRight: "1rem",
          paddingLeft: "1rem",
          paddingBottom: isMobile ? "1.5rem" : "1rem",
        }}
      >
        <div className="w-full max-w-4xl h-full flex flex-col">
          {/* Image Slider - takes available space but can shrink */}
          <div className={`flex-1 min-h-0 flex items-center justify-center ${isMobile ? "mb-2" : "mb-4"}`}>
            <ImageSlider
              images={images}
              alt="Visual imagery"
              autoplay={false}
              onSlideChange={handleSlideChange}
              allowVerticalCrop={true}
              className="w-full"
            />
          </div>

          {/* Track Info - fixed height, doesn't shrink */}
          <div className={`${isMobile ? "mb-2" : "mb-4"} w-full`}>
            <TrackInfo
              chapterOrder={chapterOrder}
              chapterName={getAudioName(audioSrc)}
              tourName={tourName}
              initialDelay={5}
              loopDelay={10}
              isXR={isXRTrack}
              onXRModeClick={handleXRModeClick}
            />
          </div>
        </div>
      </div>

      {/* Preload XR video in the background (invisible) */}
      <div className="hidden">
        <XRVideoPlayer 
          xrSrc={preloadedXRContent}
          audioRef={audioRef}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onRecenter={handleRecenterClick}
          isPreloadOnly={true}
          onPreloaded={handleXRContentPreloaded}
        />
      </div>

      {/* Audio Controller - always visible at the bottom with highest z-index */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto px-2 pb-2 sm:px-4 sm:pb-4">
        <div className="max-w-4xl mx-auto">
          <AudioController
            externalAudioRef={audioRef}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            onPlayPause={togglePlayPause}
            onMuteToggle={toggleMute}
            onSeek={seekAudio}
            isXR={isXRModeActive}
            hasError={audioLoadError}
          />
        </div>
      </div>
    </div>
  )
}

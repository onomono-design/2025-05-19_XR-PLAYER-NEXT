"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { LoadingModal } from "./loading-modal"

// Add global type declaration for the recenterCamera function
declare global {
  interface Window {
    recenterCamera: () => void;
    DeviceOrientationEvent: DeviceOrientationEvent & {
      requestPermission?: () => Promise<string>;
    };
    AFRAME: any;
  }
}

interface XRVideoPlayerProps {
  xrSrc: string
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  currentTime: number
  duration: number
  className?: string
  onRecenter?: () => void
  isPreloadOnly?: boolean
  onPreloaded?: () => void
}

export default function XRVideoPlayer({
  xrSrc,
  audioRef,
  isPlaying,
  currentTime,
  duration,
  className = "",
  onRecenter,
  isPreloadOnly = false,
  onPreloaded
}: XRVideoPlayerProps) {
  const [isAFrameLoaded, setIsAFrameLoaded] = useState(false)
  const [showLoading, setShowLoading] = useState(!isPreloadOnly)
  const [videoReady, setVideoReady] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [deviceOrientationPermissionGranted, setDeviceOrientationPermissionGranted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const sceneRef = useRef<any>(null)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check if this is a mobile browser
  const isMobile =
    typeof navigator !== "undefined"
      ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      : false

  // Function to hide loading after a delay
  const hideLoadingWithDelay = (delay = 500) => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current)
    }

    loadingTimerRef.current = setTimeout(() => {
      setShowLoading(false)
    }, delay)
  }

  // Function to sync video with audio
  const syncVideoWithAudio = () => {
    if (videoRef.current && audioRef.current && !isSeeking) {
      const video = videoRef.current
      const audio = audioRef.current

      // Calculate time difference between video and audio
      const timeDiff = Math.abs(video.currentTime - audio.currentTime)

      // If difference is significant (more than 0.3 seconds), sync video to audio
      if (timeDiff > 0.3) {
        console.log(`Syncing video (${video.currentTime.toFixed(2)}) to audio (${audio.currentTime.toFixed(2)})`)
        video.currentTime = audio.currentTime
      }

      // Match play state
      if (!audio.paused && video.paused) {
        video.play().catch((err: Error) => {
          console.error("Error playing video:", err)
        })
      } else if (audio.paused && !video.paused) {
        video.pause()
      }
    }
  }

  // Start sync interval
  const startSyncInterval = () => {
    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }

    // Set up new interval to sync video with audio
    syncIntervalRef.current = setInterval(syncVideoWithAudio, 1000)
    console.log("Started sync interval")
  }

  // Stop sync interval
  const stopSyncInterval = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
      console.log("Stopped sync interval")
    }
  }

  // Initial setup - adjust behavior for preload mode
  useEffect(() => {
    // Only show force loading message if not in preload mode
    const maxLoadingTimer = !isPreloadOnly ? setTimeout(() => {
      console.log("Force hiding loading message after timeout")
      setShowLoading(false)
    }, 8000) : null;

    // Prevent touchmove default behavior to disable scrolling - only if not preloading
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault()
    }

    if (!isPreloadOnly) {
      document.addEventListener("touchmove", preventScroll, { passive: false })
    }

    // Register A-Frame component if the script is already loaded
    if (typeof window !== "undefined" && window.AFRAME) {
      registerAFrameComponents()
    }

    return () => {
      if (maxLoadingTimer) {
        clearTimeout(maxLoadingTimer)
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (!isPreloadOnly) {
        document.removeEventListener("touchmove", preventScroll)
      }
    }
  }, [isPreloadOnly])

  // Function to register A-Frame components
  const registerAFrameComponents = () => {
    if (typeof window !== "undefined" && window.AFRAME) {
      if (!window.AFRAME.components["camera-recenter"]) {
        console.log("Registering camera-recenter component")
        window.AFRAME.registerComponent("camera-recenter", {
          schema: {
            initialRotation: { type: "vec3", default: { x: 0, y: -90, z: 0 } },
          },

          init: function () {
            this.cameraEl = this.el
            this.initialRotation = { x: 0, y: 0, z: 0 }
            this.videosphere = document.getElementById("videosphere")
            this.originalVideosphereRotation = this.videosphere ? this.videosphere.getAttribute("rotation").y : -90

            // Device orientation tracking
            this.deviceOrientationOffset = { alpha: 0, beta: 0, gamma: 0 }
            this.lastDeviceOrientation = null
            this.hasDeviceOrientationData = false
            this.hasInteracted = false
            this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent,
            )

            this.el.sceneEl.addEventListener("loaded", () => {
              this.initialRotation = Object.assign({}, this.cameraEl.getAttribute("rotation"))
              console.log("Initial camera rotation stored:", this.initialRotation)

              const cameraEntity = document.getElementById("cameraEntity")
              if (cameraEntity && !cameraEntity.hasAttribute("camera-recenter")) {
                cameraEntity.setAttribute("camera-recenter", "")
              }

              // Start device orientation tracking after scene is loaded
              if (this.isMobile) {
                this.setupDeviceOrientationTracking()
              }
            })

            // Make recenter function available globally
            window.recenterCamera = this.recenter.bind(this)

            // Track user interaction
            this.el.sceneEl.addEventListener("touchstart", () => {
              this.hasInteracted = true
            })

            console.log("Camera recenter component initialized")
          },

          setupDeviceOrientationTracking: function () {
            // Check if device orientation is available and set up tracking
            if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
              console.log("Setting up device orientation tracking")

              // Store the handler so we can remove it later if needed
              this.deviceOrientationHandler = this.handleDeviceOrientation.bind(this)

              // Add the event listener
              window.addEventListener("deviceorientation", this.deviceOrientationHandler)
            } else {
              console.log("DeviceOrientationEvent not supported")
            }
          },

          handleDeviceOrientation: function (event: DeviceOrientationEvent) {
            // Store the last device orientation
            this.lastDeviceOrientation = {
              alpha: event.alpha || 0,
              beta: event.beta || 0,
              gamma: event.gamma || 0,
            }

            // Mark that we have device orientation data
            if (event.alpha !== null && event.alpha !== undefined) {
              this.hasDeviceOrientationData = true
            }
          },

          recenter: function () {
            console.log("Recentering camera")
            
            if (!this.isMobile) {
              this.resetDesktopView()
            } else {
              this.resetMobileView()
            }
          },

          resetDesktopView: function () {
            const camera = this.cameraEl
            const lookControls = camera.components["look-controls"]

            if (lookControls) {
              // Reset pitch and yaw objects
              if (lookControls.pitchObject && lookControls.yawObject) {
                lookControls.pitchObject.rotation.x = 0
                lookControls.yawObject.rotation.y = 0
                console.log("Desktop: Reset yawObject and pitchObject rotation to 0")
              }

              // Reset rotation
              if (lookControls.rotation) {
                lookControls.rotation.x = 0
                lookControls.rotation.y = 0
              }
            }

            // Reset camera rotation
            camera.setAttribute("rotation", { x: 0, y: 0, z: 0 })
            console.log("Desktop camera view reset")
            return true
          },

          resetMobileView: function () {
            console.log("Attempting mobile view reset")
            const camera = this.cameraEl
            const lookControls = camera.components["look-controls"]

            if (lookControls && this.lastDeviceOrientation) {
              // Update device orientation offset
              this.deviceOrientationOffset = {
                alpha: this.lastDeviceOrientation.alpha,
                beta: this.lastDeviceOrientation.beta,
                gamma: this.lastDeviceOrientation.gamma,
              }
              console.log("Updated device orientation offset:", this.deviceOrientationOffset)
            }

            // Reset camera rotation
            camera.setAttribute("rotation", { x: 0, y: 0, z: 0 })
            console.log("Mobile camera view reset attempted")
            return true
          }
        })
      }
    }
  }

  // Function to request device orientation permission
  const requestDeviceOrientationPermission = () => {
    if (
      typeof window !== "undefined" &&
      typeof window.DeviceOrientationEvent !== "undefined" &&
      typeof window.DeviceOrientationEvent.requestPermission === "function"
    ) {
      window.DeviceOrientationEvent.requestPermission()
        .then((permissionState: string) => {
          if (permissionState === "granted") {
            console.log("Device orientation permission granted")
            setDeviceOrientationPermissionGranted(true)

            // Enable device orientation in A-Frame now that we have permission
            if (sceneRef.current) {
              enableDeviceOrientation(sceneRef.current)
            }
          }
        })
        .catch((error: Error) => {
          console.error("Error requesting device orientation permission:", error)
        })
    } else {
      // For devices that don't need permission
      setDeviceOrientationPermissionGranted(true)
    }
  }

  // Function to enable device orientation in A-Frame
  const enableDeviceOrientation = (scene: any) => {
    if (scene) {
      const camera = scene.querySelector("[camera]")
      if (camera && camera.components && camera.components["look-controls"]) {
        camera.components["look-controls"].data.magicWindowTrackingEnabled = true
      }
    }
  }

  // Check for device orientation permission on mobile
  useEffect(() => {
    if (
      isMobile &&
      typeof window !== "undefined" &&
      typeof window.DeviceOrientationEvent !== "undefined" &&
      typeof window.DeviceOrientationEvent.requestPermission === "function" &&
      !deviceOrientationPermissionGranted
    ) {
      requestDeviceOrientationPermission()
    }
  }, [isMobile, deviceOrientationPermissionGranted])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Always mute the video since audio comes from the audio element
      video.muted = true
      
      // Set low quality for preload version to save bandwidth
      if (isPreloadOnly) {
        video.preload = "metadata"
      } else {
        video.preload = "auto"
      }

      // Function to handle video ready state
      const handleVideoReady = () => {
        console.log("Video can play, readyState:", video.readyState)
        setVideoReady(true)
        if (!isPreloadOnly) {
          hideLoadingWithDelay()
        } else {
          setShowLoading(false)
          // Call the onPreloaded callback if provided
          if (onPreloaded) {
            onPreloaded()
          }
        }
      }

      // Add event listeners
      video.addEventListener("canplay", handleVideoReady)
      video.addEventListener("canplaythrough", handleVideoReady)

      // Initial update if video is already loaded
      if (video.readyState >= 3) {
        console.log("Video already in ready state:", video.readyState)
        setVideoReady(true)
        if (!isPreloadOnly) {
          hideLoadingWithDelay()
        } else {
          setShowLoading(false)
          // Call the onPreloaded callback if provided
          if (onPreloaded) {
            onPreloaded()
          }
        }
      }

      return () => {
        // Remove event listeners
        video.removeEventListener("canplay", handleVideoReady)
        video.removeEventListener("canplaythrough", handleVideoReady)
      }
    }
  }, [isPreloadOnly, onPreloaded])

  // Monitor external audio state
  useEffect(() => {
    // Start sync interval when component mounts
    startSyncInterval()

    // Clean up when component unmounts
    return () => {
      stopSyncInterval()
    }
  }, [])

  // Monitor isPlaying state change
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch((err: Error) => {
          console.error("Error playing video:", err)
        })
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  // Monitor currentTime change for seeking
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      setIsSeeking(true)
      videoRef.current.currentTime = currentTime
      setTimeout(() => setIsSeeking(false), 300)
    }
  }, [currentTime])

  // Recenter camera
  const recenterCamera = () => {
    console.log("Internal recenterCamera function called")
    if (typeof window !== "undefined" && window.recenterCamera) {
      console.log("Calling window.recenterCamera")
      window.recenterCamera()
      if (onRecenter) {
        onRecenter()
      }
    } else {
      console.error("window.recenterCamera is not available")
    }
  }

  return (
    <div className={`w-full h-full relative bg-black overflow-hidden ${className}`}>
      {/* Loading modal - only shown when not preloading */}
      {!isPreloadOnly && <LoadingModal isOpen={showLoading} loadingText="Loading XR Experience" />}

      {/* A-Frame script */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/aframe/1.4.2/aframe.min.js"
        onLoad={() => {
          setIsAFrameLoaded(true)
          registerAFrameComponents()
        }}
      />

      {isAFrameLoaded && (
        <a-scene
          ref={sceneRef}
          embedded
          loading-screen="enabled: false"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          className="w-full h-full"
          renderer={`antialias: true; sortObjects: true; highRefreshRate: ${isPreloadOnly ? 'false' : 'true'}; renderingScale: ${isPreloadOnly ? '0.5' : '1.0'};`}
        >
          <a-assets>
            <video
              ref={videoRef}
              id={isPreloadOnly ? "xr-video-preload" : "xr-video"}
              src={xrSrc}
              crossOrigin="anonymous"
              playsInline
              muted
              preload={isPreloadOnly ? "metadata" : "auto"}
            ></video>
          </a-assets>
          
          <a-entity 
            id={isPreloadOnly ? "cameraEntity-preload" : "cameraEntity"} 
            position="0 0 0" 
            camera 
            look-controls="magicWindowTrackingEnabled: true; reverseMouseDrag: true; reverseTouchDrag: true;" 
            camera-recenter
          >
            <a-entity cursor="rayOrigin: mouse"></a-entity>
          </a-entity>
          
          <a-videosphere
            id={isPreloadOnly ? "videosphere-preload" : "videosphere"}
            src={isPreloadOnly ? "#xr-video-preload" : "#xr-video"}
            rotation="0 -90 0"
            material="opacity: 1; shader: flat; side: back"
          ></a-videosphere>
        </a-scene>
      )}
      
      {/* Expose a non-hidden button for testing - only in active mode */}
      {!isPreloadOnly && (
        <button 
          onClick={recenterCamera} 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded hidden">
          Test Recenter
        </button>
      )}
    </div>
  )
} 
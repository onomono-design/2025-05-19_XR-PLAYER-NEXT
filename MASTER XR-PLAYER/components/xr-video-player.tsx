"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { LoadingModal } from "./loading-modal"
import { getOrientationPermission, requestOrientationPermission as requestOrientationPermissionUtil, requiresOrientationPermission as requiresOrientationPermissionUtil, storeOrientationPermission } from "@/utils/permissions"

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
  const [devMode, setDevMode] = useState(false)

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
      if (!isPreloadOnly) {
        e.preventDefault()
      }
    }

    if (!isPreloadOnly) {
      document.addEventListener("touchmove", preventScroll, { passive: false })
    }

    // Register A-Frame component if the script is already loaded
    if (typeof window !== "undefined" && window.AFRAME) {
      registerAFrameComponents()
    }

    // For mobile, specifically initialize any mobile-related features
    if (isMobile && !isPreloadOnly) {
      console.log("Initializing mobile-specific XR features");
      
      // Make sure a-frame properly handles mobile device orientation
      if (typeof window !== "undefined") {
        // Store a flag in session storage to indicate we're connecting to mobile camera
        try {
          sessionStorage.setItem("xr_mobile_camera_connecting", "true");
        } catch (e) {
          console.error("Error setting session storage:", e);
        }
      }
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
  }, [isPreloadOnly, isMobile]);

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
                
                // Force enable look controls for mobile
                const camera = this.el.sceneEl.camera.el;
                if (camera && camera.components && camera.components["look-controls"]) {
                  console.log("Enabling mobile look controls");
                  camera.components["look-controls"].data.magicWindowTrackingEnabled = true;
                  camera.components["look-controls"].data.touchEnabled = true;
                  
                  // Explicitly update the component to apply changes
                  camera.components["look-controls"].update();
                }
              }
            })

            // Make recenter function available globally
            window.recenterCamera = this.recenter.bind(this)
          },

          setupDeviceOrientationTracking: function () {
            console.log("Setting up device orientation tracking for mobile")
            
            // Only set up event listeners if on mobile and not already tracking
            if (!this.orientationHandler) {
              console.log("Attaching device orientation event listeners");
              
              // Create handler function and store reference for cleanup
              this.orientationHandler = this.handleDeviceOrientation.bind(this);
              
              // Detect iOS
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
              
              // Setup event listener with proper options for iOS
              if (isIOS && typeof DeviceOrientationEvent !== "undefined" && 
                typeof (DeviceOrientationEvent as any).requestPermission === "function") {
                // iOS 13+ with permission model
                console.log("iOS 13+ detected, using special event listener options");
                
                // iOS Safari requires specific handling
                window.addEventListener("deviceorientation", this.orientationHandler, { capture: true, passive: true });
                
                // Force device orientation to be used on iOS
                if (this.el.sceneEl.camera && this.el.sceneEl.camera.el) {
                  const camera = this.el.sceneEl.camera.el;
                  if (camera.components && camera.components["look-controls"]) {
                    console.log("Force enabling iOS device orientation tracking");
                    
                    // For iOS, we need to forcefully set these properties
                    camera.components["look-controls"].data.magicWindowTrackingEnabled = true;
                    camera.components["look-controls"].data.pointerLockEnabled = false;
                    camera.components["look-controls"].data.touchEnabled = true;
                    
                    // Explicitly update the component
                    camera.components["look-controls"].update();
                    
                    // Add a safety timeout to recheck
                    setTimeout(() => {
                      if (camera.components && camera.components["look-controls"]) {
                        if (!camera.components["look-controls"].magicWindowControls) {
                          console.log("Re-initializing iOS magic window controls");
                          camera.components["look-controls"].initialize();
                          camera.components["look-controls"].update();
                        }
                      }
                    }, 1000);
                  }
                }
              } else {
                // Android or older iOS
                console.log("Using standard device orientation event listener");
                window.addEventListener("deviceorientation", this.orientationHandler, { passive: true });
                
                // Enable device orientation for non-iOS devices
                setTimeout(() => {
                  if (this.el.sceneEl.camera && this.el.sceneEl.camera.el) {
                    const camera = this.el.sceneEl.camera.el;
                    if (camera.components && camera.components["look-controls"]) {
                      console.log("Enabling magic window tracking (non-iOS)");
                      camera.components["look-controls"].data.magicWindowTrackingEnabled = true;
                      camera.components["look-controls"].update();
                    }
                  }
                }, 500);
              }
              
              console.log("Device orientation event listeners attached");
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

  // Function to request device orientation permission (internal to this component)
  // This function will now use the utility to ensure localStorage is updated.
  const requestLocalDeviceOrientationPermission = async () => {
    const status = await requestOrientationPermissionUtil(); // Use the utility
    if (status === "granted") {
      console.log("Device orientation permission granted via utility");
      setDeviceOrientationPermissionGranted(true);
      if (sceneRef.current) {
        enableDeviceOrientation(sceneRef.current);
      }
    } else if (status === "denied") {
      console.log("Device orientation permission denied via utility");
      setDeviceOrientationPermissionGranted(false);
    } else { // "not_required"
      console.log("Device orientation permission not required or implicitly granted via utility");
      setDeviceOrientationPermissionGranted(true); // Treat "not_required" as granted for functionality
      if (sceneRef.current && !isPreloadOnly) { // Only enable if not preloading and scene exists
        enableDeviceOrientation(sceneRef.current);
      }
    }
  };

  // Function to enable device orientation in A-Frame
  const enableDeviceOrientation = (scene: any) => {
    if (scene) {
      const camera = scene.querySelector("[camera]")
      if (camera && camera.components && camera.components["look-controls"]) {
        camera.components["look-controls"].data.magicWindowTrackingEnabled = true
        console.log("Magic window tracking enabled for camera")
      } else {
        console.warn("Could not find camera with look-controls to enable device orientation")
      }
    }
  }

  // Check for device orientation permission on mobile
  useEffect(() => {
    const checkPermissions = async () => {
      if (!isMobile || isPreloadOnly) return; // Don't check/request for preloading or non-mobile

      console.log("XRVideoPlayer: Checking device orientation permissions...");
      const storedPermission = getOrientationPermission();
      console.log("XRVideoPlayer: Stored permission state:", storedPermission);

      if (storedPermission === "granted") {
        console.log("XRVideoPlayer: Using stored device orientation permission: granted");
        setDeviceOrientationPermissionGranted(true);
        // Ensure A-Frame controls are updated if permission was already granted
        // Add a slight delay to ensure A-Frame scene might be ready
        setTimeout(() => {
          if (sceneRef.current && isAFrameLoaded) {
             console.log("XRVideoPlayer: Enabling device orientation based on stored permission.");
            enableDeviceOrientation(sceneRef.current);
          }
        }, 500);
        return;
      }

      // If permission is not stored as "granted" (i.e., it's "denied" or null)
      // and the device requires explicit permission (iOS 13+), then request it.
      if (requiresOrientationPermissionUtil()) {
        if (storedPermission === "denied") {
          console.log("XRVideoPlayer: Permission previously denied. Not re-requesting automatically.");
          // Optionally, you could inform the user here that the feature is disabled
          // and how they might re-enable it (e.g., browser settings).
          setDeviceOrientationPermissionGranted(false);
        } else { // storedPermission is null (never asked)
          console.log("XRVideoPlayer: Permission not yet requested or stored. Requesting now...");
          await requestLocalDeviceOrientationPermission();
        }
      } else {
        // For devices that support orientation but don't require explicit permission (e.g., Android)
        // or if it was "not_required" by the utility (which also stores 'granted')
        console.log("XRVideoPlayer: Device supports orientation and doesn't require explicit permission, or already handled by util.");
        setDeviceOrientationPermissionGranted(true); // Implicitly granted
        storeOrientationPermission(true); // Ensure localStorage is aligned if it was null
        setTimeout(() => {
          if (sceneRef.current && isAFrameLoaded) {
            console.log("XRVideoPlayer: Enabling device orientation for non-permission-requiring device.");
            enableDeviceOrientation(sceneRef.current);
          }
        }, 500);
      }
    };

    if (isAFrameLoaded) { // Only run permission checks once A-Frame script itself is loaded
        checkPermissions();
    }
  }, [isMobile, isPreloadOnly, isAFrameLoaded]); // Re-check if mobile status changes or A-Frame loads.

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Always mute the video since audio comes from the audio element
      video.muted = true
      
      // Set playsinline for iOS - critical for video textures
      video.playsInline = true
      
      // Debug video loading issues
      video.addEventListener('error', (e) => {
        console.error('Video error event:', e);
        if (video.error) {
          console.error('Video error code:', video.error.code, 'message:', video.error.message);
        }
      });
      
      // Set low quality for preload version to save bandwidth
      if (isPreloadOnly) {
        video.preload = "metadata"
      } else {
        console.log("Setting up video with src:", xrSrc);
        video.preload = "auto"
        
        // Force the video to load by trying multiple approaches
        try {
          // Ensure src is set properly
          if (!video.src || video.src !== xrSrc) {
            video.src = xrSrc;
          }
          
          // Force load the video
          video.load();
          
          // Try to preload a bit of the video
          setTimeout(() => {
            try {
              // Load at least one frame so texture is available
              video.currentTime = 0.1;
              video.play().then(() => {
                console.log("Successfully started video playback for texture");
                
                // Keep playing for a moment to ensure texture loads
                setTimeout(() => {
                  if (!isPlaying) {
                    video.pause();
                    console.log("Preloaded video frames and paused for XR experience");
                  }
                }, 300);
              }).catch(e => {
                console.warn("Couldn't preload video frame:", e);
                // Try a different approach for iOS
                video.setAttribute('crossorigin', 'anonymous');
                video.load();
              });
            } catch (e) {
              console.warn("Error setting video current time or playing:", e);
            }
          }, 500);
        } catch (e) {
          console.error("Error during video setup:", e);
        }
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
      
      // Log if the video is loading correctly
      if (video.readyState === 0) {
        console.log("Video not initialized yet");
      } else {
        console.log("Initial video readyState:", video.readyState);
      }

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
        video.removeEventListener("error", () => {})
      }
    }
  }, [isPreloadOnly, onPreloaded, isMobile, xrSrc, isPlaying])

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
          
          // Force A-Frame to recognize and process video textures correctly
          if (typeof window !== 'undefined' && window.AFRAME) {
            console.log("Ensuring A-Frame's video textures work correctly");
            // Add a short delay to ensure A-Frame components are registered
            setTimeout(() => {
              if (videoRef.current) {
                // Force a texture update in A-Frame 
                const videoEl = videoRef.current;
                const videosphereEl = document.getElementById(isPreloadOnly ? "videosphere-preload" : "videosphere");
                
                if (videosphereEl) {
                  console.log("Found videosphere, ensuring texture is applied");
                  // Try to force material update
                  videosphereEl.setAttribute('material', 
                    `src: ${isPreloadOnly ? "#xr-video-preload" : "#xr-video"}; shader: flat; side: back; npot: true`
                  );
                }
              }
            }, 1000);
          }
        }}
        strategy="afterInteractive"
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
          stats={devMode ? "true" : "false"}
          inspector={devMode ? "url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js" : "false"}
        >
          <a-assets timeout="15000">
            <video
              ref={videoRef}
              id={isPreloadOnly ? "xr-video-preload" : "xr-video"}
              src={xrSrc}
              crossOrigin="anonymous"
              playsInline
              muted
              preload={isPreloadOnly ? "metadata" : "auto"}
              webkit-playsinline="true"
              loop
            ></video>
          </a-assets>
          
          <a-entity 
            id={isPreloadOnly ? "cameraEntity-preload" : "cameraEntity"} 
            position="0 0 0" 
            camera="active: true;" 
            look-controls={`magicWindowTrackingEnabled: true; reverseMouseDrag: true; reverseTouchDrag: true; touchEnabled: ${isMobile}; mouseEnabled: ${!isMobile};`}
            camera-recenter
          >
            <a-entity cursor="rayOrigin: mouse"></a-entity>
          </a-entity>
          
          <a-videosphere
            id={isPreloadOnly ? "videosphere-preload" : "videosphere"}
            src={isPreloadOnly ? "#xr-video-preload" : "#xr-video"}
            rotation="0 -90 0"
            material="shader: flat; side: back; npot: true;"
          ></a-videosphere>
        </a-scene>
      )}
      
      {/* Expose a non-hidden button for testing - only in active mode */}
      {!isPreloadOnly && isMobile && (
        <button 
          onClick={recenterCamera} 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-6 py-3 rounded-full z-10">
          Recenter View
        </button>
      )}
    </div>
  )
} 
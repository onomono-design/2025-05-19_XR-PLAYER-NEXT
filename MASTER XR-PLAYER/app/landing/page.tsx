"use client"

import { useState, useEffect } from "react"
import { LandingPage, type LandingPageEvent } from "@/components/landing-page"
import { PermissionProvider, usePermission } from "@/contexts/permission-context"
import { requestOrientationPermission } from "@/utils/permissions"
import { useDeviceType } from "@/hooks/use-device-type"

// Update the LandingContent function to include devMode state and pass it to LandingPage
function LandingContent() {
  const [lastEvent, setLastEvent] = useState<LandingPageEvent | null>(null)
  const [isTeaser, setIsTeaser] = useState(false)
  const [forceMobile, setForceMobile] = useState(false)
  const [eventLog, setEventLog] = useState<Array<{ type: string; data: any; time: string }>>([])
  const { orientationPermission, permissionChecked, setOrientationPermission } = usePermission()
  const [devMode, setDevMode] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const deviceType = useDeviceType()
  const isMobile = forceMobile || deviceType === "mobile"
  const isIOS = typeof navigator !== "undefined" ? /iPad|iPhone|iPod/.test(navigator.userAgent) : false

  const handleEvent = (event: LandingPageEvent) => {
    console.log("Event received:", event)
    setLastEvent(event)

    // Add to event log
    const now = new Date()
    const timeString = now.toLocaleTimeString()
    setEventLog((prev) =>
      [
        {
          type: event.type,
          data: { ...event },
          time: timeString,
        },
        ...prev,
      ].slice(0, 10),
    ) // Keep only the last 10 events

    // If this is a permission result, we can log additional details
    if (event.type === "PERMISSION_RESULT") {
      console.log("Permission result detected:", event);
      
      // For iOS, we should track this in session storage to avoid re-asking
      if (isIOS) {
        try {
          sessionStorage.setItem("ios_orientation_permission", event.granted ? "granted" : "denied");
        } catch (e) {
          console.error("Could not store iOS permission in session storage:", e);
        }
      }
    }
  }

  // Set isMounted to true when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)

    // Prevent scrolling on the demo page
    document.body.style.overflow = "hidden"

    // Check for dev mode in URL query param
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const devParam = urlParams.get("dev")
      if (devParam === "false") {
        setDevMode(false)
      }
      
      // Force a clear session storage on fresh visits to landing page
      // This helps with debugging and ensures permission is requested
      if (!sessionStorage.getItem("landing_page_visited")) {
        console.log("First visit to landing page in this session, clearing previous permission state");
        try {
          sessionStorage.removeItem("ios_orientation_permission");
          sessionStorage.removeItem("xr_mobile_camera_connecting");
          sessionStorage.setItem("landing_page_visited", "true");
        } catch (e) {
          console.error("Error manipulating session storage:", e);
        }
      }
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Check for device orientation permission on mobile devices when component mounts
  useEffect(() => {
    if (!isMounted) return;
    
    const checkMobilePermissions = async () => {
      if (isMobile && orientationPermission === "unknown") {
        console.log("Mobile device detected, checking orientation permissions");
        
        // For iOS, we want to defer permission requests until user interaction
        if (isIOS) {
          console.log("iOS detected, waiting for user interaction before requesting permission");
          return;
        }
        
        try {
          // Automatically request permission on Android (non-iOS mobile)
          const permissionResult = await requestOrientationPermission();
          const granted = permissionResult === "granted" || permissionResult === "not_required";
          
          setOrientationPermission(granted ? "granted" : "denied");
          console.log(`Device orientation permission ${granted ? 'granted' : 'denied'}`);
          
          // Add to event log
          const now = new Date();
          const timeString = now.toLocaleTimeString();
          setEventLog((prev) => [
            {
              type: "PERMISSION_AUTO_CHECK",
              data: { granted },
              time: timeString,
            },
            ...prev,
          ].slice(0, 10));
        } catch (error) {
          console.error("Error checking device orientation permission:", error);
        }
      }
    };
    
    checkMobilePermissions();
  }, [isMounted, isMobile, orientationPermission, setOrientationPermission, isIOS]);

  // Toggle dev mode and update URL
  const toggleDevMode = () => {
    const newDevMode = !devMode
    setDevMode(newDevMode)

    // Update URL without refreshing the page
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (newDevMode) {
        url.searchParams.delete("dev")
      } else {
        url.searchParams.set("dev", "false")
      }
      window.history.pushState({}, "", url.toString())
    }
  }

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return null // Or a simple loading state
  }

  return (
    <div>
      <LandingPage
        isTeaser={isTeaser}
        forceMobile={forceMobile}
        onEvent={handleEvent}
        title="Welcome to Our Experience"
        description="Discover our interactive journey through immersive content and engaging visuals. This experience is designed to showcase the capabilities of our platform and provide you with a memorable tour."
        devMode={devMode}
      />

      {/* Dev Mode Toggle Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleDevMode}
          className="bg-black/50 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
        >
          {devMode ? "Hide Controls" : "Show Controls"}
        </button>
      </div>

      {/* Dev controls - only shown when devMode is true */}
      {devMode && (
        <div className="fixed top-4 right-4 bg-black/70 p-4 rounded-lg text-white text-sm z-50 max-h-[90vh] overflow-auto">
          <div className="space-y-2 mb-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={isTeaser} onChange={() => setIsTeaser(!isTeaser)} className="rounded" />
              <span>Teaser Mode</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={forceMobile}
                onChange={() => setForceMobile(!forceMobile)}
                className="rounded"
              />
              <span>Force Mobile</span>
            </label>
          </div>

          {/* Permission Status */}
          <div className="mt-2 p-2 bg-white/10 rounded mb-4">
            <p className="font-medium mb-1">Permission Status:</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  orientationPermission === "granted"
                    ? "bg-green-500"
                    : orientationPermission === "denied"
                      ? "bg-red-500"
                      : orientationPermission === "not_required"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                }`}
              ></div>
              <span>
                {orientationPermission === "granted"
                  ? "Granted"
                  : orientationPermission === "denied"
                    ? "Denied"
                    : orientationPermission === "not_required"
                      ? "Not Required"
                      : "Unknown"}
              </span>
            </div>
            <p className="text-xs mt-1 text-gray-400">
              {permissionChecked ? "Permission status loaded from storage" : "Permission status not yet checked"}
            </p>
          </div>

          {lastEvent && (
            <div className="mt-2 p-2 bg-white/10 rounded">
              <p>
                Last Event: <strong>{lastEvent.type}</strong>
              </p>
              {lastEvent.type === "PERMISSION_RESULT" && (
                <p>
                  Permission: <strong>{(lastEvent as any).granted ? "Granted" : "Denied"}</strong>
                </p>
              )}
              {(lastEvent.type === "DESKTOP_BEGIN_TOUR" || lastEvent.type === "MOBILE_BEGIN_TOUR") && (
                <p>
                  isTeaser: <strong>{lastEvent.isTeaser ? "Yes" : "No"}</strong>
                </p>
              )}
            </div>
          )}

          {/* Event Log */}
          {eventLog.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 border-b border-white/20 pb-1">Event Log</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {eventLog.map((event, index) => (
                  <div key={index} className="text-xs p-1 border-b border-white/10">
                    <div className="flex justify-between">
                      <span className="font-medium">{event.type}</span>
                      <span className="text-gray-400">{event.time}</span>
                    </div>
                    <pre className="mt-1 text-gray-300 overflow-x-auto">{JSON.stringify(event.data, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LandingDemo() {
  return (
    <PermissionProvider>
      <LandingContent />
    </PermissionProvider>
  )
}

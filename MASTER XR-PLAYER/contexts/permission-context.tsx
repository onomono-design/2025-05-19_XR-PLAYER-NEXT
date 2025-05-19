"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getOrientationPermission, storeOrientationPermission } from "@/utils/permissions"

export type PermissionStatus = "granted" | "denied" | "unknown" | "not_required"

interface PermissionContextType {
  orientationPermission: PermissionStatus
  setOrientationPermission: (status: "granted" | "denied") => void
  checkPermission: () => PermissionStatus
  permissionChecked: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [orientationPermission, setOrientationPermissionState] = useState<PermissionStatus>("unknown")
  const [permissionChecked, setPermissionChecked] = useState(false)

  // iOS detection for permission handling
  const isIOS = typeof navigator !== "undefined" ? 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream : false

  useEffect(() => {
    // Load permission status on mount
    checkPermission()

    // For iOS, we also want to listen for deviceorientation events
    // This can help detect when permission might have changed
    if (isIOS) {
      const handleDeviceOrientation = () => {
        console.log("Device orientation event received in permission context");
        // If we got an event and permission was unknown, it means we have implicit permission
        if (orientationPermission === "unknown") {
          console.log("Received orientation event while permission unknown, setting to granted");
          setOrientationPermissionState("granted");
          storeOrientationPermission(true);
          setPermissionChecked(true);
        }
      };

      window.addEventListener("deviceorientation", handleDeviceOrientation, { once: true });
      
      return () => {
        window.removeEventListener("deviceorientation", handleDeviceOrientation);
      };
    }
  }, [orientationPermission, isIOS])

  const checkPermission = (): PermissionStatus => {
    console.log("Checking device orientation permission status");
    const storedPermission = getOrientationPermission()
    console.log("Retrieved stored permission:", storedPermission);

    let status: PermissionStatus = "unknown"

    if (storedPermission === "granted") {
      status = "granted"
      console.log("Permission status set to granted from storage");
    } else if (storedPermission === "denied") {
      status = "denied"
      console.log("Permission status set to denied from storage");
    } else if (typeof DeviceOrientationEvent === "undefined") {
      // Device doesn't support orientation
      status = "not_required"
      console.log("Device doesn't support orientation, setting to not_required");
    } else if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
      // Device supports orientation but doesn't require permission (Android)
      status = "not_required"
      storeOrientationPermission(true)
      console.log("Device supports orientation but doesn't require permission, setting to not_required");
    } else if (isIOS) {
      // iOS device that requires permission
      // We'll keep it as unknown until user interaction
      status = "unknown"
      console.log("iOS device that requires permission, keeping as unknown until user interaction");
      
      // Check session storage for any permissions granted in this session
      try {
        const sessionPermission = sessionStorage.getItem("ios_orientation_permission");
        if (sessionPermission === "granted") {
          status = "granted";
          storeOrientationPermission(true);
          console.log("Found granted permission in session storage for iOS");
        } else if (sessionPermission === "denied") {
          status = "denied";
          storeOrientationPermission(false);
          console.log("Found denied permission in session storage for iOS");
        }
      } catch (e) {
        console.error("Error checking session storage for iOS permission:", e);
      }
    }

    setOrientationPermissionState(status)
    setPermissionChecked(true)
    return status
  }

  const setOrientationPermission = (status: "granted" | "denied") => {
    storeOrientationPermission(status === "granted")
    setOrientationPermissionState(status)
    setPermissionChecked(true)
    
    // Also store in session storage for iOS
    if (isIOS) {
      try {
        sessionStorage.setItem("ios_orientation_permission", status);
        console.log("Stored iOS permission in session storage:", status);
      } catch (e) {
        console.error("Error storing iOS permission in session storage:", e);
      }
    }
  }

  return (
    <PermissionContext.Provider
      value={{
        orientationPermission,
        setOrientationPermission,
        checkPermission,
        permissionChecked,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider")
  }
  return context
}

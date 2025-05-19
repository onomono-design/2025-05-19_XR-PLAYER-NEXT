"use client"

import { useState, useEffect } from "react"

export type DeviceType = "desktop" | "mobile" | "unknown"

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("unknown")

  useEffect(() => {
    // Function to determine device type
    const detectDeviceType = () => {
      if (typeof window === "undefined") {
        return // Return early if running on server
      }

      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

      // Check for mobile devices
      if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
        setDeviceType("mobile")
      } else {
        setDeviceType("desktop")
      }
    }

    // Initial detection
    detectDeviceType()

    // Re-detect on resize (in case of orientation changes or browser resizing)
    const handleResize = () => {
      detectDeviceType()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  return deviceType
}

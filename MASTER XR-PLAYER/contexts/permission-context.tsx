"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getOrientationPermission, storeOrientationPermission } from "@/utils/permissions"

type PermissionStatus = "granted" | "denied" | "unknown" | "not_required"

type PermissionContextType = {
  orientationPermission: PermissionStatus
  setOrientationPermission: (status: "granted" | "denied") => void
  checkPermission: () => PermissionStatus
  permissionChecked: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [orientationPermission, setOrientationPermissionState] = useState<PermissionStatus>("unknown")
  const [permissionChecked, setPermissionChecked] = useState(false)

  useEffect(() => {
    // Load permission status on mount
    checkPermission()
  }, [])

  const checkPermission = (): PermissionStatus => {
    const storedPermission = getOrientationPermission()

    let status: PermissionStatus = "unknown"

    if (storedPermission === "granted") {
      status = "granted"
    } else if (storedPermission === "denied") {
      status = "denied"
    } else if (typeof DeviceOrientationEvent === "undefined") {
      // Device doesn't support orientation
      status = "not_required"
    } else if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
      // Device supports orientation but doesn't require permission
      status = "not_required"
      storeOrientationPermission(true)
    }

    setOrientationPermissionState(status)
    setPermissionChecked(true)
    return status
  }

  const setOrientationPermission = (status: "granted" | "denied") => {
    storeOrientationPermission(status === "granted")
    setOrientationPermissionState(status)
    setPermissionChecked(true)
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

/**
 * Stores the device orientation permission status in localStorage
 * @param granted Whether permission was granted
 */
export function storeOrientationPermission(granted: boolean) {
  try {
    localStorage.setItem("deviceOrientationPermission", granted ? "granted" : "denied")
  } catch (e) {
    console.error("Could not store permission status:", e)
  }
}

/**
 * Retrieves the device orientation permission status from localStorage
 * @returns 'granted', 'denied', or null if not set
 */
export function getOrientationPermission(): "granted" | "denied" | null {
  try {
    return localStorage.getItem("deviceOrientationPermission") as "granted" | "denied" | null
  } catch (e) {
    console.error("Could not retrieve permission status:", e)
    return null
  }
}

/**
 * Checks if the browser supports DeviceOrientationEvent
 * @returns true if supported, false otherwise
 */
export function supportsDeviceOrientation(): boolean {
  return typeof DeviceOrientationEvent !== "undefined"
}

/**
 * Checks if the browser requires permission for device orientation
 * @returns true if permission is required, false otherwise
 */
export function requiresOrientationPermission(): boolean {
  // Specifically check for iOS devices which require permission
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  return (
    isIOS &&
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as any).requestPermission === "function"
  )
}

/**
 * Requests device orientation permission
 * @returns Promise resolving to 'granted', 'denied', or 'not_required'
 */
export async function requestOrientationPermission(): Promise<"granted" | "denied" | "not_required"> {
  if (!supportsDeviceOrientation()) {
    console.log("Device orientation not supported")
    storeOrientationPermission(false)
    return "not_required"
  }

  if (requiresOrientationPermission()) {
    console.log("Device requires orientation permission, requesting...")
    
    try {
      // This must be called from a user gesture handler on iOS
      const permissionState = await (DeviceOrientationEvent as any).requestPermission()
      const granted = permissionState === "granted"
      console.log("Permission request result:", permissionState)
      storeOrientationPermission(granted)
      return granted ? "granted" : "denied"
    } catch (error) {
      console.error("Error requesting device orientation permission:", error)
      storeOrientationPermission(false)
      return "denied"
    }
  } else {
    // Permission is implicitly granted on devices that don't require explicit permission
    console.log("Device orientation permission not required, marking as granted")
    storeOrientationPermission(true)
    return "not_required"
  }
}

/**
 * Force clear any stored orientation permission
 * Useful for testing or when permissions need to be re-requested
 */
export function clearOrientationPermission(): void {
  try {
    localStorage.removeItem("deviceOrientationPermission")
    sessionStorage.removeItem("ios_orientation_permission")
    console.log("Cleared orientation permission from storage")
  } catch (e) {
    console.error("Could not clear permission status:", e)
  }
}

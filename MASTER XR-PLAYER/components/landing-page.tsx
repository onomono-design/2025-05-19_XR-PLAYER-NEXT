"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowRight, Laptop, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDeviceType } from "@/hooks/use-device-type"
import Image from "next/image"
import {
  requestOrientationPermission as requestOrientationPermissionUtil,
  getOrientationPermission as getOrientationPermissionUtil,
  requiresOrientationPermission as requiresOrientationPermissionUtil
} from "@/utils/permissions";
import { usePermission } from "@/contexts/permission-context"

export type LandingPageEvent =
  | { type: "DESKTOP_BEGIN_TOUR"; isTeaser: boolean }
  | { type: "MOBILE_BEGIN_TOUR"; isTeaser: boolean; permissionGranted: boolean }
  | { type: "PERMISSION_RESULT"; granted: boolean }

export interface LandingPageProps {
  /**
   * Main title/header text
   */
  title?: string
  /**
   * Subheader/description text
   */
  description?: string
  /**
   * Text for the CTA button when isTeaser is false
   * @default "Begin Tour"
   */
  tourButtonText?: string
  /**
   * Text for the CTA button when isTeaser is true
   * @default "Start Experience"
   */
  teaserButtonText?: string
  /**
   * Background image URL
   */
  backgroundImage?: string
  /**
   * Additional class names
   */
  className?: string
  /**
   * Whether this is a teaser version
   * @default false
   */
  isTeaser?: boolean
  /**
   * Callback for events from the landing page
   */
  onEvent?: (event: LandingPageEvent) => void
  /**
   * Whether to show the device icon
   * @default true
   */
  showDeviceIcon?: boolean
  /**
   * Custom icon for desktop devices (overrides default)
   */
  customDesktopIcon?: React.ReactNode
  /**
   * Custom icon for mobile devices (overrides default)
   */
  customMobileIcon?: React.ReactNode
  /**
   * Whether to show the logo at the top
   * @default true
   */
  showLogo?: boolean
  /**
   * Width of the logo in pixels
   * @default 200
   */
  logoWidth?: number
  /**
   * Force mobile version (for testing)
   * @default false
   */
  forceMobile?: boolean
  /**
   * Enable development mode with additional controls and info
   * @default false
   */
  devMode?: boolean
}

export function LandingPage({
  title = "Welcome",
  description = "Here's a little bit of information about what you're about to experience.",
  tourButtonText = "Begin Tour",
  teaserButtonText = "Start Experience",
  backgroundImage = "/abstract-art-1.png",
  className,
  isTeaser = false,
  onEvent,
  showDeviceIcon = true,
  customDesktopIcon,
  customMobileIcon,
  showLogo = true,
  logoWidth = 200,
  forceMobile = false,
  devMode = false,
}: LandingPageProps) {
  const detectedDeviceType = useDeviceType()
  const deviceType = forceMobile ? "mobile" : detectedDeviceType
  const { orientationPermission, setOrientationPermission, permissionChecked } = usePermission()
  const [isMounted, setIsMounted] = useState(false)
  const [dynamicLogoWidth, setDynamicLogoWidth] = useState(logoWidth)
  const [dynamicFontSizes, setDynamicFontSizes] = useState({
    title: "text-4xl md:text-6xl",
    description: "text-lg md:text-xl",
    button: "text-lg px-8 py-6",
  })
  
  // Explicitly detect iOS to ensure correct behavior
  const isIOS = typeof navigator !== "undefined" ? /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream : false

  // Set isMounted to true when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true)

    // Calculate dynamic sizes based on viewport
    if (typeof window !== "undefined") {
      const calculatedLogoWidth = Math.min(logoWidth, window.innerWidth * 0.6)
      setDynamicLogoWidth(calculatedLogoWidth)

      const calculatedFontSizes = {
        title: window.innerHeight < 700 ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl",
        description: window.innerHeight < 700 ? "text-base md:text-lg" : "text-lg md:text-xl",
        button: window.innerHeight < 700 ? "text-base px-6 py-4" : "text-lg px-8 py-6",
      }
      setDynamicFontSizes(calculatedFontSizes)
    }

    // Prevent scrolling when component mounts
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [logoWidth])

  const buttonText = isTeaser ? teaserButtonText : tourButtonText

  const requestPermissionAndProceed = async () => {
    console.log("Requesting permission and proceeding...");
    console.log("iOS device detected:", isIOS);
    console.log("Requires permission:", requiresOrientationPermissionUtil());
    
    let granted = false;
    
    // For iOS devices that require permission
    if (isIOS && requiresOrientationPermissionUtil()) {
      console.log("iOS device requires explicit permission, requesting now...");
      try {
        // Must be called directly from a user gesture handler
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        console.log("iOS permission result:", permissionState);
        
        granted = permissionState === "granted";
        
        // Store the result
        setOrientationPermission(granted ? "granted" : "denied");
        
        if (onEvent) {
          onEvent({ type: "PERMISSION_RESULT", granted });
        }
      } catch (error) {
        console.error("Error requesting iOS orientation permission:", error);
        setOrientationPermission("denied");
        granted = false;
        
        if (onEvent) {
          onEvent({ type: "PERMISSION_RESULT", granted: false });
        }
      }
    } else {
      // Android or other devices that don't require explicit permission
      console.log("Device doesn't require explicit permission or is not iOS");
      const permissionResult = await requestOrientationPermissionUtil();
      granted = permissionResult === "granted" || permissionResult === "not_required";
      setOrientationPermission(granted ? "granted" : "denied");
      
      if (onEvent) {
        onEvent({ type: "PERMISSION_RESULT", granted });
      }
    }

    // Proceed with the tour regardless of permission result
    // The XR component will handle limitations if permission was denied
    if (onEvent) {
      onEvent({
        type: "MOBILE_BEGIN_TOUR",
        isTeaser,
        permissionGranted: granted,
      });
    }
  };

  const handleButtonClick = () => {
    if (deviceType === "mobile") {
      // For iOS devices, we always need to request permission on button click
      // as it must be triggered by a user interaction
      if (isIOS && requiresOrientationPermissionUtil()) {
        console.log("iOS device detected, requesting permission directly from click handler");
        requestPermissionAndProceed();
      } else {
        // For non-iOS devices, check if we already have permission
        const currentPermission = getOrientationPermissionUtil();
        
        if (currentPermission === "granted" || (!requiresOrientationPermissionUtil() && currentPermission !== "denied")) {
          // Already granted or not required and not explicitly denied
          console.log("Permission already granted or not required");
          if (onEvent) {
            onEvent({
              type: "MOBILE_BEGIN_TOUR",
              isTeaser,
              permissionGranted: true,
            });
          }
        } else if (currentPermission === "denied") {
          // Permission was explicitly denied before
          console.log("Permission was previously denied");
          if (onEvent) {
            onEvent({
              type: "MOBILE_BEGIN_TOUR",
              isTeaser,
              permissionGranted: false,
            });
          }
        } else {
          // Permission not yet asked, request it
          console.log("Permission not yet determined, requesting");
          requestPermissionAndProceed();
        }
      }
    } else if (onEvent) { // Desktop
      onEvent({ type: "DESKTOP_BEGIN_TOUR", isTeaser });
    }
  };

  const renderDeviceIcon = () => {
    if (!showDeviceIcon) return null

    if (deviceType === "desktop") {
      return customDesktopIcon || <Laptop className="w-12 h-12 text-white/80" />
    } else if (deviceType === "mobile") {
      return customMobileIcon || <Smartphone className="w-12 h-12 text-white/80" />
    }

    return null
  }

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return null // Or a simple loading state
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-between w-full h-screen bg-cover bg-center text-white p-6 font-figtree overflow-hidden",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
      }}
    >
      {/* Logo section */}
      {showLogo && (
        <div className="w-full flex justify-center mt-4 md:mt-8">
          <div className="relative" style={{ width: `${dynamicLogoWidth}px`, height: `${dynamicLogoWidth * 0.67}px` }}>
            <Image
              src="/cmm-logo-rectangle.svg"
              alt="CMM Logo"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="w-full max-w-4xl mx-auto pt-4 md:pt-8 text-center">
        <h1 className={`${dynamicFontSizes.title} font-bold mb-4 md:mb-6`}>{title}</h1>
        <p className={`${dynamicFontSizes.description} text-gray-200 max-w-xl mx-auto px-4 md:px-6 leading-relaxed`}>
          {description}
        </p>
      </div>

      {/* Device icon section */}
      <div className="flex-grow flex items-center justify-center">{renderDeviceIcon()}</div>

      {/* Button section */}
      <div className="w-full max-w-4xl mx-auto pb-8 md:pb-16 flex justify-center">
        <Button
          size="lg"
          className={`${dynamicFontSizes.button} rounded-full bg-white text-black hover:bg-white/90 transition-all animate-pulse-slow`}
          onClick={handleButtonClick}
        >
          {buttonText} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

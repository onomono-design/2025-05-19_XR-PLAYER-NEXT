"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface OutroCTAProps {
  /**
   * The URL to navigate to when clicked (backlink)
   * @default "https://apple.com"
   */
  outroCTA_backlink?: string
  /**
   * The text to display
   * @default "click here"
   */
  outroCTA_text?: string
  /**
   * Additional class name for the container
   */
  className?: string
  /**
   * Width of the logo in pixels
   * @default 200
   */
  logoWidth?: number
  /**
   * Additional class name for the button
   */
  buttonClassName?: string
  /**
   * Callback when the CTA is clicked
   */
  onClick?: () => void
  /**
   * Whether the CTA is visible
   * @default true
   */
  isVisible?: boolean
  /**
   * Callback when the CTA is closed by clicking outside
   */
  onClose?: () => void
  /**
   * Time in seconds after which the CTA should appear
   * Only used if a timer is started externally
   */
  outroCTA_timeIn_seconds?: number
}

export function OutroCTA({
  outroCTA_backlink = "https://apple.com",
  outroCTA_text = "click here",
  className,
  logoWidth = 200,
  buttonClassName,
  onClick,
  isVisible: externalIsVisible,
  onClose,
  outroCTA_timeIn_seconds,
}: OutroCTAProps) {
  // Use internal state if external control is not provided
  const [internalIsVisible, setInternalIsVisible] = useState(false)
  const isVisible = externalIsVisible !== undefined ? externalIsVisible : internalIsVisible

  const [isHovering, setIsHovering] = useState(false)

  // Listen for "show CTA" messages from other components
  useEffect(() => {
    const handleShowCTA = () => {
      setInternalIsVisible(true)
    }

    // Listen for custom event
    window.addEventListener("showOutroCTA", handleShowCTA)

    // Clean up
    return () => {
      window.removeEventListener("showOutroCTA", handleShowCTA)
    }
  }, [])

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on the background (not on children)
    if (e.target === e.currentTarget) {
      if (onClose) {
        onClose()
      } else {
        setInternalIsVisible(false)
      }
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    }
    // Don't stop propagation - let the link navigate normally
  }

  // If not visible, don't render anything
  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn("fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50", className)}
      onClick={handleBackgroundClick}
    >
      <Link
        href={outroCTA_backlink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex flex-col items-center gap-4 transition-transform duration-300 ease-in-out",
          "hover:scale-105 focus:scale-105 focus:outline-none",
          isHovering ? "scale-105" : "scale-100",
          buttonClassName,
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleLinkClick}
      >
        <div
          className="relative transition-all duration-300 overflow-visible"
          style={{
            width: `${logoWidth}px`,
            height: "auto",
            transform: isHovering ? "translateY(-5px)" : "translateY(0)",
          }}
        >
          <Image
            src="/cmm-logo-rectangle.svg"
            alt="CMM Logo"
            width={logoWidth}
            height={logoWidth * 0.67} // Approximate aspect ratio
            className={cn(
              "rounded-md transition-all duration-300 object-contain",
              isHovering
                ? "filter drop-shadow-[0_10px_25px_rgba(255,255,255,0.2)]"
                : "filter drop-shadow-[0_5px_15px_rgba(255,255,255,0.1)]",
            )}
            priority
          />
        </div>
        <span
          className={cn(
            "text-white text-xl font-medium tracking-wide",
            "transition-all duration-300",
            isHovering ? "opacity-100" : "opacity-80",
          )}
        >
          {outroCTA_text}
        </span>
      </Link>
    </div>
  )
}

// Utility function to show the OutroCTA from any component
export function showOutroCTA() {
  // Dispatch a custom event that the OutroCTA component listens for
  window.dispatchEvent(new Event("showOutroCTA"))
}

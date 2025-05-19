"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface LoadingModalProps {
  /**
   * Whether the loading modal is visible
   * @default false
   */
  isOpen?: boolean
  /**
   * Text to display below the spinner
   * @default "Loading"
   */
  loadingText?: string
  /**
   * Size of the modal square in pixels
   * @default 200
   */
  size?: number
  /**
   * Color of the spinner
   * @default "white"
   */
  spinnerColor?: string
  /**
   * Color of the text
   * @default "white"
   */
  textColor?: string
  /**
   * Additional class name for the modal
   */
  className?: string
  /**
   * Callback when the modal is closed by clicking outside
   */
  onClose?: () => void
  /**
   * Whether to close the modal when clicking outside
   * @default false
   */
  closeOnOutsideClick?: boolean
  /**
   * Whether to automatically close the modal after a certain time
   * @default false
   */
  autoClose?: boolean
  /**
   * Time in milliseconds after which the modal should close automatically
   * @default 3000
   */
  autoCloseTime?: number
}

/**
 * LoadingModal - A standalone loading indicator component
 *
 * Usage example:
 * \`\`\`tsx
 * import { LoadingModal } from "@/components/loading-modal"
 *
 * function MyComponent() {
 *   const [isLoading, setIsLoading] = useState(false)
 *
 *   const handleAction = async () => {
 *     setIsLoading(true)
 *     try {
 *       await someAsyncOperation()
 *     } finally {
 *       setIsLoading(false)
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleAction}>Perform Action</button>
 *       <LoadingModal isOpen={isLoading} />
 *     </div>
 *   )
 * }
 * \`\`\`
 */
export function LoadingModal({
  isOpen = false,
  loadingText = "Loading",
  size = 200,
  spinnerColor = "white",
  textColor = "white",
  className,
  onClose,
  closeOnOutsideClick = false,
  autoClose = false,
  autoCloseTime = 3000,
}: LoadingModalProps) {
  const [visible, setVisible] = useState(isOpen)

  // Sync internal state with prop
  useEffect(() => {
    setVisible(isOpen)
  }, [isOpen])

  // Auto-close functionality
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, autoCloseTime)

      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseTime, visible, onClose])

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  if (!visible) return null

  return (
    <div
      className={cn("fixed inset-0 flex items-center justify-center bg-black/50 z-50", className)}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-black/80 rounded-xl flex flex-col items-center justify-center shadow-lg p-3 drop-shadow-xl"
        style={{ width: "100px", height: "100px" }}
      >
        {/* Spinner */}
        <div className="relative">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin drop-shadow"
            style={{ borderColor: `transparent transparent ${spinnerColor} ${spinnerColor}` }}
          ></div>
        </div>

        {/* Loading text */}
        <div className="mt-2 text-xs font-medium" style={{ color: textColor }}>
          {loadingText}
        </div>
      </div>
    </div>
  )
}

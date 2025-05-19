"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface ImageSliderProps {
  /**
   * Array of image sources to display
   */
  images: string[]
  /**
   * Optional array of timecodes (in seconds) for when to transition to the next slide
   * If provided, will trigger transitions at specific times
   * If not provided, will cycle through images every 30 seconds
   */
  timecodes?: number[]
  /**
   * Alt text for images
   */
  alt?: string
  /**
   * Additional class names
   */
  className?: string
  /**
   * Whether to enable autoplay
   * @default true
   */
  autoplay?: boolean
  /**
   * Default interval for autoplay in seconds (when no timecodes provided)
   * @default 30
   */
  defaultInterval?: number
  /**
   * Callback when slide changes
   */
  onSlideChange?: (index: number) => void
  /**
   * Enable development mode with additional controls and info
   * @default false
   */
  devMode?: boolean
  /**
   * Allow vertical cropping when container height is constrained
   * @default false
   */
  allowVerticalCrop?: boolean
  /**
   * Fixed aspect ratio to maintain (width/height)
   * @default 1 (square)
   */
  aspectRatio?: number
}

export function ImageSlider({
  images,
  timecodes,
  alt = "Slider image",
  className,
  autoplay = true,
  defaultInterval = 30,
  onSlideChange,
  devMode = false,
  allowVerticalCrop = false,
  aspectRatio = 1,
}: ImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get container width for calculations
  const getContainerWidth = () => {
    return containerRef.current?.offsetWidth || 0
  }

  // Calculate the transform value for the slider
  const getTransformValue = () => {
    if (isDragging) {
      // When dragging, move based on drag distance
      return `translateX(calc(${-activeIndex * 100}% + ${currentX - startX}px))`
    }
    // Normal position based on active index
    return `translateX(${-activeIndex * 100}%)`
  }

  // Handle navigation
  const goToSlide = (index: number) => {
    // Ensure index is within bounds
    const newIndex = Math.max(0, Math.min(index, images.length - 1))

    // Only update if the index is changing
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)

      // Call the onSlideChange callback if provided
      if (onSlideChange) {
        onSlideChange(newIndex)
      }

      // Reset timer when manually changing slides
      resetTimer()
    }
  }

  const goToNext = () => {
    if (images.length <= 1) return
    goToSlide((activeIndex + 1) % images.length)
  }

  const goToPrevious = () => {
    if (images.length <= 1) return
    goToSlide((activeIndex - 1 + images.length) % images.length)
  }

  // Timer functions
  const resetTimer = () => {
    // Clear existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Don't set new timer if autoplay is disabled or only one image
    if (!autoplay || images.length <= 1) {
      setTimeRemaining(null)
      return
    }

    // Determine the interval for the current slide
    let interval = defaultInterval

    // If timecodes are provided, use them
    if (timecodes && timecodes.length > activeIndex) {
      interval = timecodes[activeIndex]
    }

    // Set the initial time remaining
    setTimeRemaining(interval)

    // Set up the countdown interval
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return null
        return prev - 1
      })
    }, 1000)

    // Set up the timer to advance to the next slide
    timerRef.current = setTimeout(() => {
      goToNext()
    }, interval * 1000)
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setCurrentX(e.clientX)
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    const dragDistance = currentX - startX
    const containerWidth = getContainerWidth()

    // Determine if we should navigate based on drag distance
    if (Math.abs(dragDistance) > containerWidth * 0.2) {
      if (dragDistance > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    }

    // Reset drag state
    setIsDragging(false)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)

    // Prevent page scrolling when swiping horizontally
    if (Math.abs(currentX - startX) > 10) {
      e.preventDefault()
    }
  }

  // Initialize timer when component mounts or when activeIndex changes
  useEffect(() => {
    resetTimer()

    // Cleanup function
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeIndex, autoplay, images.length, timecodes])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return

      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeIndex, images.length])

  // Global event listeners for drag end
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd()
      }
    }

    const handleTouchEnd = () => {
      if (isDragging) {
        handleDragEnd()
      }
    }

    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, currentX, startX, activeIndex])

  // If no images or only one image, render a simple image
  if (!images.length) {
    return null
  }

  // Determine the appropriate class for the container based on props
  const containerClass = cn(
    "relative w-full overflow-hidden rounded-xl shadow-lg",
    allowVerticalCrop ? "max-w-[min(100vw,90vh)] h-auto" : "max-w-[min(100vw,90vh)] aspect-square",
    className,
  )

  // Determine the appropriate style for the container based on props
  const containerStyle = allowVerticalCrop
    ? {
        maxHeight: "calc(100vh - 16rem)", // Reserve space for other components
        aspectRatio: aspectRatio.toString(),
      }
    : {}

  if (images.length === 1) {
    return (
      <div className={containerClass} style={containerStyle}>
        <Image
          src={images[0] || "/placeholder.svg"}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={containerStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Timer indicator (if autoplay is enabled) */}
      {autoplay && timeRemaining !== null && (
        <div className="absolute top-4 right-4 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {timeRemaining}s
        </div>
      )}

      {/* Main slider container */}
      <div
        className={cn(
          "flex w-full h-full transition-transform duration-300",
          isDragging ? "transition-none" : "ease-out",
        )}
        style={{ transform: getTransformValue() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseLeave={() => isDragging && handleDragEnd()}
      >
        {/* Render all images in a row */}
        {images.map((src, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full relative">
            <Image
              src={src || "/placeholder.svg"}
              alt={`${alt} ${index + 1}`}
              fill
              priority
              draggable="false"
              className="object-cover pointer-events-none"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 50vw"
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white z-10",
          "transition-opacity duration-300 ease-in-out",
          isHovering || isDragging ? "opacity-100" : "opacity-0",
        )}
        onClick={goToPrevious}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white z-10",
          "transition-opacity duration-300 ease-in-out",
          isHovering || isDragging ? "opacity-100" : "opacity-0",
        )}
        onClick={goToNext}
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              activeIndex === index ? "bg-white w-4" : "bg-white/50",
            )}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

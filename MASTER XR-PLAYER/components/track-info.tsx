"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Marquee from "react-fast-marquee"
import { CuboidIcon as Cube } from "lucide-react"

export interface TrackInfoProps {
  /**
   * The order/number of the current chapter
   */
  chapterOrder: number
  /**
   * The name of the current chapter
   */
  chapterName: string
  /**
   * The name of the tour
   */
  tourName: string
  /**
   * Additional class name for the container
   */
  className?: string
  /**
   * Whether to show the tour name
   * @default true
   */
  showTourName?: boolean
  /**
   * Whether to show the chapter order
   * @default true
   */
  showChapterOrder?: boolean
  /**
   * Delay in seconds before scrolling starts initially
   * @default 10
   */
  initialDelay?: number
  /**
   * Delay in seconds after each loop completes
   * @default 10
   */
  loopDelay?: number
  /**
   * Speed of the marquee in pixels per second
   * @default 30
   */
  speed?: number
  /**
   * Whether to pause the marquee on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Whether to pause the marquee on click
   * @default false
   */
  pauseOnClick?: boolean
  /**
   * Whether to show a gradient on the edges
   * @default true
   */
  gradient?: boolean
  /**
   * Width of the gradient in pixels
   * @default 60
   */
  gradientWidth?: number
  /**
   * Whether to use a card container
   * @default true
   */
  withCard?: boolean
  /**
   * Whether this track has XR content. When true, an "XR MODE" button will be displayed.
   * @default false
   */
  isXR?: boolean
  /**
   * Callback when the XR mode button is clicked. Only triggered when isXR is true.
   * The parent component should handle the actual XR mode activation logic.
   */
  onXRModeClick?: () => void
}

/**
 * TrackInfo - A component for displaying chapter and tour information with automatic scrolling for long text
 *
 * @example
 * \`\`\`tsx
 * <TrackInfo
 *   chapterOrder={1}
 *   chapterName="Introduction to the Museum"
 *   tourName="Art History Tour"
 * />
 * \`\`\`
 */
export function TrackInfo({
  chapterOrder,
  chapterName,
  tourName,
  className,
  showTourName = true,
  showChapterOrder = true,
  initialDelay = 10,
  loopDelay = 10,
  speed = 30,
  pauseOnHover = false,
  pauseOnClick = false,
  gradient = true,
  gradientWidth = 60,
  withCard = true,
  isXR = false,
  onXRModeClick,
}: TrackInfoProps) {
  const textContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isMarqueeActive, setIsMarqueeActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const loopCountRef = useRef(0)
  const lastLoopTimeRef = useRef(0)

  // Approximate width of the XR button including margins
  const XR_BUTTON_WIDTH = 130

  // Check if text is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (textContainerRef.current && contentRef.current) {
        const container = textContainerRef.current
        const content = contentRef.current

        // Get the actual content width (text width)
        const contentWidth = content.scrollWidth

        // Get the available width for the text
        const availableWidth = container.clientWidth

        // Text is overflowing if its width exceeds the available width
        const isTextOverflowing = contentWidth > availableWidth

        setIsOverflowing(isTextOverflowing)
      }
    }

    // Check on mount and when content changes
    checkOverflow()

    // Also check on window resize
    window.addEventListener("resize", checkOverflow)
    return () => window.removeEventListener("resize", checkOverflow)
  }, [chapterName, tourName, showTourName, showChapterOrder, isXR])

  // Start marquee after initial delay if text is overflowing
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isOverflowing && !isMarqueeActive) {
      // Use the initialDelay prop (defaults to 10 seconds)
      timer = setTimeout(() => {
        setIsMarqueeActive(true)
      }, initialDelay * 1000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOverflowing, isMarqueeActive, initialDelay])

  // Handle loop completion
  const handleLoopComplete = () => {
    const now = Date.now()
    loopCountRef.current += 1

    // Only pause if this isn't the first loop or if enough time has passed since the last pause
    if (loopCountRef.current > 1 && now - lastLoopTimeRef.current > loopDelay * 500) {
      setIsPaused(true)
      lastLoopTimeRef.current = now

      // Resume after loop delay
      setTimeout(() => {
        setIsPaused(false)
      }, loopDelay * 1000)
    }
  }

  // Create the text content
  const textContent = (
    <>
      <span className="font-medium leading-none tracking-tight">{chapterName}</span>
      {showTourName && (
        <>
          <span className="text-muted-foreground mx-1">•</span>
          <span className="text-muted-foreground opacity-80">{tourName}</span>
        </>
      )}
    </>
  )

  // Handle XR button click
  const handleXRButtonClick = () => {
    if (onXRModeClick) {
      // Delegate XR mode activation to the parent component
      onXRModeClick()
    }
  }

  const content = (
    <div className="flex items-center gap-3 relative">
      {/* Chapter order badge - fixed on the left */}
      {showChapterOrder && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {chapterOrder}
        </div>
      )}

      {/* Main content container with relative positioning */}
      <div className="flex-1 relative overflow-hidden">
        {/* Text container with proper width adjustment for XR button */}
        <div
          ref={textContainerRef}
          className="overflow-hidden whitespace-nowrap"
          style={isXR ? { width: `calc(100% - ${XR_BUTTON_WIDTH}px)` } : {}}
        >
          {isOverflowing && isMarqueeActive ? (
            <div className="relative">
              {isPaused ? (
                <div ref={contentRef} className="inline-block">
                  {textContent}
                </div>
              ) : (
                <Marquee
                  speed={speed}
                  delay={0}
                  gradient={gradient}
                  gradientColor={withCard ? "var(--card)" : "var(--background)"}
                  gradientWidth={gradientWidth}
                  pauseOnHover={pauseOnHover}
                  pauseOnClick={pauseOnClick}
                  onCycleComplete={handleLoopComplete}
                >
                  <div ref={contentRef} className="pr-8">
                    {textContent}
                  </div>
                </Marquee>
              )}
            </div>
          ) : (
            <div ref={contentRef} className="inline-block">
              {textContent}
            </div>
          )}
        </div>

        {/* XR Mode button - absolutely positioned with high z-index */}
        {isXR && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end z-30">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-600 hover:text-white rounded-md"
              onClick={handleXRButtonClick}
            >
              <Cube className="h-4 w-4 mr-1" />
              XR MODE
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  if (withCard) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4 relative">{content}</CardContent>
      </Card>
    )
  }

  return <div className={cn("p-4 relative", className)}>{content}</div>
}

"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

export interface ThumblessSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /**
   * Size of the slider track
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color of the slider track
   * @default "default"
   */
  color?: "default" | "primary" | "secondary" | "foreground" | "success" | "warning" | "danger"
  /**
   * Whether to hide the thumb
   * @default true
   */
  hideThumb?: boolean
}

const ThumblessSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, ThumblessSliderProps>(
  ({ className, size = "md", color = "default", hideThumb = true, ...props }, ref) => {
    // Map size to height
    const sizeClasses = {
      sm: "h-1",
      md: "h-3", // Increased from h-2 to h-3
      lg: "h-4", // Increased from h-3 to h-4
    }

    // Map color to background color
    const colorClasses = {
      default: "bg-secondary/60",
      primary: "bg-white",
      secondary: "bg-white/80",
      foreground: "bg-foreground",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      danger: "bg-red-500",
    }

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative w-full grow overflow-hidden rounded-full bg-secondary/20 cursor-pointer",
            sizeClasses[size],
          )}
        >
          <SliderPrimitive.Range className={cn("absolute h-full", colorClasses[color])} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            hideThumb
              ? "opacity-0 w-8 h-8 rounded-full bg-background border-2 border-primary shadow cursor-grab active:cursor-grabbing"
              : "block h-8 w-8 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing",
          )}
        />
      </SliderPrimitive.Root>
    )
  },
)
ThumblessSlider.displayName = "ThumblessSlider"

export { ThumblessSlider }

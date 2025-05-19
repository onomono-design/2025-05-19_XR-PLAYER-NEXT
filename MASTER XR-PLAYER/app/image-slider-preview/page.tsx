"use client"

import { useState } from "react"
import { ImageSlider } from "@/components/image-slider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Sample image sets
const allImages = [
  "/colorful-abstract-album-cover.png",
  "/abstract-soundscape.png",
  "/abstract-art-1.png",
  "/abstract-art-2.png",
  "/abstract-art-3.png",
  "/colorful-music-visualization.png",
  "/abstract-album-art.png",
  "/colorful-abstract.png",
]

export default function ImageSliderPreview() {
  // Configuration state
  const [imageCount, setImageCount] = useState(4)
  const [useTimecodes, setUseTimecodes] = useState(true)
  const [autoplay, setAutoplay] = useState(true)
  const [interval, setInterval] = useState(10)
  const [devMode, setDevMode] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Generate timecodes based on the interval
  const timecodes = Array(imageCount).fill(interval)

  // Get subset of images based on imageCount
  const images = allImages.slice(0, imageCount)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Image Slider Preview</h1>
          <p className="text-muted-foreground">
            A versatile image slider component with timed transitions and touch/mouse navigation
          </p>
        </div>

        {/* Main slider preview */}
        <div className="w-full flex justify-center">
          <ImageSlider
            images={images}
            timecodes={useTimecodes ? timecodes : undefined}
            alt="Demo image"
            autoplay={autoplay}
            defaultInterval={interval}
            onSlideChange={setCurrentSlide}
            devMode={devMode}
          />
        </div>

        {/* Current slide indicator */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Current slide: {currentSlide + 1} of {images.length}
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Customize the slider behavior and appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image count control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="image-count">Number of Images: {imageCount}</Label>
              </div>
              <Slider
                id="image-count"
                min={1}
                max={allImages.length}
                step={1}
                value={[imageCount]}
                onValueChange={(value) => setImageCount(value[0])}
              />
            </div>

            {/* Interval control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="interval">Transition Interval: {interval}s</Label>
              </div>
              <Slider
                id="interval"
                min={3}
                max={30}
                step={1}
                value={[interval]}
                onValueChange={(value) => setInterval(value[0])}
              />
            </div>

            {/* Toggle controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="use-timecodes" checked={useTimecodes} onCheckedChange={setUseTimecodes} />
                <Label htmlFor="use-timecodes">Use Timecodes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autoplay" checked={autoplay} onCheckedChange={setAutoplay} />
                <Label htmlFor="autoplay">Autoplay</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="dev-mode" checked={devMode} onCheckedChange={setDevMode} />
                <Label htmlFor="dev-mode">Development Mode</Label>
              </div>
            </div>

            {/* Manual navigation */}
            <div className="flex justify-center space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const newIndex = (currentSlide - 1 + images.length) % images.length
                  setCurrentSlide(newIndex)
                }}
                disabled={images.length <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const newIndex = (currentSlide + 1) % images.length
                  setCurrentSlide(newIndex)
                }}
                disabled={images.length <= 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Code example */}
        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
            <CardDescription>Copy this code to use the slider with current settings</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              {`import { ImageSlider } from "@/components/image-slider"

<ImageSlider
  images={[${images.map((img) => `"${img}"`).join(", ")}]}
  ${useTimecodes ? `timecodes={[${timecodes.join(", ")}]}` : ""}
  ${!autoplay ? "autoplay={false}" : ""}
  ${interval !== 30 ? `defaultInterval={${interval}}` : ""}
  alt="My slider images"
/>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

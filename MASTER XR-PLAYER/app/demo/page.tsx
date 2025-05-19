"use client"

import { useState } from "react"
import { AudioController } from "@/components/audio-controller"
import { ThumblessSlider } from "@/components/ui/thumbless-slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DemoPage() {
  const [showThumb, setShowThumb] = useState(false)
  const [sliderColor, setSliderColor] = useState<"foreground" | "primary" | "secondary">("foreground")
  const [sliderValue, setSliderValue] = useState(20)

  return (
    <div className="container py-10 space-y-10">
      <h1 className="text-3xl font-bold">Thumbless Slider Demo</h1>

      <Tabs defaultValue="audio-player">
        <TabsList>
          <TabsTrigger value="audio-player">Audio Player</TabsTrigger>
          <TabsTrigger value="standalone">Standalone Slider</TabsTrigger>
        </TabsList>

        <TabsContent value="audio-player" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Player with Thumbless Slider</CardTitle>
              <CardDescription>A complete audio player using the thumbless slider for progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AudioController
                src="https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"
                isXR={false}
                hasError={false}
              />

              <div className="flex items-center space-x-2">
                <Switch id="show-thumb" checked={showThumb} onCheckedChange={setShowThumb} />
                <Label htmlFor="show-thumb">Show Thumb</Label>
              </div>

              <div className="space-y-2">
                <Label>Slider Color</Label>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded ${sliderColor === "foreground" ? "bg-foreground text-background" : "bg-muted"}`}
                    onClick={() => setSliderColor("foreground")}
                  >
                    Foreground
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${sliderColor === "primary" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    onClick={() => setSliderColor("primary")}
                  >
                    Primary
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${sliderColor === "secondary" ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}
                    onClick={() => setSliderColor("secondary")}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standalone" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Standalone Thumbless Slider</CardTitle>
              <CardDescription>The slider component by itself, similar to HeroUI's implementation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="py-4">
                <ThumblessSlider
                  aria-label="Player progress"
                  className="max-w-md"
                  color={sliderColor}
                  value={[sliderValue]}
                  onValueChange={(value) => setSliderValue(value[0])}
                  hideThumb={!showThumb}
                />
                <p className="mt-2 text-sm text-muted-foreground">Value: {sliderValue}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-thumb-standalone" checked={showThumb} onCheckedChange={setShowThumb} />
                <Label htmlFor="show-thumb-standalone">Show Thumb</Label>
              </div>

              <div className="space-y-2">
                <Label>Slider Color</Label>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded ${sliderColor === "foreground" ? "bg-foreground text-background" : "bg-muted"}`}
                    onClick={() => setSliderColor("foreground")}
                  >
                    Foreground
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${sliderColor === "primary" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    onClick={() => setSliderColor("primary")}
                  >
                    Primary
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${sliderColor === "secondary" ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}
                    onClick={() => setSliderColor("secondary")}
                  >
                    Secondary
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {`import { ThumblessSlider } from "@/components/ui/thumbless-slider";

export default function App() {
  return (
    <ThumblessSlider
      aria-label="Player progress"
      className="max-w-md"
      color="${sliderColor}"
      defaultValue={20}
      hideThumb={${!showThumb}}
    />
  );
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

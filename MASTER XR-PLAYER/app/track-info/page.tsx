"use client"

import { useState } from "react"
import { TrackInfo } from "@/components/track-info"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { CuboidIcon } from "lucide-react"

export default function TrackInfoDemo() {
  // Track info state
  const [chapterOrder, setChapterOrder] = useState(1)
  const [chapterName, setChapterName] = useState("Introduction to the Museum")
  const [tourName, setTourName] = useState("Art History Tour")

  // Display options
  const [showTourName, setShowTourName] = useState(true)
  const [showChapterOrder, setShowChapterOrder] = useState(true)

  // XR options
  const [isXR, setIsXR] = useState(false)

  // Scrolling options
  const [initialDelay, setInitialDelay] = useState(10)
  const [loopDelay, setLoopDelay] = useState(10)
  const [speed, setSpeed] = useState(30)
  const [pauseOnHover, setPauseOnHover] = useState(false)
  const [pauseOnClick, setPauseOnClick] = useState(false)
  const [gradient, setGradient] = useState(true)
  const [gradientWidth, setGradientWidth] = useState(60)

  // Handle XR mode button click
  const handleXRModeClick = () => {
    toast({
      title: "XR Mode Activated",
      description: "This is a demo. In a real application, this would launch XR mode.",
    })
  }

  // Preset examples
  const presets = [
    {
      name: "Art Tour",
      tourName: "Art History Tour",
      chapters: [
        { order: 1, name: "Introduction to the Museum", isXR: false },
        { order: 2, name: "Renaissance Masterpieces", isXR: true },
        { order: 3, name: "Modern Art Movement", isXR: false },
      ],
    },
    {
      name: "City Tour",
      tourName: "Downtown Walking Tour",
      chapters: [
        { order: 1, name: "Historic District", isXR: true },
        { order: 2, name: "Financial Center", isXR: false },
        { order: 3, name: "Waterfront Park", isXR: true },
      ],
    },
    {
      name: "Nature Tour",
      tourName: "National Park Explorer",
      chapters: [
        { order: 1, name: "Visitor Center", isXR: false },
        { order: 2, name: "Scenic Overlook", isXR: true },
        { order: 3, name: "Wildlife Habitat", isXR: false },
      ],
    },
    {
      name: "Long Text",
      tourName:
        "This is an extremely long tour name that will definitely overflow and demonstrate the scrolling functionality",
      chapters: [
        {
          order: 1,
          name: "This is a very long chapter name that will definitely overflow the container and demonstrate the scrolling functionality",
          isXR: true,
        },
        {
          order: 2,
          name: "Another very long chapter name to test the scrolling behavior of the component when text exceeds the available width",
          isXR: false,
        },
        {
          order: 3,
          name: "One more extremely long chapter name that will surely overflow and show how the scrolling animation works",
          isXR: true,
        },
      ],
    },
  ]

  // Apply preset
  const applyPreset = (presetIndex: number, chapterIndex: number) => {
    const preset = presets[presetIndex]
    const chapter = preset.chapters[chapterIndex]

    setTourName(preset.tourName)
    setChapterOrder(chapter.order)
    setChapterName(chapter.name)
    setIsXR(chapter.isXR)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Track Info Component</h1>
          <p className="text-muted-foreground">A configurable component for displaying tour and chapter information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Configuration panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Customize the track info component</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tour name input */}
                <div className="space-y-2">
                  <Label htmlFor="tour-name">Tour Name</Label>
                  <Input
                    id="tour-name"
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                    placeholder="Enter tour name"
                  />
                </div>

                {/* Chapter order slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chapter-order">Chapter Order: {chapterOrder}</Label>
                  </div>
                  <Slider
                    id="chapter-order"
                    min={1}
                    max={10}
                    step={1}
                    value={[chapterOrder]}
                    onValueChange={(value) => setChapterOrder(value[0])}
                  />
                </div>

                {/* Chapter name input */}
                <div className="space-y-2">
                  <Label htmlFor="chapter-name">Chapter Name</Label>
                  <Input
                    id="chapter-name"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="Enter chapter name"
                  />
                </div>

                {/* Display options */}
                <div className="space-y-4 pt-2 border-t">
                  <h3 className="text-sm font-medium pt-2">Display Options</h3>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tour-name">Show Tour Name</Label>
                    <Switch id="show-tour-name" checked={showTourName} onCheckedChange={setShowTourName} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-chapter-order">Show Chapter Order</Label>
                    <Switch id="show-chapter-order" checked={showChapterOrder} onCheckedChange={setShowChapterOrder} />
                  </div>

                  {/* XR Mode option */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="is-xr">XR Content</Label>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Shows XR Button</div>
                    </div>
                    <Switch id="is-xr" checked={isXR} onCheckedChange={setIsXR} />
                  </div>
                </div>

                {/* Scrolling options */}
                <div className="space-y-4 pt-2 border-t">
                  <h3 className="text-sm font-medium pt-2">Marquee Options</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="initial-delay">Initial Delay: {initialDelay}s</Label>
                    </div>
                    <Slider
                      id="initial-delay"
                      min={1}
                      max={20}
                      step={1}
                      value={[initialDelay]}
                      onValueChange={(value) => setInitialDelay(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="loop-delay">Loop Pause Delay: {loopDelay}s</Label>
                    </div>
                    <Slider
                      id="loop-delay"
                      min={1}
                      max={20}
                      step={1}
                      value={[loopDelay]}
                      onValueChange={(value) => setLoopDelay(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="speed">Speed: {speed} px/s</Label>
                    </div>
                    <Slider
                      id="speed"
                      min={10}
                      max={100}
                      step={5}
                      value={[speed]}
                      onValueChange={(value) => setSpeed(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gradient-width">Gradient Width: {gradientWidth}px</Label>
                    </div>
                    <Slider
                      id="gradient-width"
                      min={0}
                      max={100}
                      step={5}
                      value={[gradientWidth]}
                      onValueChange={(value) => setGradientWidth(value[0])}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="gradient" checked={gradient} onCheckedChange={setGradient} />
                      <Label htmlFor="gradient">Gradient</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="pause-on-hover" checked={pauseOnHover} onCheckedChange={setPauseOnHover} />
                      <Label htmlFor="pause-on-hover">Pause on Hover</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="pause-on-click" checked={pauseOnClick} onCheckedChange={setPauseOnClick} />
                      <Label htmlFor="pause-on-click">Pause on Click</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Presets</CardTitle>
                <CardDescription>Try different preset examples</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="art">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="art">Art Tour</TabsTrigger>
                    <TabsTrigger value="city">City Tour</TabsTrigger>
                    <TabsTrigger value="nature">Nature Tour</TabsTrigger>
                    <TabsTrigger value="long">Long Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="art" className="space-y-2">
                    {presets[0].chapters.map((chapter, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 rounded hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => applyPreset(0, index)}
                      >
                        <span className="font-medium">
                          {chapter.order}. {chapter.name}
                        </span>
                        {chapter.isXR && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CuboidIcon className="h-3 w-3" /> XR
                          </span>
                        )}
                      </button>
                    ))}
                  </TabsContent>

                  <TabsContent value="city" className="space-y-2">
                    {presets[1].chapters.map((chapter, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 rounded hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => applyPreset(1, index)}
                      >
                        <span className="font-medium">
                          {chapter.order}. {chapter.name}
                        </span>
                        {chapter.isXR && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CuboidIcon className="h-3 w-3" /> XR
                          </span>
                        )}
                      </button>
                    ))}
                  </TabsContent>

                  <TabsContent value="nature" className="space-y-2">
                    {presets[2].chapters.map((chapter, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 rounded hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => applyPreset(2, index)}
                      >
                        <span className="font-medium">
                          {chapter.order}. {chapter.name}
                        </span>
                        {chapter.isXR && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CuboidIcon className="h-3 w-3" /> XR
                          </span>
                        )}
                      </button>
                    ))}
                  </TabsContent>

                  <TabsContent value="long" className="space-y-2">
                    {presets[3].chapters.map((chapter, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 rounded hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => applyPreset(3, index)}
                      >
                        <span className="font-medium">
                          {chapter.order}. {chapter.name.substring(0, 40)}...
                        </span>
                        {chapter.isXR && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CuboidIcon className="h-3 w-3" /> XR
                          </span>
                        )}
                      </button>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Live preview of the TrackInfo component</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-muted rounded-md">
                <div className="max-w-md mx-auto">
                  <TrackInfo
                    chapterOrder={chapterOrder}
                    chapterName={chapterName}
                    tourName={tourName}
                    showTourName={showTourName}
                    showChapterOrder={showChapterOrder}
                    initialDelay={initialDelay}
                    loopDelay={loopDelay}
                    speed={speed}
                    pauseOnHover={pauseOnHover}
                    pauseOnClick={pauseOnClick}
                    gradient={gradient}
                    gradientWidth={gradientWidth}
                    isXR={isXR}
                    onXRModeClick={handleXRModeClick}
                  />
                </div>

                <div className="mt-4 text-xs text-muted-foreground text-center">
                  <p>
                    If text overflows, it will scroll after {initialDelay} seconds and pause for {loopDelay} seconds
                    after each loop
                  </p>
                  {isXR && (
                    <p className="mt-1 text-blue-600">
                      XR Mode button is shown. Click it to see a demo toast notification.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Code example */}
            <Card>
              <CardHeader>
                <CardTitle>Code Example</CardTitle>
                <CardDescription>Copy this code to use the component with current settings</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {`import { TrackInfo } from "@/components/track-info";

<TrackInfo
  chapterOrder={${chapterOrder}}
  chapterName="${chapterName}"
  tourName="${tourName}"
  ${!showTourName ? "showTourName={false}" : ""}
  ${!showChapterOrder ? "showChapterOrder={false}" : ""}
  ${isXR ? "isXR={true}" : ""}
  ${isXR ? "onXRModeClick={() => console.log('XR Mode activated')}" : ""}
  ${initialDelay !== 10 ? `initialDelay={${initialDelay}}` : ""}
  ${loopDelay !== 10 ? `loopDelay={${loopDelay}}` : ""}
  ${speed !== 30 ? `speed={${speed}}` : ""}
  ${pauseOnHover ? "pauseOnHover={true}" : ""}
  ${pauseOnClick ? "pauseOnClick={true}" : ""}
  ${!gradient ? "gradient={false}" : ""}
  ${gradientWidth !== 60 ? `gradientWidth={${gradientWidth}}` : ""}
/>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

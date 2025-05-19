"use client"

import { useState } from "react"
import { AudioController } from "@/components/audio-controller"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Music, Volume2, Headphones, Code } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AudioControllerDemo() {
  // State for audio source
  const [audioSrc, setAudioSrc] = useState("/audio/sample.mp3")
  const [customAudioUrl, setCustomAudioUrl] = useState("")

  // Event tracking
  const [events, setEvents] = useState<{ type: string; time: string }[]>([])
  const [showEvents, setShowEvents] = useState(true)

  // Current time and duration for display outside the component
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Add event to the events list
  const addEvent = (type: string) => {
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })

    setEvents((prev) => {
      // Keep only the last 10 events
      const newEvents = [...prev, { type, time: timeString }]
      if (newEvents.length > 10) {
        return newEvents.slice(newEvents.length - 10)
      }
      return newEvents
    })
  }

  // Event handlers
  const handleTrackEnd = () => {
    addEvent("Track Ended")
  }

  const handlePlay = () => {
    addEvent("Track Started Playing")
  }

  const handlePause = () => {
    addEvent("Track Paused")
  }

  const handleTimeUpdate = (time: number, dur: number) => {
    setCurrentTime(time)
    setDuration(dur)

    // Only log time update events at 10-second intervals to avoid flooding
    if (Math.floor(time) % 10 === 0 && Math.floor(time) > 0) {
      addEvent(`Time Update: ${formatTime(time)}/${formatTime(dur)}`)
    }
  }

  // Handle custom audio URL
  const setCustomAudio = () => {
    if (customAudioUrl.trim()) {
      setAudioSrc(customAudioUrl)
      addEvent(`Changed Audio Source: ${customAudioUrl}`)
    }
  }

  // Sample audio options
  const audioOptions = [
    { name: "Sample Audio", src: "/audio/sample.mp3" },
    { name: "Guitar Loop", src: "https://assets.mixkit.co/music/preview/mixkit-guitar-loop-668.mp3" },
    {
      name: "Dreamy Ambient",
      src: "https://assets.mixkit.co/music/preview/mixkit-dreamy-ambient-piano-notification-225.mp3",
    },
    { name: "Tech House", src: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Audio Controller Demo</h1>
          <p className="text-muted-foreground">A customizable audio player component with a thumbless slider</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main column with audio player */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Audio Player
                </CardTitle>
                <CardDescription>Currently playing: {audioSrc.split("/").pop()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <AudioController
                    src={audioSrc}
                    onTrackEnd={handleTrackEnd}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onTimeUpdate={handleTimeUpdate}
                  />
                </div>

                {/* External time display */}
                <div className="mt-6 p-4 border rounded-lg">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    External Time Display
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground">Current Time:</span>
                      <span className="ml-2 font-mono">{formatTime(currentTime)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Duration:</span>
                      <span className="ml-2 font-mono">{formatTime(duration)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Progress:</span>
                      <span className="ml-2 font-mono">
                        {duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Audio Source
                </CardTitle>
                <CardDescription>Select from sample audio files or provide a custom URL</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="samples">
                  <TabsList className="mb-4">
                    <TabsTrigger value="samples">Sample Audio</TabsTrigger>
                    <TabsTrigger value="custom">Custom URL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="samples">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {audioOptions.map((option) => (
                        <Button
                          key={option.src}
                          variant={audioSrc === option.src ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => {
                            setAudioSrc(option.src)
                            addEvent(`Changed Audio Source: ${option.name}`)
                          }}
                        >
                          <Music className="h-4 w-4 mr-2" />
                          {option.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter audio URL (MP3, WAV, OGG)"
                          value={customAudioUrl}
                          onChange={(e) => setCustomAudioUrl(e.target.value)}
                        />
                      </div>
                      <Button onClick={setCustomAudio}>Load</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter a direct URL to an audio file. Make sure the URL is from a source that allows cross-origin
                      requests.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Example
                </CardTitle>
                <CardDescription>Copy this code to use the AudioController in your project</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {`import { AudioController } from "@/components/audio-controller";

export default function MyAudioPlayer() {
  return (
    <div className="max-w-md mx-auto p-4">
      <AudioController 
        src="${audioSrc}"
        onTrackEnd={() => console.log("Track ended")}
        onPlay={() => console.log("Track started playing")}
        onPause={() => console.log("Track paused")}
        onTimeUpdate={(currentTime, duration) => 
          console.log(\`Current time: \${currentTime}s / \${duration}s\`)
        }
      />
    </div>
  );
}`}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with events and info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Events
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-events" checked={showEvents} onCheckedChange={setShowEvents} />
                    <Label htmlFor="show-events">Show</Label>
                  </div>
                </div>
                <CardDescription>Track events from the audio player</CardDescription>
              </CardHeader>
              <CardContent>
                {showEvents ? (
                  events.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {events.map((event, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md text-sm">
                          <span>{event.type}</span>
                          <Badge variant="outline">{event.time}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No events yet. Interact with the player to see events.
                    </p>
                  )
                ) : (
                  <p className="text-center text-muted-foreground py-4">Event tracking is disabled.</p>
                )}

                {events.length > 0 && showEvents && (
                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setEvents([])}>
                    Clear Events
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Features
                </CardTitle>
                <CardDescription>AudioController component capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Play/pause with visual feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Thumbless slider for progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Time display in MM:SS format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Volume mute/unmute toggle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Event callbacks for player actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Responsive design for all devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      ✓
                    </div>
                    <span className="text-sm">Dark mode support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                The previous/next buttons are placeholders. Implement your own logic to handle playlist functionality.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}

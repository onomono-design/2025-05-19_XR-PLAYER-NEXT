"use client"

import { useState } from "react"
import { Tracklist, type Track } from "@/components/tracklist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash, Music, Play, Pause, RefreshCw, List } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

// Sample track data
const sampleTracks: Track[] = [
  {
    id: "1",
    name: "Introduction to the Museum",
    chapterOrder: 1,
    duration: 125,
    isXR: false,
    url: "/audio-controller",
  },
  {
    id: "2",
    name: "Renaissance Masterpieces",
    chapterOrder: 2,
    duration: 245,
    isXR: true,
    url: "/image-slider-preview",
  },
  {
    id: "3",
    name: "Modern Art Movement",
    chapterOrder: 3,
    duration: 180,
    isXR: false,
    url: "/track-info",
  },
  {
    id: "4",
    name: "Sculpture Garden",
    chapterOrder: 4,
    duration: 210,
    isXR: true,
    url: "/main-player",
  },
  {
    id: "5",
    name: "Contemporary Exhibits",
    chapterOrder: 5,
    duration: 195,
    isXR: false,
    url: "/landing",
  },
]

// Generate a large number of tracks for virtualization demo
const generateManyTracks = (count: number): Track[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: (index + 6).toString(),
    name: `Generated Track ${index + 6}`,
    chapterOrder: index + 6,
    duration: 60 + Math.floor(Math.random() * 240),
    isXR: Math.random() > 0.7,
    url: index % 3 === 0 ? `/demo-page-${index}` : undefined,
  }))
}

export default function TracklistDemo() {
  // Track state
  const [tracks, setTracks] = useState<Track[]>(sampleTracks)
  const [currentTrackId, setCurrentTrackId] = useState<string>("2")
  const [isPlaying, setIsPlaying] = useState(true)

  // New track form state
  const [newTrackName, setNewTrackName] = useState("")
  const [newTrackDuration, setNewTrackDuration] = useState(180)
  const [newTrackIsXR, setNewTrackIsXR] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState("")

  // Component configuration
  const [showHeader, setShowHeader] = useState(true)
  const [playlistTitle, setPlaylistTitle] = useState("Playlist")

  // Demo options
  const [showLargeSample, setShowLargeSample] = useState(false)

  // Handle track selection
  const handleTrackSelect = (track: Track) => {
    setCurrentTrackId(track.id)
    console.log(`Selected track: ${track.name}`)
  }

  // Add a new track
  const addTrack = () => {
    if (!newTrackName.trim()) return

    const newTrack: Track = {
      id: uuidv4(),
      name: newTrackName,
      chapterOrder: tracks.length + 1,
      duration: newTrackDuration,
      isXR: newTrackIsXR,
      url: newTrackUrl.trim() || undefined,
    }

    setTracks([...tracks, newTrack])
    setNewTrackName("")
    setNewTrackDuration(180)
    setNewTrackIsXR(false)
    setNewTrackUrl("")
  }

  // Remove a track
  const removeTrack = (id: string) => {
    setTracks(tracks.filter((track) => track.id !== id))
    if (currentTrackId === id) {
      setCurrentTrackId(undefined)
      setIsPlaying(false)
    }
  }

  // Toggle large sample for virtualization demo
  const toggleLargeSample = () => {
    if (showLargeSample) {
      setTracks(sampleTracks)
    } else {
      setTracks([...sampleTracks, ...generateManyTracks(100)])
    }
    setShowLargeSample(!showLargeSample)
  }

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tracklist Component</h1>
          <Button
            variant={showLargeSample ? "destructive" : "outline"}
            onClick={toggleLargeSample}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {showLargeSample ? "Reset Sample" : "Load 100+ Tracks"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tracklist preview in a white container */}
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="h-[600px]">
              <Tracklist
                tracks={tracks}
                currentTrackId={isPlaying ? currentTrackId : undefined}
                onTrackSelect={handleTrackSelect}
                title={playlistTitle}
                showHeader={showHeader}
                headerIcon={<List className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* Configuration panel */}
          <div className="space-y-6">
            <Tabs defaultValue="tracks">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="tracks">Tracks</TabsTrigger>
                <TabsTrigger value="playback">Playback</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="space-y-6">
                {/* Add new track */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Track</CardTitle>
                    <CardDescription>Create a new track to add to the playlist</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="track-name">Track Name</Label>
                      <Input
                        id="track-name"
                        value={newTrackName}
                        onChange={(e) => setNewTrackName(e.target.value)}
                        placeholder="Enter track name"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="track-duration">Duration: {formatDuration(newTrackDuration)}</Label>
                      </div>
                      <Slider
                        id="track-duration"
                        min={30}
                        max={600}
                        step={15}
                        value={[newTrackDuration]}
                        onValueChange={(value) => setNewTrackDuration(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="track-url">URL (optional)</Label>
                      <Input
                        id="track-url"
                        value={newTrackUrl}
                        onChange={(e) => setNewTrackUrl(e.target.value)}
                        placeholder="Enter URL for redirection"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty for no redirection, or enter a path like "/audio-controller"
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="track-xr">XR Content</Label>
                      <Switch id="track-xr" checked={newTrackIsXR} onCheckedChange={setNewTrackIsXR} />
                    </div>

                    <Button onClick={addTrack} className="w-full mt-2" disabled={!newTrackName.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Track
                    </Button>
                  </CardContent>
                </Card>

                {/* Track list management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Tracks</CardTitle>
                    <CardDescription>Edit or remove existing tracks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {tracks.slice(0, 10).map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                              {track.chapterOrder}
                            </div>
                            <span className="font-medium">{track.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {track.url && (
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">URL</span>
                            )}
                            {track.isXR && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">XR</span>
                            )}
                            <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTrack(track.id)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {tracks.length > 10 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                          + {tracks.length - 10} more tracks
                        </div>
                      )}
                      {tracks.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No tracks available. Add some tracks to get started.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="playback" className="space-y-6">
                {/* Playback controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Playback Controls</CardTitle>
                    <CardDescription>Control the currently playing track</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-playing">Playback State</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isPlaying ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsPlaying(true)}
                          disabled={!currentTrackId}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Playing
                        </Button>
                        <Button
                          variant={!isPlaying ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsPlaying(false)}
                          disabled={!currentTrackId}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Paused
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-md">
                      <h3 className="text-sm font-medium mb-2">Currently Selected Track</h3>
                      {currentTrackId ? (
                        (() => {
                          const track = tracks.find((t) => t.id === currentTrackId)
                          return track ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Music className="h-4 w-4 text-primary" />
                                <span className="font-medium">{track.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {track.url && (
                                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">URL</span>
                                )}
                                {track.isXR && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">XR</span>
                                )}
                                <span className="text-sm">{formatDuration(track.duration)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Selected track not found in playlist</div>
                          )
                        })()
                      ) : (
                        <div className="text-sm text-muted-foreground">No track selected</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="config" className="space-y-6">
                {/* Component configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Component Configuration</CardTitle>
                    <CardDescription>Customize the appearance and behavior of the Tracklist</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-header">Show Header</Label>
                      <Switch id="show-header" checked={showHeader} onCheckedChange={setShowHeader} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="playlist-title">Playlist Title</Label>
                      <Input
                        id="playlist-title"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        placeholder="Enter playlist title"
                        disabled={!showHeader}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Code example */}
                <Card>
                  <CardHeader>
                    <CardTitle>Code Example</CardTitle>
                    <CardDescription>Copy this code to use the Tracklist component</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      {`import { Tracklist } from "@/components/tracklist";

// Track data
const tracks = [
  {
    id: "1",
    name: "Introduction to the Museum",
    chapterOrder: 1,
    duration: 125,
    isXR: false,
    url: "/audio-controller", // Optional URL for redirection
  },
  {
    id: "2",
    name: "Renaissance Masterpieces",
    chapterOrder: 2,
    duration: 245,
    isXR: true,
  },
  // Add more tracks...
];

export default function MyPlaylist() {
  const [currentTrackId, setCurrentTrackId] = useState("1");
  
  const handleTrackSelect = (track) => {
    setCurrentTrackId(track.id);
    // Start playing the selected track
  };

  return (
    <div className="h-screen">
      <Tracklist
        tracks={tracks}
        currentTrackId={currentTrackId}
        onTrackSelect={handleTrackSelect}
        title="${playlistTitle}"
        showHeader={${showHeader}}
      />
    </div>
  );
}`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import { Music, Play } from "lucide-react"
import Link from "next/link"

export interface Track {
  /**
   * Unique identifier for the track
   */
  id: string
  /**
   * Name of the track
   */
  name: string
  /**
   * Chapter order number
   */
  chapterOrder: number
  /**
   * Duration of the track in seconds
   */
  duration: number
  /**
   * Whether the track has XR content
   */
  isXR?: boolean
  /**
   * URL to navigate to when the track is clicked
   */
  url?: string
}

export interface TracklistProps {
  /**
   * Array of tracks to display
   */
  tracks: Track[]
  /**
   * ID of the currently playing track
   */
  currentTrackId?: string
  /**
   * Callback when a track is selected
   */
  onTrackSelect?: (track: Track) => void
  /**
   * Additional class name for the container
   */
  className?: string
  /**
   * Placeholder text when no tracks are available
   */
  placeholder?: string
  /**
   * Title for the playlist header
   * @default "Playlist"
   */
  title?: string
  /**
   * Whether to show the header
   * @default true
   */
  showHeader?: boolean
  /**
   * Icon to display in the header
   */
  headerIcon?: React.ReactNode
}

/**
 * Format seconds to MM:SS format
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

/**
 * Tracklist - A virtualized list of tracks with selection functionality
 */
export function Tracklist({
  tracks,
  currentTrackId,
  onTrackSelect,
  className,
  placeholder = "No tracks available",
  title = "Playlist",
  showHeader = true,
  headerIcon = <Music className="h-5 w-5" />,
}: TracklistProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>(currentTrackId)
  const listRef = useRef<List>(null)

  // Update selected track when currentTrackId changes
  useEffect(() => {
    if (currentTrackId) {
      setSelectedTrackId(currentTrackId)

      // Scroll to the current track
      const currentIndex = tracks.findIndex((track) => track.id === currentTrackId)
      if (currentIndex !== -1 && listRef.current) {
        listRef.current.scrollToItem(currentIndex, "smart")
      }
    }
  }, [currentTrackId, tracks])

  const handleTrackSelect = (track: Track) => {
    setSelectedTrackId(track.id)
    if (onTrackSelect) {
      onTrackSelect(track)
    }
  }

  // Render each track item
  const TrackItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const track = tracks[index]
    const isSelected = track.id === selectedTrackId
    const isPlaying = track.id === currentTrackId

    // Create the card content
    const cardContent = (
      <Card
        className={cn(
          "p-4 transition-all cursor-pointer hover:bg-accent",
          isSelected ? "bg-accent border-primary" : "",
          isPlaying ? "border-primary" : "",
        )}
        onClick={() => handleTrackSelect(track)}
      >
        <div className="flex items-center gap-3">
          {/* Chapter order badge */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {track.chapterOrder}
          </div>

          {/* Track name */}
          <div className="flex-1 truncate font-medium">{track.name}</div>

          {/* Right side with XR tag and duration */}
          <div className="flex items-center gap-2">
            {track.isXR && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">XR</span>
            )}
            <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
            {isPlaying && <Play size={16} className="text-primary" />}
          </div>
        </div>
      </Card>
    )

    // If the track has a URL, wrap it in a Link
    if (track.url) {
      return (
        <div style={style} className="px-4 py-2">
          <Link href={track.url} className="block">
            {cardContent}
          </Link>
        </div>
      )
    }

    // Otherwise, render the card directly
    return (
      <div style={style} className="px-4 py-2">
        {cardContent}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Fixed header */}
      {showHeader && (
        <div className="flex items-center gap-2 p-4 border-b">
          {headerIcon}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      )}

      {/* Virtualized list */}
      <div className="flex-1">
        {tracks.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                width={width}
                itemCount={tracks.length}
                itemSize={80} // Adjust based on your card height
              >
                {TrackItem}
              </List>
            )}
          </AutoSizer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">{placeholder}</div>
        )}
      </div>
    </div>
  )
}

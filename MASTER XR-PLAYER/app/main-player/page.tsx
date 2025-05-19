"use client"

import { useState, useEffect, useRef } from "react"
import { ImageSlider } from "@/components/image-slider"
import { AudioController } from "@/components/audio-controller"
import { TrackInfo } from "@/components/track-info"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { RotateCcw, Music } from "lucide-react"
import XRVideoPlayer from "@/components/xr-video-player"
import { defaultXRContent, xrContentList, DEFAULT_AUDIO_SRC } from "@/config/xr-content"
import { LandingPage, type LandingPageEvent } from "@/components/landing-page"
import { usePermission } from "@/contexts/permission-context"
import { PermissionProvider } from "@/contexts/permission-context"
import MainPlayerUI from "./player-ui"

// Sample images from the project
const images = [
  "/colorful-abstract-album-cover.png",
  "/abstract-soundscape.png",
  "/abstract-art-1.png",
  "/abstract-art-2.png",
  "/abstract-art-3.png",
]

// Fallback audio sources - we'll try these if the primary source fails
const fallbackAudioSources = [
  DEFAULT_AUDIO_SRC,
  "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-dreamy-ambient-piano-notification-225.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-guitar-loop-668.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
]

export default function MainPlayerPageWrapper() {
  return (
    <PermissionProvider>
      <MainPlayerUI />
    </PermissionProvider>
  );
}

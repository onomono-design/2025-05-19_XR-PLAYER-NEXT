/**
 * Configuration for XR Content
 * 
 * This file defines available 360° videos and their metadata for use in the XR player.
 */

export interface XRContent {
  id: string;
  name: string;
  xrSrc: string;
  audioSrc: string;
  sceneName: string;
  description?: string;
}

// Default video and audio sources
export const DEFAULT_VIDEO_SRC =
  "https://cmm-cloud-2.s3.us-west-1.amazonaws.com/WALKING+TOURS/2025-04-10-JAPANTOWN-XR/2025-04-21-CHINATOWN-XR-UPDATE/2025-04-21-CHINATOWN-XR-2b-low.mp4"
export const DEFAULT_AUDIO_SRC =
  "https://cmm-cloud-2.s3.us-west-1.amazonaws.com/WALKING+TOURS/2025-03-15-CHINATOWN/2025-03-15-CHINATOWN-MP3S/2025-04-21-SHORTER-MP3-CHAPTERS/2025-04-21-Chapter+2+Look+Tin+Eli.mp3"

export const xrContentList: XRContent[] = [
  {
    id: "chinatown",
    name: "Chinatown Tour",
    xrSrc: DEFAULT_VIDEO_SRC,
    audioSrc: DEFAULT_AUDIO_SRC,
    sceneName: "Chinatown Experience",
    description: "A panoramic view of San Francisco's Chinatown"
  },
  {
    id: "forest",
    name: "Forest Exploration",
    xrSrc: "https://cdn.aframe.io/videos/360/scene_portal_remix.mp4",
    audioSrc: "https://assets.mixkit.co/music/preview/mixkit-dreamy-ambient-piano-notification-225.mp3",
    sceneName: "Forest Path",
    description: "Immersive forest environment with natural sounds"
  },
  {
    id: "space",
    name: "Space Journey",
    xrSrc: "https://cdn.aframe.io/videos/360/flying.mp4",
    audioSrc: "https://assets.mixkit.co/music/preview/mixkit-guitar-loop-668.mp3",
    sceneName: "Space Experience",
    description: "Experience flying through space with ambient soundtrack"
  }
];

// Default XR content to use when none is specified
export const defaultXRContent = xrContentList[0]; 
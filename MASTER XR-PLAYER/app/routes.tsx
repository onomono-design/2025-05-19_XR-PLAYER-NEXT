import { ImageSlider } from "@/components/image-slider"
import { AudioController } from "@/components/audio-controller"
import { LandingPage } from "@/components/landing-page"
import { OutroCTA } from "@/components/outro-cta"
import { ThumblessSlider } from "@/components/ui/thumbless-slider"
import { LoadingModal } from "@/components/loading-modal"

// This file serves as a reference for the available components
// It is not used in the application but helps document the components

export const routes = {
  // Main components
  imageSlider: {
    component: ImageSlider,
    path: "/image-slider-preview",
    description: "A versatile image slider/carousel component",
  },
  audioController: {
    component: AudioController,
    path: "/audio-controller",
    description: "A customizable audio player component with a thumbless slider",
  },
  landingPage: {
    component: LandingPage,
    path: "/landing",
    description: "A full-screen landing page component with device detection",
  },
  outroCTA: {
    component: OutroCTA,
    path: "/outro-cta",
    description: "A fullscreen call-to-action component for outros",
  },
  thumblessSlider: {
    component: ThumblessSlider,
    path: "/",
    description: "A slider component without a visible thumb",
  },
  loadingModal: {
    component: LoadingModal,
    path: "/loading-modal",
    description: "A loading indicator modal component",
  },
  demoTrigger: {
    path: "/demo-trigger",
    description: "Demo showing how to trigger the OutroCTA from another component",
  },
}

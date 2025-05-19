# XR-REACT Media Player

A modern, immersive media player built with React and Next.js that offers both standard audio playback and interactive XR (extended reality) experiences.

## Overview

XR-REACT is a comprehensive media player solution that seamlessly switches between standard audio playback and 360° immersive XR experiences. It features a modular component architecture that enables flexible integration into various applications while maintaining a cohesive user experience.

## Key Features

- **Dual-Mode Playback**: Switch between standard audio mode and immersive 360° XR experiences
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Intuitive Camera Controls**: Natural camera movement with inverted drag controls in XR mode
- **Synchronized Audio/Video**: Perfectly synchronized audio and 360° video in XR mode
- **Accessibility**: Designed with accessibility in mind through clear UI indicators and keyboard navigation
- **Customizable Components**: Modular design allows for custom styling and integration

## Components 

### Core Components

#### Audio Controller

A full-featured audio playback controller that manages audio playback in both standard and XR modes.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `undefined` | URL of the audio file to play (only used if externalAudioRef is not provided) |
| `externalAudioRef` | `React.RefObject<HTMLAudioElement>` | `undefined` | External audio element reference for parent-controlled audio |
| `isPlaying` | `boolean` | `false` | Whether the audio is currently playing |
| `currentTime` | `number` | `0` | Current playback time in seconds |
| `duration` | `number` | `0` | Total duration of the audio in seconds |
| `isMuted` | `boolean` | `false` | Whether the audio is muted |
| `onPlayPause` | `() => void` | `undefined` | Callback fired when the play/pause button is clicked |
| `onMuteToggle` | `() => void` | `undefined` | Callback fired when the mute button is clicked |
| `onSeek` | `(time: number) => void` | `undefined` | Callback fired when the user seeks to a new position |
| `onTrackEnd` | `() => void` | `undefined` | Callback fired when the track reaches its end |
| `onPlay` | `() => void` | `undefined` | Callback fired when the track starts playing |
| `onPause` | `() => void` | `undefined` | Callback fired when the track is paused |
| `onTimeUpdate` | `(currentTime: number, duration: number) => void` | `undefined` | Callback fired when the track time is updated |
| `isXR` | `boolean` | `false` | Whether the component is in XR mode (changes styling) |
| `hasError` | `boolean` | `false` | Whether there's an error with the audio |

#### XR Video Player

An immersive 360° video player component that synchronizes with the audio controller and provides interactive camera controls.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `xrSrc` | `string` | Required | URL of the 360° video file to display |
| `audioRef` | `React.RefObject<HTMLAudioElement>` | Required | Reference to the audio element for synchronized playback |
| `isPlaying` | `boolean` | Required | Whether the audio/video is currently playing |
| `currentTime` | `number` | Required | Current playback time in seconds |
| `duration` | `number` | Required | Total duration of the audio/video in seconds |
| `className` | `string` | `""` | Additional CSS classes to apply |
| `onRecenter` | `() => void` | `undefined` | Callback when the camera is recentered |

##### Camera Controls

The XR video player features intuitive camera controls:

- **Inverted Mouse/Touch Drag**: Camera moves in the same direction as your cursor (as if grabbing the world), opposite to traditional first-person camera controls
- **Device Orientation Controls**: On compatible mobile devices, the camera can be controlled by physically moving the device
- **Recenter Functionality**: A button to reset the camera view to the default position

#### Image Slider

A responsive image slider for displaying still images in regular audio mode.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `string[]` | Required | Array of image URLs to display |
| `timecodes` | `number[]` | `undefined` | Timecodes (in seconds) for automatic slide transitions |
| `alt` | `string` | `"Slider image"` | Alt text for images |
| `className` | `string` | `undefined` | Additional CSS classes |
| `autoplay` | `boolean` | `true` | Whether to automatically advance slides |
| `defaultInterval` | `number` | `30` | Default interval (in seconds) between slides |
| `onSlideChange` | `(index: number) => void` | `undefined` | Callback when slide changes |
| `devMode` | `boolean` | `false` | Enable development testing mode |
| `allowVerticalCrop` | `boolean` | `false` | Allow vertical cropping of images |
| `aspectRatio` | `number` | `1` | Aspect ratio to maintain |

#### Track Info

Displays information about the current track/chapter with optional XR mode button.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chapterOrder` | `number` | Required | Current chapter number |
| `chapterName` | `string` | Required | Name of the current chapter |
| `tourName` | `string` | Required | Name of the tour/experience |
| `isXR` | `boolean` | `false` | Whether this track has XR content (shows XR button) |
| `onXRModeClick` | `() => void` | `undefined` | Callback when XR mode is activated |
| `className` | `string` | `undefined` | Additional CSS classes |
| `showTourName` | `boolean` | `true` | Whether to show the tour name |
| `showChapterOrder` | `boolean` | `true` | Whether to show the chapter order |

### UI Components

#### ThumblessSlider

A custom slider component without a visible thumb, used for audio progress control.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size of the slider track |
| `color` | `"default" \| "primary" \| "secondary" \| "foreground" \| "success" \| "warning" \| "danger"` | `"default"` | Color of the slider track |
| `hideThumb` | `boolean` | `true` | Whether to hide the thumb |
| `...props` | `SliderProps` | - | All Radix UI Slider props |

#### LoadingModal

A modal component displayed during loading operations.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Whether the loading modal is visible |
| `loadingText` | `string` | `"Loading"` | Text to display below the spinner |
| `spinnerColor` | `string` | `"white"` | Color of the spinner |
| `textColor` | `string` | `"white"` | Color of the text |
| `autoClose` | `boolean` | `false` | Whether to automatically close after a time |
| `autoCloseTime` | `number` | `3000` | Time (ms) after which to auto-close |

## Integrated UI/UX Flow

### Standard Audio Mode

In standard audio mode, the player presents:

1. **Image Slider**: Displays related images that can change based on timecodes or manual navigation
2. **Track Info**: Shows chapter information with an "XR MODE" button for tracks with XR content
3. **Audio Controller**: Provides playback controls, progress bar, and time display

The user can interact with the audio controller to play/pause, seek, or adjust volume. For tracks with XR content, the XR MODE button becomes active, allowing users to switch to the immersive experience.

### XR Mode

When XR mode is activated:

1. **XR Video Player**: Replaces the image slider with a 360° video environment
2. **Audio Controller**: Persists at the bottom with a semi-transparent background for better visibility
3. **Control Buttons**: "Audio Only" and "Recenter" buttons are added to the top of the screen

In XR mode, the user can:
- Look around by dragging the mouse/touchscreen (inverted controls for intuitive navigation)
- Use device orientation on compatible mobile devices
- Recenter the view with the recenter button
- Return to standard audio mode with the "Audio Only" button
- Control audio playback with the persistent audio controller

### Mode Transitions

The transition between standard and XR modes is managed by the main player component:

1. When the user clicks the "XR MODE" button in TrackInfo:
   - The state variable `isXRModeActive` is set to true
   - The XR video source is synchronized with the current audio
   - The LoadingModal appears briefly while loading the XR content
   - The regular UI fades out and the XR environment fades in

2. When the user clicks the "Audio Only" button in XR mode:
   - The `isXRModeActive` state is set to false
   - The XR video is unloaded to conserve resources
   - The standard UI components fade back in

## Implementation Details

### Camera Control Implementation

The camera control in XR mode is implemented using A-Frame's look-controls component with custom settings:

```jsx
<a-entity 
  camera 
  look-controls="magicWindowTrackingEnabled: true; reverseMouseDrag: true; reverseTouchDrag: true;" 
  camera-recenter
>
  <a-entity cursor="rayOrigin: mouse"></a-entity>
</a-entity>
```

Key configuration options:
- `reverseMouseDrag: true`: Inverts mouse drag direction for more intuitive control
- `reverseTouchDrag: true`: Inverts touch drag direction on mobile devices
- `magicWindowTrackingEnabled: true`: Enables device orientation tracking on mobile

The custom camera-recenter component provides functionality to reset the camera view to the initial position, essential for helping users who become disoriented in the 360° environment.

### Audio-Video Synchronization

To maintain perfect synchronization between audio and video in XR mode:

1. A timer regularly checks for drift between audio and video timing
2. If the difference exceeds a threshold (0.3 seconds), the video is adjusted to match the audio
3. Play state (playing/paused) is continuously synchronized

This approach ensures a seamless experience while allowing the audio controller to remain the primary source of control.

## Accessibility Considerations

- **Keyboard Navigation**: Supports keyboard controls for playback and navigation
- **Visual Indicators**: Clear visual feedback for all interactive elements
- **Screen Reader Support**: Appropriate ARIA labels and semantic HTML
- **Touch Targets**: Larger touch targets for mobile devices

## Browser and Device Support

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **XR Features**: Performance may vary based on device capabilities
- **Device Orientation**: Requires permission on iOS devices

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to http://localhost:3000

## Customization

The components can be customized through props and styling. The UI uses Tailwind CSS for styling, making it easy to adjust colors, spacing, and other visual aspects.

## License

MIT

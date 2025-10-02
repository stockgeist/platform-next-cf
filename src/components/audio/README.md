# Audio Player Component

A simple, focused audio player component similar to ElevenLabs, built with React, TypeScript, and Zustand for state management. Perfect for STT (Speech-to-Text) and TTS (Text-to-Speech) applications.

## Features

- **Compact Playbar**: Collapsible playbar similar to ElevenLabs design
- **Single Audio Playback**: Play one audio file at a time (TTS or STT)
- **Playback Controls**: Play, pause, skip forward/backward, seek
- **Volume Control**: Adjust volume and mute functionality
- **Progress Tracking**: Real-time progress bar with time display
- **Download Support**: Download audio files
- **Responsive Design**: Works on desktop and mobile
- **TypeScript Support**: Full type safety
- **Zustand Integration**: Global state management

## Components

### Core Components

- `Playbar` - Main compact playbar component
- `AudioPlayer` - Full-featured audio player
- `AudioPlayerContainer` - Container with playbar

### Hooks

- `useAudioPlayer` - Audio playback functionality
- `useAudioControls` - Playback controls

### Store

- `useAudioStore` - Zustand store for global audio state

## Usage

### Basic Setup

```tsx
import { AudioPlayerContainer } from '@/components/audio'

function App() {
  return (
    <div>
      {/* Your app content */}
      <AudioPlayerContainer />
    </div>
  )
}
```

### Playing Audio

```tsx
import { useAudioStore, createAudioTrackFromTTS } from '@/components/audio'
import { createAudioTrackFromFile } from '@/lib/audio-utils'

function MyComponent() {
  const { setCurrentTrack } = useAudioStore()

  const handlePlayTTS = () => {
    const track = createAudioTrackFromTTS(
      'Hello world',
      'https://example.com/audio.mp3',
      'Voice Name',
      'en-US',
      'tts-1'
    )
    setCurrentTrack(track)
  }

  const handleFileUpload = (file: File) => {
    const track = createAudioTrackFromFile(file)
    setCurrentTrack(track)
  }

  return (
    <div>
      <button onClick={handlePlayTTS}>Play TTS Audio</button>
      <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e.target.files[0])} />
    </div>
  )
}
```

### Using Audio Controls

```tsx
import { useAudioControls } from '@/components/audio'

function Controls() {
  const {
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
  } = useAudioControls()

  return (
    <div>
      <button onClick={togglePlayPause}>Play/Pause</button>
      <button onClick={previousTrack}>Previous</button>
      <button onClick={nextTrack}>Next</button>
      <input
        type="range"
        min="0"
        max="100"
        onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
      />
      <button onClick={toggleMute}>Mute</button>
    </div>
  )
}
```

## Audio Track Types

### TTS Track
```tsx
const ttsTrack = createAudioTrackFromTTS(
  text: string,           // Text that was converted to speech
  audioUrl: string,       // URL to the audio file
  voice: string,          // Voice name used
  language?: string,      // Language code (optional)
  model?: string          // TTS model used (optional)
)
```

### STT Track
```tsx
const sttTrack = createAudioTrackFromSTT(
  audioUrl: string,       // URL to the audio file
  transcript: string,     // Transcribed text
  language?: string,      // Language code (optional)
  model?: string          // STT model used (optional)
)
```

### Upload Track
```tsx
const uploadTrack = createAudioTrackFromFile(
  file: File             // File object from input
)
```

## State Management

The audio player uses Zustand for state management. Key state properties:

```tsx
interface AudioPlayerState {
  // Current track
  currentTrack: AudioTrack | null
  isPlaying: boolean
  isLoading: boolean

  // Playback state
  currentTime: number
  duration: number
  volume: number

  // UI state
  isPlaybarOpen: boolean
}
```

## Styling

The component uses Tailwind CSS and follows the design system. You can customize the appearance by:

1. Modifying the Tailwind classes in the components
2. Using CSS variables for colors
3. Overriding component styles with custom CSS

## Browser Support

- Modern browsers with HTML5 Audio support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Dependencies

- React 18+
- TypeScript
- Zustand
- Lucide React (icons)
- Tailwind CSS
- Shadcn UI components

## License

MIT License - feel free to use in your projects!

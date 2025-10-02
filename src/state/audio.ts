import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AudioTrack {
  id: string
  name: string
  url: string
  duration?: number
}

export interface AudioStore {
  // Current track data only
  currentAudio: AudioTrack | null
  // UI state
  isPlaybarOpen: boolean
  // Actions
  setCurrentAudio: (track: AudioTrack | null) => void
  togglePlaybar: () => void
}

export const useAudioStore = create<AudioStore>()(
  devtools(
    (set) => ({
      // Initial state
      currentAudio: null,
      isPlaybarOpen: true,

      // Actions
      setCurrentAudio: (track) => {
        set({ currentAudio: track })
      },

      togglePlaybar: () => {
        set((state) => ({ isPlaybarOpen: !state.isPlaybarOpen }))
      },
    }),
    {
      name: 'audio-store',
    },
  ),
)

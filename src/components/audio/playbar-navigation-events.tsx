'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAudioStore } from '@/state/audio'
import { useAudioPlayerContext } from 'react-use-audio-player'

export function NavigationEvents() {
  const pathname = usePathname()
  const { setCurrentAudio } = useAudioStore()
  const { cleanup } = useAudioPlayerContext()

  useEffect(() => {
    setCurrentAudio(null)
    cleanup()
    console.log('NavigationEvents', pathname)
  }, [pathname, setCurrentAudio, cleanup])

  return null
}

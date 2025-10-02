'use client'

import {
  ChevronDown,
  Download,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudioStore } from '@/state/audio'
import { formatTime } from '@/lib/audio-utils'
import { useAudioPlayerContext } from 'react-use-audio-player'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const PLAYBAR_HEIGHT = '72px'

export function Playbar() {
  const {
    currentAudio: currentTrack,
    isPlaybarOpen,
    togglePlaybar,
  } = useAudioStore()

  const { isPlaying, isLoading, getPosition, seek, duration, togglePlayPause } =
    useAudioPlayerContext()

  const [currentTime, setCurrentTime] = useState(0)
  const desktopProgressRef = useRef<HTMLDivElement>(null)
  const mobileProgressRef = useRef<HTMLDivElement>(null)
  const lastClickTime = useRef<number>(0)

  // Update current time periodically
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const position = getPosition()
      setCurrentTime(position)
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, getPosition])

  const progress =
    duration > 0 && isFinite(currentTime) ? (currentTime / duration) * 100 : 0

  const skipForward = useCallback(() => {
    if (!isFinite(currentTime) || !isFinite(duration)) return
    const newTime = Math.min(currentTime + 10, duration)
    try {
      seek(newTime)
      setCurrentTime(newTime)
    } catch (error) {
      console.error('Skip forward - seek failed:', error)
    }
  }, [currentTime, duration, seek])

  const skipBackward = useCallback(() => {
    if (!isFinite(currentTime)) {
      return
    }
    const newTime = Math.max(currentTime - 10, 0)
    try {
      seek(newTime)
      setCurrentTime(newTime)
    } catch (error) {
      console.error('Skip backward - seek failed:', error)
    }
  }, [currentTime, seek])

  const downloadAudio = useCallback(() => {
    if (currentTrack?.url) {
      const link = document.createElement('a')
      link.href = currentTrack.url
      link.download = `${currentTrack.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [currentTrack])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Prevent event bubbling and default behavior
      e.preventDefault()
      e.stopPropagation()

      // Debounce rapid clicks (prevent multiple clicks within 100ms)
      const now = Date.now()
      if (now - lastClickTime.current < 100) {
        return
      }
      lastClickTime.current = now

      if (!duration || !isFinite(duration)) {
        return
      }

      // Use the clicked element's dimensions directly
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width

      // Use the progress bar container's width directly
      const effectiveWidth = width
      const effectiveClickX = clickX

      if (effectiveWidth <= 0) {
        return
      }

      const percentage = Math.max(
        0,
        Math.min(effectiveClickX / effectiveWidth, 1),
      )
      const newTime = percentage * duration

      seek(newTime)
      setCurrentTime(newTime)
    },
    [duration, seek],
  )

  const getCurrentTimeFormatted = useCallback(() => {
    return formatTime(isFinite(currentTime) ? currentTime : 0)
  }, [currentTime])

  const getDurationFormatted = useCallback(() => {
    return formatTime(isFinite(duration) ? duration : 0)
  }, [duration])

  if (!currentTrack) {
    return null
  }

  return (
    <div
      className={cn('fixed right-0 bottom-0 left-0 md:left-(--sidebar-width)')}
    >
      {/* Collapsed progress bar */}
      <div
        className={cn(
          'absolute bottom-2 left-1/2 z-10 -translate-x-1/2 transform transition-all duration-300 ease-in-out',
          isPlaybarOpen
            ? 'pointer-events-none translate-y-2 opacity-0'
            : 'pointer-events-auto translate-y-0 opacity-100',
        )}
      >
        <button
          onClick={togglePlaybar}
          className="focus:ring-primary cursor-pointer rounded transition-transform duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="Open audio player"
        >
          <div className="bg-muted border-border flex h-2 w-96 items-center rounded-full border shadow-sm">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </button>
      </div>

      {/* Main playbar*/}
      <div
        className={cn(
          'border-border bg-background border-t shadow-md transition-all duration-300 ease-in-out',
          isPlaybarOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0',
        )}
      >
        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            height: PLAYBAR_HEIGHT,
          }}
        >
          {/* Desktop layout */}
          <div className="hidden h-full items-center justify-between px-4 py-4 md:flex">
            {/* Left section - Track info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlaybar}
                className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isPlaybarOpen ? 'rotate-0' : 'rotate-180',
                  )}
                />
              </Button>
              <div className="flex flex-col">
                {/* <p className="text-foreground truncate text-base font-medium">
                  {currentTrack.name}
                </p> */}
              </div>
            </div>

            {/* Center section - Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipBackward}
                className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
              >
                <RotateCcw className="h-4 w-4 transition-transform duration-200" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-md p-0 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 transition-transform duration-200" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipForward}
                className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
              >
                <RotateCw className="h-4 w-4 transition-transform duration-200" />
              </Button>
            </div>

            {/* Right section - Progress and Actions */}
            <div className="flex flex-1 items-center gap-4 px-4">
              <span className="text-muted-foreground text-sm">
                {getCurrentTimeFormatted()}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  ref={desktopProgressRef}
                  className="bg-muted hover:bg-muted/80 block h-2 w-full cursor-pointer rounded-full transition-colors duration-200"
                  onClick={handleProgressClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (isFinite(duration) && duration > 0) {
                        const newTime = duration / 2
                        seek(newTime)
                        setCurrentTime(newTime)
                      }
                    }
                  }}
                  role="progressbar"
                  tabIndex={0}
                  aria-label="Audio progress"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-primary pointer-events-none h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-muted-foreground text-sm">
                {getDurationFormatted()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadAudio}
                className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
              >
                <Download className="h-4 w-4 transition-transform duration-200" />
              </Button>
            </div>
          </div>

          {/* Mobile layout*/}
          <div className="flex flex-col md:hidden">
            {/* Mobile progress bar at top */}
            <div className="h-2 w-full">
              <div
                ref={mobileProgressRef}
                className="bg-muted block h-2 w-full cursor-pointer transition-colors duration-200"
                onClick={handleProgressClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (isFinite(duration) && duration > 0) {
                      const newTime = duration / 2
                      seek(newTime)
                      setCurrentTime(newTime)
                    }
                  }
                }}
                role="progressbar"
                tabIndex={0}
                aria-label="Audio progress"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="bg-primary pointer-events-none h-2 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlaybar}
                  className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isPlaybarOpen ? 'rotate-0' : 'rotate-180',
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipBackward}
                  className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
                >
                  <RotateCcw className="h-4 w-4 transition-transform duration-200" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-md p-0 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4 transition-transform duration-200" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipForward}
                  className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
                >
                  <RotateCw className="h-4 w-4 transition-transform duration-200" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadAudio}
                className="border-border hover:bg-accent h-10 w-10 rounded-md border p-0 transition-all duration-200 hover:scale-105"
              >
                <Download className="h-4 w-4 transition-transform duration-200" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

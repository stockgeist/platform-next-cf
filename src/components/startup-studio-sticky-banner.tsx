'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import AgenticDevStudioLogo from './agenticdev-studio-logo'
import { ChevronLeft, X } from 'lucide-react'

const STORAGE_KEY = 'agenticdev-studio-banner-collapsed'

export function AgenticDevStudioStickyBanner() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Get initial state from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(JSON.parse(stored))
    }
    setIsHydrated(true)
  }, [])

  const toggleCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }

  if (!isHydrated) return null // Prevent flash of content

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-100 -translate-x-1/2 md:right-4 md:left-auto md:translate-x-0 print:hidden',
        isCollapsed && 'pointer-events-none', // Make entire container click-through when collapsed
      )}
    >
      <div
        className={cn(
          'transform transition-all duration-300 ease-in-out',
          isCollapsed
            ? 'translate-x-[calc(100%+1rem)] md:translate-x-[calc(100%+1rem)]'
            : 'translate-x-0',
        )}
      >
        <div className="relative flex w-[90vw] items-center md:max-w-[400px]">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute left-0 h-8 w-8 -translate-x-full rounded-full shadow-lg',
              'bg-background hover:bg-background',
              'hover:border-border border-2',
              isCollapsed ? 'pointer-events-auto opacity-100' : 'opacity-0', // Ensure button is clickable when collapsed
            )}
            onClick={() => toggleCollapsed(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="dark:bg-background relative rounded-lg border-2 bg-gray-100 shadow-xl">
            <Button
              size="icon"
              className="border-border absolute -top-3 -right-3 h-6 w-6 rounded-full border shadow-md"
              onClick={() => toggleCollapsed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center px-3 py-3">
              <a
                href="https://agenticdev.agency?ref=saas-template-sticky-banner"
                target="_blank"
                className="hover:text-foreground flex flex-col items-center text-sm font-medium transition-colors"
              >
                <div className="flex items-center">
                  <span className="whitespace-nowrap">Built by</span>
                  <AgenticDevStudioLogo className="mx-1.5 h-7 w-7" />
                  <span className="whitespace-nowrap">AgenticDev</span>
                </div>

                <div className="text-tiny text-muted-foreground mt-3">
                  Transform operations with AI solutions that adapt to your
                  actual needs—automating routine tasks or solving complex
                  challenges through customized systems. Focus on growth while
                  we handle the tech specifics that matter most to your
                  business.
                </div>
              </a>
              <Button size="sm" className="mt-4" asChild>
                <a
                  href="https://agenticdev.agency?ref=saas-template-sticky-banner"
                  target="_blank"
                >
                  Book a free consultation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

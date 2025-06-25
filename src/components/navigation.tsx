'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import { ComponentIcon, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useSessionStore } from '@/state/session'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/state/nav'
import { Skeleton } from '@/components/ui/skeleton'
import { SITE_NAME } from '@/constants'

type NavItem = {
  name: string
  href: Route
}

const ActionButtons = () => {
  const { session, isLoading } = useSessionStore()
  const { setIsOpen } = useNavStore()

  if (isLoading) {
    return <Skeleton className="bg-primary h-10 w-[80px]" />
  }

  if (session) {
    return null
  }

  return (
    <Button asChild onClick={() => setIsOpen(false)}>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  )
}

export function Navigation() {
  const { session, isLoading } = useSessionStore()
  const { isOpen, setIsOpen } = useNavStore()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    ...(session
      ? ([
          { name: 'Settings', href: '/settings' },
          { name: 'Dashboard', href: '/dashboard' },
        ] as NavItem[])
      : []),
  ]

  const isActiveLink = (itemHref: string) => {
    if (itemHref === '/') {
      return pathname === '/'
    }
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
  }

  return (
    <nav className="bg-muted/60 dark:bg-muted/30 z-10 shadow dark:shadow-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-primary flex items-center gap-2 text-xl font-bold md:gap-3 md:text-2xl"
            >
              <ComponentIcon className="h-6 w-6 md:h-7 md:w-7" />
              {SITE_NAME}
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-6">
            <div className="flex items-baseline space-x-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </>
              ) : (
                navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-muted-foreground hover:text-foreground relative flex h-16 items-center px-3 text-sm font-medium no-underline transition-colors',
                      isActiveLink(item.href) &&
                        'text-foreground after:bg-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full',
                    )}
                  >
                    {item.name}
                  </Link>
                ))
              )}
            </div>
            <ActionButtons />
          </div>
          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-6">
                  <Menu className="h-9 w-9" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="mt-6 flow-root">
                  <div className="space-y-2">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </>
                    ) : (
                      <>
                        {navItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              'text-muted-foreground hover:bg-muted/50 hover:text-foreground relative block px-3 py-2 text-base font-medium no-underline transition-colors',
                              isActiveLink(item.href) && 'text-foreground',
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                        <div className="px-3 pt-4">
                          <ActionButtons />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

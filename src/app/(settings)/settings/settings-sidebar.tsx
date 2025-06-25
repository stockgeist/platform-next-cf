'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { User, Smartphone, Lock, LogOut } from 'lucide-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { useRef } from 'react'
import type { Route } from 'next'
import useSignOut from '@/hooks/useSignOut'

interface SidebarNavItem {
  title: string
  href: Route
  icon: React.ComponentType<{ className?: string }>
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: 'Profile',
    href: '/settings',
    icon: User,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Lock,
  },
  {
    title: 'Sessions',
    href: '/settings/sessions',
    icon: Smartphone,
  },
  {
    title: 'Change Password',
    href: '/forgot-password',
    icon: Lock,
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const isLgAndSmaller = useMediaQuery('LG_AND_SMALLER')
  const dialogCloseRef = useRef<HTMLButtonElement>(null)
  const { signOut } = useSignOut()

  return (
    <div
      className={cn(
        'w-full pb-2 whitespace-nowrap lg:w-auto',
        isLgAndSmaller && 'overflow-x-auto',
      )}
    >
      <nav className="flex min-w-full items-center space-x-2 pb-2 lg:flex-col lg:items-stretch lg:space-y-1 lg:space-x-0 lg:pb-0">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              pathname === item.href
                ? 'bg-muted hover:bg-muted dark:text-foreground dark:hover:text-foreground/70'
                : 'hover:bg-transparent',
              'justify-start whitespace-nowrap hover:no-underline',
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        ))}

        <Dialog>
          <DialogTrigger asChild>
            <button
              className={cn(
                buttonVariants({ variant: 'destructive' }),
                'justify-start bg-red-700/25 whitespace-nowrap hover:bg-red-600/40 hover:no-underline lg:mt-4',
              )}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign out?</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out of your account?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col gap-4">
              <DialogClose ref={dialogCloseRef} asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  signOut()
                  dialogCloseRef.current?.click()
                }}
              >
                Sign out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  )
}

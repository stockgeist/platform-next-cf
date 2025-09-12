'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSessionStore } from '@/state/session'
import { useServerAction } from 'zsa-react'
import { resendVerificationAction } from '@/app/(auth)/resend-verification.action'
import { toast } from 'sonner'
import { useState } from 'react'
import { EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS } from '@/constants'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import isProd from '@/utils/is-prod'
import { usePathname, useRouter } from 'next/navigation'
import { Route } from 'next'
import useSignOut from '@/hooks/useSignOut'

const pagesToBypass: Route[] = [
  '/verify-email',
  '/sign-in',
  '/sign-up',
  '/',
  '/privacy',
  '/terms',
  '/reset-password',
  '/forgot-password',
]

export function EmailVerificationDialog() {
  const { session } = useSessionStore()
  const [lastResendTime, setLastResendTime] = useState<number | null>(null)
  const pathname = usePathname()
  const { signOut } = useSignOut()
  const router = useRouter()

  const { execute: resendVerification, status } = useServerAction(
    resendVerificationAction,
    {
      onError: (error) => {
        toast.dismiss()
        toast.error(error.err?.message)
      },
      onStart: () => {
        toast.loading('Sending verification email...')
      },
      onSuccess: () => {
        toast.dismiss()
        toast.success('Verification email sent')
        setLastResendTime(Date.now())
      },
    },
  )

  // Don't show the dialog if the user is not logged in, if their email is already verified,
  // or if we're on the verify-email page
  if (
    !session ||
    session.user.emailVerified ||
    pagesToBypass.includes(pathname as Route)
  ) {
    return null
  }

  const canResend = !lastResendTime || Date.now() - lastResendTime > 60000 // 1 minute cooldown
  const isLoading = status === 'pending'

  return (
    <Dialog
      open
      modal
      onOpenChange={(newState) => {
        if (newState === false) {
          toast.warning('Please verify your email before you continue')
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            Please verify your email address to access all features. We sent a
            verification link to {session.user.email}. The verification link
            will expire in{' '}
            {Math.floor(EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS / 3600)}{' '}
            hours.
            {!isProd && (
              <Alert variant="destructive" className="mt-4 mb-2">
                <AlertTitle>Development mode</AlertTitle>
                <AlertDescription>
                  You can find the verification link in the console.
                </AlertDescription>
              </Alert>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => resendVerification()}
            disabled={isLoading || !canResend}
          >
            {isLoading
              ? 'Sending...'
              : !canResend
                ? 'Please wait 1 minute before resending'
                : 'Resend verification email'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              signOut().then(() => {
                router.push('/')
              })
            }}
          >
            Sign out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

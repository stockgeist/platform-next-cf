import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useConfigStore } from '@/state/config'
import Google from '@/icons/google'
import { Skeleton } from '@/components/ui/skeleton'

export default function SSOButtons({
  isSignIn = false,
}: {
  isSignIn?: boolean
}) {
  const { isGoogleSSOEnabled } = useConfigStore()

  if (isGoogleSSOEnabled === null) {
    return <Skeleton className="h-[44px] w-full" />
  }

  return (
    <>
      {isGoogleSSOEnabled && (
        <>
          <Button className="w-full" asChild size="lg">
            <Link href="/sso/google">
              <Google className="mr-1 h-[22px] w-[22px]" />
              {isSignIn ? 'Sign in with Google' : 'Sign up with Google'}
            </Link>
          </Button>
        </>
      )}
    </>
  )
}

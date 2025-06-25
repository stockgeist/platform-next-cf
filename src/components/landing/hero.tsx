import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ShinyButton from '@/components/ui/shiny-button'
import { getTotalUsers } from '@/utils/stats'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function Hero() {
  return (
    <div className="relative isolate pt-14 dark:bg-gray-900">
      <div className="pt-20 pb-24 sm:pt-20 sm:pb-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-10 flex flex-wrap justify-center gap-4">
              <ShinyButton className="rounded-full bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 ring-inset dark:text-indigo-400">
                Shiny Button
              </ShinyButton>
              <Suspense fallback={<TotalUsersButtonSkeleton />}>
                <TotalUsersButton />
              </Suspense>
            </div>
            <h1 className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              Hero section
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-8">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rerum,
              vitae cupiditate repudiandae, dignissimos dolorum, quae ducimus
              exercitationem explicabo quasi autem voluptates? Similique id
              expedita facilis sint. Asperiores unde provident omnis.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4 md:gap-x-6">
              {/* <a href={GITHUB_REPO_URL} target="_blank"> */}
              <Button size="lg" className="rounded-full">
                Button{' '}
              </Button>
              {/* </a> */}
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="rounded-full">
                  Try Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// This component will be wrapped in Suspense
async function TotalUsersButton() {
  const totalUsers = await getTotalUsers()

  if (!totalUsers) return null

  return (
    <ShinyButton className="rounded-full bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20 ring-inset dark:text-purple-400">
      {totalUsers} Users & Growing
    </ShinyButton>
  )
}

// Skeleton fallback for the TotalUsersButton
function TotalUsersButtonSkeleton() {
  return (
    <div className="rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium ring-1 ring-purple-500/20 ring-inset">
      <Skeleton className="h-5 w-32" />
    </div>
  )
}

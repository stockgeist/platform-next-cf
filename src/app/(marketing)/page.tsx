import type { Metadata } from 'next'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { SITE_NAME, SITE_DESCRIPTION } from '@/constants'

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
    </main>
  )
}

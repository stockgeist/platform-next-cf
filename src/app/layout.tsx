import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'server-only'

import {
  ProgressProvider,
  ThemeProvider,
  AudioPlayerProvider,
} from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/constants'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    'NLP',
    'speech to text',
    'text to speech',
    'sentiment analysis',
    'entity extraction',
    'NLP Platform',
  ],
  authors: [{ name: 'Neurotechnology' }],
  creator: 'Neurotechnology',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: '@Neurotechnology',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AudioPlayerProvider>
            <ProgressProvider>
              <TooltipProvider delayDuration={100} skipDelayDuration={50}>
                {children}
              </TooltipProvider>
            </ProgressProvider>
          </AudioPlayerProvider>
        </ThemeProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
          expand
          duration={7000}
        />
      </body>
    </html>
  )
}

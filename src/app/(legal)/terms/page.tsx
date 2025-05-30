import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CREDITS_EXPIRATION_YEARS } from '@/constants'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read our terms of service and usage agreement',
}

export default function TermsPage() {
  return (
    <>
      <h1 className="mb-8 text-4xl font-bold text-foreground">
        Terms of Service
      </h1>

      <p className="mb-6 text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          1. Acceptance of Terms
        </h2>
        <p className="text-muted-foreground">
          By accessing and using this website, you accept and agree to be bound
          by the terms and provision of this agreement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          2. Use License
        </h2>
        <p className="text-muted-foreground">
          Permission is granted to temporarily download one copy of the
          materials (information or software) on our website for personal,
          non-commercial transitory viewing only.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          3. Disclaimer
        </h2>
        <p className="text-muted-foreground">
          The materials on our website are provided on an &apos;as is&apos;
          basis. We make no warranties, expressed or implied, and hereby
          disclaim and negate all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          4. Credit System and Payments
        </h2>
        <p className="mb-4 text-muted-foreground">
          Our service operates on a credit-based system. Credits purchased
          through our platform are valid for {CREDITS_EXPIRATION_YEARS} years
          from the date of purchase. All payments are processed securely through
          Stripe, our payment processing partner.
        </p>
        <p className="mb-4 text-muted-foreground">
          Once a payment is successfully processed, credits will be immediately
          added to your account. We do not offer refunds for purchased credits.
          The price and availability of credit packages may change without prior
          notice.
        </p>
        <p className="text-muted-foreground">
          Free credits may be provided as part of promotional offers or monthly
          allocations. These credits are subject to different terms and
          expiration periods, which will be clearly communicated at the time
          they are issued.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          5. Limitations
        </h2>
        <p className="text-muted-foreground">
          In no event shall we or our suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use the materials on our website.
        </p>
      </section>

      <div className="mt-12 text-center">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </>
  )
}

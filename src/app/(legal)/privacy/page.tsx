import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your data',
}

export default function PrivacyPage() {
  return (
    <>
      <h1 className="mb-8 text-4xl font-bold text-foreground">
        Privacy Policy
      </h1>

      <p className="mb-6 text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          1. Information We Collect
        </h2>
        <p className="text-muted-foreground">
          We collect information you provide directly to us, including but not
          limited to your name, email address, and any other information you
          choose to provide.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          2. How We Use Your Information
        </h2>
        <p className="text-muted-foreground">
          We use the information we collect to:
        </p>
        <ul className="mt-2 list-disc pl-6 text-muted-foreground">
          <li>Provide, maintain, and improve our services</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Protect against fraud and abuse</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          3. Data Security
        </h2>
        <p className="text-muted-foreground">
          We take reasonable measures to help protect information about you from
          loss, theft, misuse and unauthorized access, disclosure, alteration,
          and destruction.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          4. Contact Us
        </h2>
        <p className="text-muted-foreground">
          If you have any questions about this Privacy Policy, please contact us
          at:
          <br />
          Email: privacy@example.com
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

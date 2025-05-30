import NavFooterLayout from '@/layouts/NavFooterLayout'
import { type ReactNode } from 'react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <NavFooterLayout>
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl bg-muted/50 px-6 py-12 shadow-lg">
          <div className="prose prose-gray max-w-none dark:prose-invert">
            {children}
          </div>
        </div>
      </div>
    </NavFooterLayout>
  )
}

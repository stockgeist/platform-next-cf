import NavFooterLayout from '@/layouts/NavFooterLayout'
import { type ReactNode } from 'react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <NavFooterLayout>
      <div className="bg-background min-h-screen px-4 py-12">
        <div className="bg-muted/50 mx-auto max-w-3xl rounded-xl px-6 py-12 shadow-lg">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </NavFooterLayout>
  )
}

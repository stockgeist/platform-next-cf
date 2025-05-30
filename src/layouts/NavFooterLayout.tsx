import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'

export default async function NavFooterLayout({
  children,
  renderFooter = true,
}: Readonly<{
  children: React.ReactNode
  renderFooter?: boolean
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      {renderFooter && <Footer />}
    </div>
  )
}

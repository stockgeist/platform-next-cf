import { AppSidebar } from '@/components/app-sidebar'
import { getSessionFromCookie } from '@/utils/auth'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'
import { NavigationEvents } from '@/components/audio/playbar-navigation-events'
import { Suspense } from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSessionFromCookie()

  if (!session) {
    return redirect('/')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
        <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}

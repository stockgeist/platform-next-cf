import { PageHeader } from '@/components/page-header'

export default function Page() {
  return (
    <>
      <PageHeader
        items={[
          {
            href: '/dashboard',
            label: 'Dashboard',
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 flex aspect-video items-center justify-center rounded-xl">
            Example
          </div>
          <div className="bg-muted/50 flex aspect-video items-center justify-center rounded-xl">
            Example
          </div>
          <div className="bg-muted/50 flex aspect-video items-center justify-center rounded-xl">
            Example
          </div>
        </div>
        <div className="bg-muted/50 flex min-h-screen flex-1 items-center justify-center rounded-xl md:min-h-min">
          Example
        </div>
      </div>
    </>
  )
}

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
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/50">
            Example
          </div>
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/50">
            Example
          </div>
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/50">
            Example
          </div>
        </div>
        <div className="flex min-h-[100vh] flex-1 items-center justify-center rounded-xl bg-muted/50 md:min-h-min">
          Example
        </div>
      </div>
    </>
  )
}

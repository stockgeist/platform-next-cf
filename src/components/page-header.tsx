import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { ChatBubbleIcon } from '@radix-ui/react-icons'

interface BreadcrumbItem {
  href: string
  label: string
}

interface PageHeaderProps {
  items: BreadcrumbItem[]
}

export function PageHeader({ items }: PageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {items.length === 1 ? (
          <h1 className="text-2xl font-bold">{items[0].label}</h1>
        ) : (
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, index) => (
                <React.Fragment key={item.href}>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {index < items.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="px-4">
        <Button variant="outline">
          <ChatBubbleIcon />
          <Link href="https://netgeist.ai/contact">Feedback</Link>
        </Button>
      </div>
    </header>
  )
}

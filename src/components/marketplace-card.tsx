'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import PurchaseButton from '@/components/purchase-button'
import type { PURCHASABLE_ITEM_TYPE } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import { COMPONENTS } from '@/app/(dashboard)/marketplace/components-catalog'

interface MarketplaceCardProps {
  id: string
  name: string
  description: string
  credits: number
  containerClass?: string
  isPurchased: boolean
}

const ITEM_TYPE =
  'COMPONENT' as const satisfies keyof typeof PURCHASABLE_ITEM_TYPE

export function MarketplaceCard({
  id,
  name,
  description,
  credits,
  containerClass,
  isPurchased,
}: MarketplaceCardProps) {
  const component = COMPONENTS.find((c) => c.id === id)
  if (!component) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {isPurchased && <Badge variant="secondary">Purchased</Badge>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="bg-muted/50 flex justify-center p-6">
        <div className={containerClass}>{component.preview()}</div>
      </CardContent>
      <CardFooter className="mt-4 flex justify-between">
        <div className="text-md font-bold lg:text-2xl">{credits} credits</div>
        {!isPurchased && <PurchaseButton itemId={id} itemType={ITEM_TYPE} />}
      </CardFooter>
    </Card>
  )
}

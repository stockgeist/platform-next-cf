'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/utils/format'
import { Check } from 'lucide-react'
import Link from 'next/link'

export const PricingCard = ({
  title,
  price,
  credits,
  features,
  isPopular,
  isFreePlan,
  isCustom,
  onClick,
  badge,
}: {
  title: string
  price: number
  credits: number
  features: string[]
  isPopular?: boolean
  isFreePlan: boolean
  isCustom?: boolean
  onClick?: () => void
  badge?: string
}) => {
  return (
    <div
      className={cn(
        'flex flex-col',
        isPopular && 'bg-teal-5 rounded-md p-1',
        !isPopular && 'bg-card mt-9 mb-1 rounded-md',
      )}
    >
      {isPopular && (
        <div className="text-teal-12 w-full p-2 text-center">
          <p className="text-xs font-semibold">MOST POPULAR</p>
        </div>
      )}
      <Card className="flex-1 shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              {isCustom ? (
                <span className="text-2xl font-semibold">Custom price</span>
              ) : (
                <>
                  <span className="text-3xl font-semibold">{price / 100}</span>
                  <span className="text-foreground">€</span>
                </>
              )}
            </div>
            {badge && <Badge variant="secondary">{badge}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Check className="text-primary h-4 w-4" />
            {formatNumber(credits)} credits.
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Check className="text-primary h-4 w-4" />
            {formatNumber(price / credits)} € per credit.
          </div>
          <div className="text-muted-foreground flex items-start gap-2 text-sm">
            <Check className="text-primary mt-0.5 h-4 w-4" />
            <span>
              {features.map((feature) => (
                <div key={feature}>{feature}</div>
              ))}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          {isFreePlan ? (
            <div className="bg-muted text-muted-foreground w-full rounded-md py-2 text-center text-sm">
              Current plan
            </div>
          ) : isCustom ? (
            <Button asChild className="w-full">
              <Link href={`https://netgeist.ai/contact`}>Contact us</Link>
            </Button>
          ) : (
            <Button className="w-full" onClick={onClick}>
              Buy
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

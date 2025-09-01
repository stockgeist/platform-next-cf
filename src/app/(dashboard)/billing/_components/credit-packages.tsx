'use client'

import { PricingCard } from '@/components/billing/pricing-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CREDIT_PACKAGES, FREE_MONTHLY_CREDITS } from '@/constants'
import { useSessionStore } from '@/state/session'
import { useTransactionStore } from '@/state/transaction'
import { Coins, Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StripePaymentForm } from '@/components/billing/stripe-payment-form'
type CreditPackage = (typeof CREDIT_PACKAGES)[number]

export const getPackageIcon = (index: number) => {
  if (index === 2) return <Zap className="h-6 w-6 text-yellow-500" />
  if (index === 1) return <Sparkles className="h-6 w-6 text-blue-500" />
  return <Coins className="h-6 w-6 text-green-500" />
}

// Calculate savings percentage compared to the first package
const calculateSavings = (pkg: CreditPackage) => {
  const basePackage = CREDIT_PACKAGES[0]
  const basePrice = basePackage.price / basePackage.credits
  const currentPrice = pkg.price / pkg.credits
  const savings = ((basePrice - currentPrice) / basePrice) * 100
  return Math.round(savings)
}

export function CreditPackages() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null,
  )
  const session = useSessionStore((state) => state)
  const transactionsRefresh = useTransactionStore(
    (state) => state.triggerRefresh,
  )
  const sessionIsLoading = session?.isLoading

  const handlePurchase = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setSelectedPackage(null)
    router.refresh()
    transactionsRefresh()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              {sessionIsLoading ? (
                <>
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-24" />
                </>
              ) : (
                <div className="text-3xl font-bold">
                  {session?.session?.user?.currentCredits.toLocaleString()}{' '}
                  credits
                </div>
              )}
            </div>
            <div className="text-muted-foreground text-sm">
              You get {FREE_MONTHLY_CREDITS} free credits every month.
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Top up your credits
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:mt-3">
                Purchase additional credits to use our services. The more
                credits you buy, the better the value.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {CREDIT_PACKAGES.map((pkg) => (
                <PricingCard
                  key={pkg.id}
                  features={pkg.info.features as unknown as string[]}
                  title={pkg.info.title}
                  credits={pkg.credits}
                  price={pkg.price}
                  onClick={() => handlePurchase(pkg)}
                  isFreePlan={false}
                  badge={
                    pkg.price > CREDIT_PACKAGES[0].price
                      ? `Save ${calculateSavings(pkg)}%`
                      : undefined
                  }
                  isPopular={pkg.id === 'pro'}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <StripePaymentForm
              packageId={selectedPackage.id}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
              credits={selectedPackage.credits}
              price={selectedPackage.price}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import { PricingCard } from '@/components/billing/pricing-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CREDIT_PACKAGES } from '@/constants'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StripePaymentForm } from '../../../../components/billing/stripe-payment-form'

type CreditPackage = (typeof CREDIT_PACKAGES)[number]

// Calculate savings percentage compared to the first package
const calculateSavings = (pkg: CreditPackage) => {
  const basePackage = CREDIT_PACKAGES[0]
  const basePrice = basePackage.price / basePackage.credits
  const currentPrice = pkg.price / pkg.credits
  const savings = ((basePrice - currentPrice) / basePrice) * 100
  return Math.round(savings)
}

export function PricingCards() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null,
  )

  const handlePurchase = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setSelectedPackage(null)
    router.refresh()
  }
  const isLargerThanMd = useMediaQuery('MD_AND_LARGER')

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <PricingCard
          title="Free Plan"
          price={0}
          credits={500}
          features={['Access to models']}
          isPopular={false}
          isFreePlan={true}
          badge="Save 50%"
        />
        {CREDIT_PACKAGES.map((pkg) => (
          <PricingCard
            key={pkg.id}
            title={pkg.info.title}
            features={[pkg.info.description]}
            {...pkg}
            isFreePlan={false}
            onClick={() => handlePurchase(pkg)}
            badge={
              pkg.price > CREDIT_PACKAGES[0].price
                ? `Save ${calculateSavings(pkg)}%`
                : undefined
            }
            isPopular={pkg.id === 'pro'}
          />
        ))}
        <PricingCard
          title="Custom Plan"
          price={0}
          credits={500}
          features={['Access to models']}
          isFreePlan={false}
          isCustom={true}
        />
      </div>

      {isLargerThanMd ? (
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
      ) : (
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Purchase Credits</DrawerTitle>
            </DrawerHeader>
            {selectedPackage && (
              <ScrollArea className="overflow-y-auto p-2 pb-4">
                {/* TODO: Fix layout for mobile */}
                <StripePaymentForm
                  packageId={selectedPackage.id}
                  onSuccess={handleSuccess}
                  onCancel={() => setIsDialogOpen(false)}
                  credits={selectedPackage.credits}
                  price={selectedPackage.price}
                />
              </ScrollArea>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

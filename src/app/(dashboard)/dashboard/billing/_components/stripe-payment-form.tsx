'use client'

import { useState, useMemo } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { confirmPayment, createPaymentIntent } from '@/actions/credits.action'
import { useTheme } from 'next-themes'
import { Card, CardContent } from '@/components/ui/card'
import { getPackageIcon } from './credit-packages'
import { CREDITS_EXPIRATION_YEARS } from '@/constants'
import { VatDetailsForm } from './vat-details-form'
import { formatVatAmount } from '@/utils/vat'
import { createInvoiceAction } from '@/actions/invoice.action'

interface StripePaymentFormProps {
  packageId: string
  onSuccess: () => void
  onCancel: () => void
  credits: number
  price: number
}

type FormStep = 'vat' | 'payment'

function PaymentFormContent({
  packageId,
  clientSecret,
  onSuccess,
  onCancel,
  price,
  vatDetails,
}: Omit<StripePaymentFormProps, 'credits' | 'price'> & {
  clientSecret: string
  price: number
  vatDetails: {
    isBusiness: boolean
    vatNumber?: string
    country: string
    vatAmount: number
    totalAmount: number
  }
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
      } else {
        // The payment was successful
        const paymentIntent = await stripe.retrievePaymentIntent(clientSecret)
        if (paymentIntent.paymentIntent) {
          const { success } = await confirmPayment({
            packageId,
            paymentIntentId: paymentIntent.paymentIntent.id,
          })

          if (success) {
            // Create invoice
            await createInvoiceAction({
              packageId,
              amount: price,
              vatAmount: vatDetails.vatAmount,
              totalAmount: vatDetails.totalAmount,
              currency: 'usd',
              paymentIntentId: paymentIntent.paymentIntent.id,
              vatNumber: vatDetails.vatNumber,
              country: vatDetails.country,
              isBusiness: vatDetails.isBusiness,
            })

            toast.success('Payment successful!')
            onSuccess()
          } else {
            toast.error('Payment failed')
          }
        } else {
          throw new Error('No payment intent found')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement />
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="px-8"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  )
}

function PaymentForm({
  packageId,
  onSuccess,
  onCancel,
  credits,
  price,
}: StripePaymentFormProps) {
  const { resolvedTheme: theme } = useTheme()
  const stripePromise = useMemo(
    () =>
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        : null,
    [],
  )

  const [currentStep, setCurrentStep] = useState<FormStep>('vat')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [vatDetails, setVatDetails] = useState<{
    isBusiness: boolean
    vatNumber?: string
    country: string
    vatAmount: number
    totalAmount: number
  }>({
    isBusiness: false,
    country: '',
    vatAmount: 0,
    totalAmount: price,
  })

  const handleVatDetailsSubmit = async () => {
    if (!vatDetails.country) {
      toast.error('Please select your country')
      return
    }

    try {
      const { clientSecret: newClientSecret } = await createPaymentIntent({
        packageId,
        isBusiness: vatDetails.isBusiness,
        vatNumber: vatDetails.vatNumber,
        country: vatDetails.country,
      })
      if (newClientSecret) {
        setClientSecret(newClientSecret)
        setCurrentStep('payment')
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast.error('Failed to create payment with VAT information')
    }
  }

  const renderContent = () => {
    if (currentStep === 'vat') {
      return (
        <div className="space-y-6">
          <VatDetailsForm amount={price} onVatDetailsChange={setVatDetails} />

          {vatDetails.vatAmount > 0 && (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      VAT ({vatDetails.country})
                    </span>
                    <span>${formatVatAmount(vatDetails.vatAmount)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${formatVatAmount(vatDetails.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVatDetailsSubmit}
              disabled={!vatDetails.country}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )
    }

    if (!clientSecret) return null

    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: theme === 'dark' ? 'night' : 'stripe',
          },
        }}
      >
        <PaymentFormContent
          packageId={packageId}
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onCancel={onCancel}
          price={price}
          vatDetails={vatDetails}
        />
      </Elements>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getPackageIcon(credits)}
                <div>
                  <div className="text-2xl font-bold">
                    {credits.toLocaleString()} credits
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">${price}</div>
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Your payment is secure and encrypted. We use Stripe, a trusted
                global payment provider, to process your payment.
              </p>
              <p>
                For your security, your payment details are handled directly by
                Stripe and never touch our servers.
              </p>
              <p>
                Credits will be added to your account immediately after
                successful payment and will be valid for{' '}
                {CREDITS_EXPIRATION_YEARS} years from the purchase date.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderContent()}
    </div>
  )
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  return <PaymentForm {...props} />
}

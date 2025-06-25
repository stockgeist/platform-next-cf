'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { checkVAT, countries } from 'jsvat-next'
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

const paymentFormSchema = z
  .object({
    // VAT form fields
    isBusiness: z.boolean().default(false),
    vatNumber: z.string().optional(),
    country: z
      .object({
        alpha2: z.string(),
        alpha3: z.string(),
        name: z.string(),
      })
      .optional(),
    // Computed VAT fields
    vatAmount: z.number().default(0),
    totalAmount: z.number(),
  })
  .refine(
    (data) => {
      // If business customer, VAT number is required
      if (data.isBusiness && !data.vatNumber) {
        return false
      }
      return true
    },
    {
      message: 'VAT number is required for business customers',
      path: ['vatNumber'],
    },
  )
  .refine(
    (data) => {
      // VAT number validation using jsvat-next for business customers
      if (data.isBusiness && data.vatNumber && data.country) {
        const vatResult = checkVAT(data.vatNumber, countries)

        // Check if the VAT number is valid and matches the selected country
        if (!vatResult.isValid) {
          return false
        }

        // Verify the VAT number belongs to the selected country
        if (
          vatResult.country &&
          vatResult.country.isoCode.short !== data.country.alpha2
        ) {
          return false
        }

        return true
      }
      return true
    },
    {
      message: 'Please enter a valid VAT number for the selected country',
      path: ['vatNumber'],
    },
  )

type PaymentFormData = z.infer<typeof paymentFormSchema>

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

  const { handleSubmit } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  })

  const onSubmit = async () => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      isBusiness: false,
      vatNumber: '',
      country: undefined,
      vatAmount: 0,
      totalAmount: price,
    },
  })

  const isBusiness = form.watch('isBusiness')
  const country = form.watch('country')
  const vatNumber = form.watch('vatNumber')
  const vatAmount = form.watch('vatAmount')
  const totalAmount = form.watch('totalAmount')

  // Get form validation state
  const formState = form.formState
  const isFormValid = formState.isValid && !formState.isSubmitting

  const handleVatDetailsSubmit = async () => {
    if (!country) {
      toast.error('Please select your country')
      return
    }

    try {
      const { clientSecret: newClientSecret } = await createPaymentIntent({
        packageId,
        isBusiness,
        vatNumber,
        country: country.alpha2,
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
          <VatDetailsForm form={form} amount={price} />

          {vatAmount > 0 && (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      VAT ({country?.alpha2})
                    </span>
                    <span>${formatVatAmount(vatAmount)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${formatVatAmount(totalAmount)}</span>
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
              disabled={!isFormValid}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )
    }

    if (!clientSecret) return null

    return (
      <>
        {vatAmount > 0 && (
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    VAT ({country?.alpha2})
                  </span>
                  <span>${formatVatAmount(vatAmount)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${formatVatAmount(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
            vatDetails={{
              isBusiness,
              vatNumber,
              country: country?.alpha2 || '',
              vatAmount,
              totalAmount,
            }}
          />
        </Elements>
      </>
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

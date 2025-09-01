'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { checkVAT, countries as vatCountries } from 'jsvat-next'
import { countries } from 'country-data-list'
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
import { CREDITS_EXPIRATION_YEARS } from '@/constants'
import { VatDetailsForm } from './vat-details-form'
import { createInvoiceAction } from '@/actions/invoice.action'
import { displayInCurency } from '@/utils/money'
import { saveBillingInfo } from '@/actions/billing-info.action'
import { useAction } from 'next-safe-action/hooks'
import { useSessionStore } from '@/state/session'
import { Country } from '../ui/coutry-dropdown'

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
    country: z.object({
      alpha2: z.string(),
      alpha3: z.string(),
      name: z.string(),
    }),
    // Computed VAT fields
    vatAmount: z.number().default(0),
    totalAmount: z.number(),
    saveForFuture: z.boolean().default(false),
    address: z.string().min(1, 'Address is required'),
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
        const vatResult = checkVAT(data.vatNumber, vatCountries)

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

  const onSubmit = async () => {
    if (!stripe || !elements || !clientSecret) {
      return toast.error('Payment failed')
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
              currency: 'eur',
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
    <div className="space-y-8">
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
          type="button"
          onClick={onSubmit}
          disabled={isProcessing || !stripe || !elements}
          className="px-8"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
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
  const { session, fetchSession } = useSessionStore((state) => state)
  console.log('session', session)

  const { execute } = useAction(saveBillingInfo, {
    onSuccess: async () => {
      console.log('saveBillingInfo onSuccess')
      await fetchSession?.()
      console.log('session after fetchSession', session)
    },
  })
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
      isBusiness: session?.user.billingIsBusiness || false,
      vatNumber: session?.user.billingVatNumber || '',
      vatAmount: 0,
      totalAmount: price,
      address: session?.user.billingAddress || '',
      saveForFuture: session?.user.billingAddress ? true : false,
      // ts does not work as expected
      country: session?.user.billingCountry
        ? (countries as unknown as Record<string, Country>)[
            session.user.billingCountry
          ]
        : undefined,
    },
  })

  const isBusiness = form.watch('isBusiness')
  const country = form.watch('country')
  const vatNumber = form.watch('vatNumber')
  const vatAmount = form.watch('vatAmount')
  const totalAmount = form.watch('totalAmount')
  const address = form.watch('address')
  // Get form validation state
  const formState = form.formState
  const isFormValid = formState.isValid && !formState.isSubmitting

  const handleVatDetailsSubmit = async () => {
    // Validate the form using React Hook Form
    const isValid = await form.trigger()
    if (!isValid) {
      if (!country) {
        toast.error('Please select your country')
      } else {
        toast.error('Please fill in all required fields')
      }
      return
    }
    const save = form.getValues('saveForFuture')

    if (save) {
      execute({
        address,
        vatNumber,
        country: country.alpha2,
        isBusiness,
      })
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

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-full flex-1 space-y-6 overflow-y-auto">
        {currentStep === 'vat' ? (
          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="text-2xl font-bold">
                          {credits.toLocaleString()} credits
                        </div>
                      </div>
                    </div>
                    <div className="text-primary text-2xl font-bold">
                      {displayInCurency(price)}
                    </div>
                  </div>
                  <div className="bg-border h-px" />
                  <div className="text-muted-foreground space-y-2 text-xs">
                    <p>
                      Your payment is secure and encrypted. We use Stripe, a
                      trusted global payment provider, to process your payment.
                    </p>
                    <p>
                      For your security, your payment details are handled
                      directly by Stripe and never touch our servers.
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

            {vatAmount > 0 && country && (
              <VatDetails
                price={price}
                vatAmount={vatAmount}
                totalAmount={totalAmount}
                country={country}
              />
            )}

            <VatDetailsForm form={form} amount={price} />
          </div>
        ) : clientSecret ? (
          <div className="space-y-6">
            {country && (
              <VatDetails
                price={price}
                vatAmount={vatAmount}
                totalAmount={totalAmount}
                country={country}
              />
            )}
            <div className="overflow-hidden">
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
                    country: country.alpha2,
                    vatAmount,
                    totalAmount,
                  }}
                />
              </Elements>
            </div>
          </div>
        ) : null}
      </div>

      {currentStep === 'vat' && (
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
      )}
    </div>
  )
}

const VatDetails = ({
  price,
  vatAmount,
  totalAmount,
  country,
}: {
  price: number
  vatAmount: number
  totalAmount: number
  country: PaymentFormData['country']
}) => {
  return (
    <Card className="border-primary/20">
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{displayInCurency(price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              VAT ({country.alpha2})
            </span>
            <span>{displayInCurency(vatAmount)}</span>
          </div>
          <div className="bg-border h-px" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{displayInCurency(totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  return <PaymentForm {...props} />
}

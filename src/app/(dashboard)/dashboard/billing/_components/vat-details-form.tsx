'use client'

import { UseFormReturn } from 'react-hook-form'
import { useEffect } from 'react'
import { checkVAT, countries } from 'jsvat-next'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { calculateVatAmount, getVatRateForCountry } from '@/utils/vat'
import { CountryDropdown } from '@/components/ui/coutry-dropdown'

interface VatDetailsFormProps {
  form: UseFormReturn<{
    isBusiness: boolean
    vatNumber?: string
    country?: {
      alpha2: string
      alpha3: string
      name: string
    }
    vatAmount: number
    totalAmount: number
  }>
  amount: number
}

export function VatDetailsForm({ form, amount }: VatDetailsFormProps) {
  const isBusiness = form.watch('isBusiness')
  const country = form.watch('country')
  const vatNumber = form.watch('vatNumber')

  // Helper function to validate VAT number
  const validateVatNumber = (vat: string, countryCode: string) => {
    if (!vat || !countryCode) return null

    // Basic format check first
    const cleanVat = vat.replace(/[\s\-\.]/g, '').toUpperCase()
    if (!/^[A-Z]{2}[0-9A-Z]+$/.test(cleanVat)) {
      return 'VAT number must start with 2 letters'
    }

    const vatResult = checkVAT(cleanVat, countries)

    if (!vatResult.isValid) {
      return 'Invalid VAT number - please check the format'
    }

    if (vatResult.country && vatResult.country.isoCode.short !== countryCode) {
      return `VAT number belongs to ${vatResult.country.name}, not the selected country`
    }

    return null // Valid
  }

  // Update computed fields when form values change
  useEffect(() => {
    const vatAmount = calculateVatAmount(
      amount,
      country?.alpha2 || '',
      isBusiness,
    )
    const totalAmount = amount + vatAmount

    // Update the computed fields in the form
    form.setValue('vatAmount', vatAmount, { shouldValidate: false })
    form.setValue('totalAmount', totalAmount, { shouldValidate: false })
  }, [isBusiness, country, amount, form])

  const vatRate = country ? getVatRateForCountry(country.alpha2) : 0
  const vatValidationError =
    isBusiness && vatNumber && country
      ? validateVatNumber(vatNumber, country.alpha2)
      : null

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <Form {...form}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="business-toggle">Business Customer</Label>
              <FormField
                control={form.control}
                name="isBusiness"
                render={({ field }) => (
                  <Switch
                    id="business-toggle"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      if (!checked) {
                        form.setValue('vatNumber', '')
                      }
                    }}
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <CountryDropdown
                      defaultValue={field.value?.alpha3 || ''}
                      onChange={(value) => field.onChange(value)}
                      modal={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isBusiness && (
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="vat-number">VAT Number</FormLabel>
                    <FormControl>
                      <Input
                        id="vat-number"
                        placeholder="Enter your VAT number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {vatValidationError && (
                      <p className="text-destructive text-sm">
                        {vatValidationError}
                      </p>
                    )}
                    {vatNumber && !vatValidationError && country && (
                      <p className="text-sm text-green-600">
                        ✓ Valid VAT number for {country.name}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            {country && (
              <div className="bg-muted rounded-lg p-4">
                <div className="space-y-2">
                  {!isBusiness && vatRate > 0 ? (
                    <>
                      <div className="text-muted-foreground text-sm">
                        VAT will be applied at {vatRate * 100}% for{' '}
                        {country.name}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {isBusiness
                        ? 'No VAT will be applied for business customers.'
                        : 'No VAT will be applied for non-EU countries.'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

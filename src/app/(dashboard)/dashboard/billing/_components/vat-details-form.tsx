'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EU_COUNTRIES,
  calculateVatAmount,
  formatVatAmount,
  getVatRateForCountry,
} from '@/utils/vat'

interface VatDetailsFormProps {
  amount: number
  onVatDetailsChange: (details: {
    isBusiness: boolean
    vatNumber?: string
    country: string
    vatAmount: number
    totalAmount: number
  }) => void
}

export function VatDetailsForm({
  amount,
  onVatDetailsChange,
}: VatDetailsFormProps) {
  const [isBusiness, setIsBusiness] = useState(false)
  const [vatNumber, setVatNumber] = useState('')
  const [country, setCountry] = useState('')

  const handleBusinessChange = (checked: boolean) => {
    setIsBusiness(checked)
    if (!checked) {
      setVatNumber('')
    }
    updateVatDetails(checked, vatNumber, country)
  }

  const handleVatNumberChange = (value: string) => {
    setVatNumber(value)
    updateVatDetails(isBusiness, value, country)
  }

  const handleCountryChange = (value: string) => {
    setCountry(value)
    updateVatDetails(isBusiness, vatNumber, value)
  }

  const updateVatDetails = (
    isBusiness: boolean,
    vatNumber: string,
    country: string,
  ) => {
    const vatAmount = calculateVatAmount(amount, country, isBusiness)
    const totalAmount = amount + vatAmount

    onVatDetailsChange({
      isBusiness,
      vatNumber: isBusiness ? vatNumber : undefined,
      country,
      vatAmount,
      totalAmount,
    })
  }

  const vatRate = country ? getVatRateForCountry(country) : 0
  const vatAmount = calculateVatAmount(amount, country, isBusiness)
  const totalAmount = amount + vatAmount

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="business-toggle">Business Customer</Label>
            <Switch
              id="business-toggle"
              checked={isBusiness}
              onCheckedChange={handleBusinessChange}
            />
          </div>

          {isBusiness && (
            <div className="space-y-2">
              <Label htmlFor="vat-number">VAT Number</Label>
              <Input
                id="vat-number"
                placeholder="Enter your VAT number"
                value={vatNumber}
                onChange={(e) => handleVatNumberChange(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {EU_COUNTRIES.map((countryCode) => (
                  <SelectItem key={countryCode} value={countryCode}>
                    {countryCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {country && (
            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2">
                {!isBusiness && vatRate > 0 ? (
                  <>
                    <div className="text-sm text-muted-foreground">
                      VAT will be applied at {vatRate * 100}% for {country}
                    </div>
                    <div className="flex flex-col space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">VAT</span>
                        <span>${formatVatAmount(vatAmount)}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${formatVatAmount(totalAmount)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {isBusiness
                      ? 'No VAT will be applied for business customers.'
                      : 'No VAT will be applied for non-EU countries.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

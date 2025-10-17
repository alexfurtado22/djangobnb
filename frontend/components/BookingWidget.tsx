'use client'

import { useState, useMemo, useEffect } from 'react'
import { useActionState } from 'react'
import type { Property } from '@/lib/api'
import { createBooking, checkAvailability } from '@/app/actions'
import { differenceInDays, format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import type { DateRange, Matcher } from 'react-day-picker'
// --- 1. ADDED IMPORTS for authentication and navigation ---
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BookingWidget({
  property,
  booked_dates = [],
}: {
  property: Property
  booked_dates?: string[]
}) {
  // --- 2. ADDED hooks to get authentication status ---
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const pathname = usePathname()
  // ----------------------------------------------------

  const [state, formAction, isPending] = useActionState(createBooking, {
    errors: {},
    message: '',
  })
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState(1)
  const [availability, setAvailability] = useState<{
    isAvailable: boolean
    message: string
  } | null>(null)

  const { nights, basePrice, serviceFee, totalPrice } = useMemo(() => {
    if (selectedRange?.from && selectedRange?.to) {
      const diff = differenceInDays(selectedRange.to, selectedRange.from)
      if (diff > 0) {
        const base = diff * Number(property.price_per_night)
        const service = base * (property.service_fee_percent / 100)
        const total = base + Number(property.cleaning_fee) + service
        return {
          nights: diff,
          basePrice: base,
          serviceFee: service,
          totalPrice: total,
        }
      }
    }
    return { nights: 0, basePrice: 0, serviceFee: 0, totalPrice: 0 }
  }, [selectedRange, property])

  const isDisabled =
    !selectedRange ||
    nights === 0 ||
    guests < 1 ||
    guests > property.num_guests ||
    !availability?.isAvailable

  const handleGuestDecrement = () => {
    setGuests(Math.max(1, guests - 1))
  }

  const handleGuestIncrement = () => {
    setGuests(Math.min(Number(property.num_guests), guests + 1))
  }

  // Merged and corrected disabled dates logic
  const disabledDates: Matcher[] = useMemo(() => {
    const booked: Matcher[] = booked_dates.map((d) => new Date(d + 'T00:00:00'))
    return [{ before: new Date() }, ...booked]
  }, [booked_dates])

  const bookedDatesAsDates: Date[] = useMemo(() => {
    return booked_dates.map((dateStr) => new Date(dateStr + 'T00:00:00'))
  }, [booked_dates])

  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      setAvailability(null)
      const check = async () => {
        const result = await checkAvailability({
          propertyId: String(property.id),
          startDate: selectedRange.from!,
          endDate: selectedRange.to!,
        })
        setAvailability(result)
      }
      check()
    }
  }, [selectedRange, property.id])

  // --- 3. ADDED check for authentication loading state ---
  // This prevents the wrong UI from flashing on screen
  if (isAuthLoading) {
    return (
      <div className="rounded-xl border p-6 shadow-lg">
        <div className="mx-auto mb-4 h-8 w-1/2 animate-pulse rounded-md bg-gray-200" />
        <div className="mb-6 h-64 animate-pulse rounded-md bg-gray-200" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-300" />
      </div>
    )
  }
  // ------------------------------------------------------

  // --- 4. ADDED conditional rendering based on authentication ---
  if (!isAuthenticated) {
    return (
      <div className="border-surface-2 rounded-xl border p-6 text-center shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Log in to reserve</h3>
        <Link
          href={`/auth/login?redirect=${pathname}`}
          className="block w-full rounded-lg bg-blue-500 p-3 font-bold text-white transition-colors hover:bg-blue-600"
        >
          Log In
        </Link>
      </div>
    )
  }
  // ---------------------------------------------------------

  // If authenticated, render the existing booking form
  return (
    <form action={formAction}>
      <input type="hidden" name="propertyId" value={property.id} />
      <input
        type="hidden"
        name="startDate"
        value={selectedRange?.from ? format(selectedRange.from, 'yyyy-MM-dd') : ''}
      />
      <input
        type="hidden"
        name="endDate"
        value={selectedRange?.to ? format(selectedRange.to, 'yyyy-MM-dd') : ''}
      />
      <input type="hidden" name="numberOfGuests" value={guests} />

      <div className="border-surface-4 space-y-4 rounded-xl border p-6 shadow-lg">
        <p className="text-2xl font-semibold">
          ${property.price_per_night} <span className="text-lg font-normal">/ night</span>
        </p>

        <div className="flex items-center justify-center">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            numberOfMonths={2}
            className="border-surface-4 rounded-md border"
            modifiers={{ booked: bookedDatesAsDates }}
            modifiersClassNames={{
              booked: 'day-booked',
            }}
            disabled={disabledDates}
          />
        </div>

        {selectedRange?.from && (
          <div className="border-surface-4 flex items-center justify-between rounded-lg border p-3 text-sm">
            <div>
              <p className="text-text-1">Check-in</p>
              <p className="font-medium">{format(selectedRange.from, 'MMM dd, yyyy')}</p>
            </div>
            {selectedRange.to && (
              <div className="text-right">
                <p className="text-text-1">Check-out</p>
                <p className="font-medium">{format(selectedRange.to, 'MMM dd, yyyy')}</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-4">
          <div className="border-surface-4 flex items-center justify-between rounded-lg border p-3">
            <div>
              <span className="font-medium">Guests</span>
              <p className="text-text-1 text-xs">Max {property.num_guests}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGuestDecrement}
                disabled={guests <= 1}
                className="border-surface-4 hover:bg-surface-4/50 flex h-8 w-8 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{guests}</span>
              <button
                type="button"
                onClick={handleGuestIncrement}
                disabled={guests >= Number(property.num_guests)}
                className="border-surface-4 hover:bg-surface-4/50 flex h-8 w-8 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {nights > 0 && (
          <div className="border-surface-4 space-y-2 rounded-lg border p-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                ${property.price_per_night} × {nights} night
                {nights > 1 ? 's' : ''}
              </span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Cleaning fee</span>
              <span>${Number(property.cleaning_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t-surface-4 flex justify-between pt-2 text-lg font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        {availability && (
          <p
            className={`mt-2 text-center text-sm font-semibold ${
              availability.isAvailable ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {availability.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || isDisabled}
          className="bg-brand hover:bg-brand/50 mt-4 w-full rounded-lg p-3 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isPending ? 'Reserving...' : 'Reserve'}
        </button>

        {state.message && (
          <p className="mt-2 text-center text-sm font-medium text-green-600">{state.message}</p>
        )}
      </div>
    </form>
  )
}

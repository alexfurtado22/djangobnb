'use client'

import { useState, useMemo, useEffect } from 'react' // --- 1. ADDED useEffect ---
import { useActionState } from 'react'
import type { Property } from '@/lib/api'
import { createBooking, checkAvailability } from '@/app/actions' // --- 2. ADDED checkAvailability ---
import { differenceInDays, format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import type { DateRange, Matcher } from 'react-day-picker'

export function BookingWidget({
  property,
  booked_dates = [],
}: {
  property: Property
  booked_dates?: string[]
}) {
  const [state, formAction, isPending] = useActionState(createBooking, {
    errors: {},
    message: '',
  })

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState(1)

  // --- 3. ADDED state for availability check ---
  const [availability, setAvailability] = useState<{
    isAvailable: boolean
    message: string
  } | null>(null)

  const nights = useMemo(() => {
    if (selectedRange?.from && selectedRange?.to) {
      const diff = differenceInDays(selectedRange.to, selectedRange.from)
      return diff > 0 ? diff : 0
    }
    return 0
  }, [selectedRange])

  const totalPrice = useMemo(
    () => nights * Number(property.price_per_night),
    [nights, property.price_per_night]
  )

  // --- 4. ADDED availability check to isDisabled logic ---
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

  const disabledDates: Matcher[] = useMemo(() => [{ before: new Date() }], [])

  const bookedDatesAsDates: Date[] = useMemo(() => {
    return booked_dates.map((dateStr) => new Date(dateStr + 'T00:00:00'))
  }, [booked_dates])

  // --- 5. ADDED useEffect to call the checkAvailability action ---
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
            <div className="flex justify-between text-sm">
              <span className="text-text-1">
                ${property.price_per_night} × {nights} night
                {nights > 1 ? 's' : ''}
              </span>
              <span className="font-medium">${totalPrice}</span>
            </div>
            <div className="border-t-surface-4 flex justify-between pt-2 text-lg font-bold">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        )}

        {/* --- 6. ADDED UI for availability message --- */}
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

'use server'

import { z } from 'zod'

const availabilitySchema = z.object({
  propertyId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
})

export async function checkAvailability(data: {
  propertyId: string
  startDate: Date
  endDate: Date
}) {
  // 1. Validate the input data
  const validatedFields = availabilitySchema.safeParse(data)
  if (!validatedFields.success) {
    return { isAvailable: false, message: 'Invalid dates provided.' }
  }

  const { propertyId, startDate, endDate } = validatedFields.data

  // Format dates into YYYY-MM-DD strings for the API
  const start = startDate.toISOString().split('T')[0]
  const end = endDate.toISOString().split('T')[0]

  try {
    // 2. Construct the URL and call the Django API
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/property/properties/${propertyId}/check_availability/?start_date=${start}&end_date=${end}`

    const res = await fetch(url)

    if (!res.ok) {
      throw new Error('API request to check availability failed')
    }

    const responseData = await res.json()

    // 3. Return the response from Django
    return {
      isAvailable: responseData.is_available,
      message: responseData.message,
    }
  } catch (error) {
    console.error('Availability check error:', error)
    return { isAvailable: false, message: 'Error connecting to the server.' }
  }
}

// ---- Types ----
type BookingState = {
  errors?: Record<string, string[]>
  message?: string
  booking?: any
}

// ---- Validation Schema ----
const bookingSchema = z.object({
  propertyId: z.string(),
  startDate: z.string().min(1, { message: 'Please select a start date.' }),
  endDate: z.string().min(1, { message: 'Please select an end date.' }),
  numberOfGuests: z.string().min(1, { message: 'Please select number of guests.' }),
})

// ---- Server Action ----
export async function createBooking(
  prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  // 1. Validate form data
  const validatedFields = bookingSchema.safeParse({
    propertyId: formData.get('propertyId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    numberOfGuests: formData.get('numberOfGuests'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // 2. Call your Django backend API
    const res = await fetch(`${process.env.API_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // optionally include auth header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(validatedFields.data),
    })

    if (!res.ok) {
      return {
        errors: { general: ['Failed to create booking. Please try again.'] },
      }
    }

    const booking = await res.json()

    // 3. Return success
    return {
      message: 'Booking successful!',
      booking,
    }
  } catch (error) {
    console.error('Booking error:', error)
    return {
      errors: { general: ['Something went wrong. Please try later.'] },
    }
  }
}

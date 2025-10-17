'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// ====================================================================
// ACTION: Check Availability
// ====================================================================

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
  const validated = availabilitySchema.safeParse(data)
  if (!validated.success) {
    return { isAvailable: false, message: 'Invalid dates provided.' }
  }

  const { propertyId, startDate, endDate } = validated.data
  const start = startDate.toISOString().split('T')[0]
  const end = endDate.toISOString().split('T')[0]

  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/property/properties/${propertyId}/check_availability/?start_date=${start}&end_date=${end}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('API request to check availability failed')
    const responseData = await res.json()
    return { isAvailable: responseData.is_available, message: responseData.message }
  } catch (error) {
    console.error('Availability check error:', error)
    return { isAvailable: false, message: 'Error connecting to the server.' }
  }
}

// ====================================================================
// ACTION: Create Booking
// ====================================================================

type BookingState = { errors?: Record<string, string[]>; message?: string; booking?: any }

const bookingSchema = z.object({
  propertyId: z.string(),
  startDate: z.string().min(1, { message: 'Please select a start date.' }),
  endDate: z.string().min(1, { message: 'Please select an end date.' }),
  numberOfGuests: z.string().min(1, { message: 'Please select number of guests.' }),
})

export async function createBooking(
  prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const validated = bookingSchema.safeParse({
    propertyId: formData.get('propertyId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    numberOfGuests: formData.get('numberOfGuests'),
  })

  if (!validated.success) return { errors: validated.error.flatten().fieldErrors }

  try {
    const cookieStore = await cookies()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/property/bookings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieStore.toString() },
      body: JSON.stringify(validated.data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { errors: { general: [errorData?.detail || 'Failed to create booking.'] } }
    }

    const booking = await res.json()
    return { message: 'Booking successful!', booking }
  } catch (error) {
    console.error('Booking error:', error)
    return { errors: { general: ['Something went wrong. Please try later.'] } }
  }
}

// ====================================================================
// ACTION: Create Property
// ====================================================================

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required.'),
  city: z.string().min(1, 'City is required.'),
  country: z.string().min(1, 'Country is required.'),
  price_per_night: z.coerce.number().min(1, 'Price must be greater than 0.'),
  cleaning_fee: z.coerce.number().min(0, 'Cleaning fee must be 0 or more.'),
  service_fee_percent: z.coerce.number().min(0).max(100).optional(),
  num_guests: z.coerce.number().min(1, 'Must accommodate at least 1 guest.'),
  num_bedrooms: z.coerce.number().min(0, 'Must have at least 0 bedrooms.'),
  num_bathrooms: z.coerce.number().min(0, 'Must have at least 0 bathrooms.'),
  category: z.string().min(1, 'Please select a category.'),
  main_image: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, 'Main image is required.')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Max image size is 5MB.')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .png, and .webp images are accepted.'
    ),
  amenities: z.array(z.string()).optional(),
  gallery_images: z
    .array(z.any())
    .optional()
    .refine(
      (files) => !files || files.every((file) => file instanceof File),
      'Invalid gallery file.'
    ),
})

export async function createProperty(prevState: any, formData: FormData) {
  const validated = propertySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    address: formData.get('address'),
    city: formData.get('city'),
    country: formData.get('country'),
    price_per_night: formData.get('price_per_night'),
    cleaning_fee: formData.get('cleaning_fee'),
    service_fee_percent: formData.get('service_fee_percent'),
    num_guests: formData.get('num_guests'),
    num_bedrooms: formData.get('num_bedrooms'),
    num_bathrooms: formData.get('num_bathrooms'),
    category: formData.get('category'),
    main_image: formData.get('main_image'),
    amenities: formData.getAll('amenities'),
    gallery_images: formData.getAll('gallery_images'),
  })

  if (!validated.success) return { errors: validated.error.flatten().fieldErrors }

  const apiFormData = new FormData()

  // Append files
  apiFormData.append('main_image', validated.data.main_image)
  validated.data.gallery_images?.forEach((file: File) => apiFormData.append('gallery_images', file))

  // Append other fields
  Object.entries(validated.data).forEach(([key, value]) => {
    if (key === 'main_image' || key === 'gallery_images') return
    if (Array.isArray(value)) value.forEach((v) => apiFormData.append(key, String(v)))
    else apiFormData.append(key, String(value))
  })

  console.log('=== Sending to Django ===')
  for (let [key, value] of apiFormData.entries()) {
    if (value instanceof File) console.log(key, `File: ${value.name} (${value.size} bytes)`)
    else console.log(key, value)
  }
  console.log('=========================')

  // --- NO try/catch around redirect ---
  const cookieStore = await cookies()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/property/properties/`, {
    method: 'POST',
    headers: { Cookie: cookieStore.toString() },
    body: apiFormData,
  })

  const responseText = await res.text()
  console.log('Response status:', res.status)
  console.log('Response body:', responseText)

  if (!res.ok) {
    let errorData
    try {
      errorData = JSON.parse(responseText)
    } catch {
      errorData = { detail: responseText }
    }
    return { errors: { _form: [errorData.detail || 'Failed to create property.'] } }
  }

  const newProperty = JSON.parse(responseText)
  console.log('✅ Property created:', newProperty)

  // --- This works correctly in Next.js 14 ---
  redirect(`/properties/${newProperty.id}`)
}

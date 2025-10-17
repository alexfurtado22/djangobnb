'use client'

import { useState, useTransition } from 'react'
import { useActionState } from 'react'
import Image from 'next/image'
import { createProperty } from '@/app/actions'
import type { Category, Amenity } from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import ProtectedRoute from '@/components/ProtectedRoute'

type PropertyFormState = {
  errors?: Record<string, string[]>
  success?: boolean
}

export default function NewPropertyForm({
  categories = [],
  amenities = [],
}: {
  categories?: Category[]
  amenities?: Amenity[]
}) {
  const [state, formAction] = useActionState<PropertyFormState, FormData>(createProperty, {
    errors: {},
  })
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [galleryPreview, setGalleryPreview] = useState<string[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isPending, startTransition] = useTransition()

  // --- Handlers ---
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview)
    setMainImagePreview(URL.createObjectURL(file))
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    if (newFiles.length === 0) return

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setGalleryFiles((prev) => [...prev, ...newFiles])
    setGalleryPreview((prev) => [...prev, ...newPreviews])

    e.target.value = ''
  }

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryPreview[index])
    setGalleryPreview((prev) => prev.filter((_, i) => i !== index))
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Submit ---
  const handleSubmit = (formData: FormData) => {
    // Add gallery files from state to formData
    galleryFiles.forEach((file) => formData.append('gallery_images', file))
    startTransition(() => formAction(formData))
  }

  // --- Loading state if no categories/amenities ---
  if (!categories.length && !amenities.length) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading form data...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">List Your Property</h2>
          <p className="mt-1 text-sm text-gray-600">
            Fill in the details below to list your space on our platform
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <form action={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Cozy downtown apartment with city views"
                  required
                />
                {state?.errors?.title && (
                  <p className="mt-1 text-sm text-red-500">{state.errors.title[0]}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your property, highlighting key features and nearby attractions..."
                  rows={4}
                />
                {state?.errors?.description && (
                  <p className="mt-1 text-sm text-red-500">{state.errors.description[0]}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {state?.errors?.category && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {state.errors.category[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input id="address" name="address" required placeholder="123 Main Street" />
                {state?.errors?.address && (
                  <p className="mt-1 text-sm text-red-500">{state.errors.address[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" required placeholder="San Francisco" />
                  {state?.errors?.city && (
                    <p className="mt-1 text-sm text-red-500">{state.errors.city[0]}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" name="country" required placeholder="United States" />
                  {state?.errors?.country && (
                    <p className="mt-1 text-sm text-red-500">{state.errors.country[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="num_guests">Guests *</Label>
                  <Input
                    id="num_guests"
                    name="num_guests"
                    type="number"
                    min={1}
                    defaultValue={1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="num_bedrooms">Bedrooms *</Label>
                  <Input
                    id="num_bedrooms"
                    name="num_bedrooms"
                    type="number"
                    min={0}
                    defaultValue={1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="num_bathrooms">Bathrooms *</Label>
                  <Input
                    id="num_bathrooms"
                    name="num_bathrooms"
                    type="number"
                    min={0}
                    step={0.5}
                    defaultValue={1}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="price_per_night">Price per Night ($) *</Label>
                  <Input
                    id="price_per_night"
                    name="price_per_night"
                    type="number"
                    step={0.01}
                    min={0}
                    required
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cleaning_fee">Cleaning Fee ($)</Label>
                  <Input
                    id="cleaning_fee"
                    name="cleaning_fee"
                    type="number"
                    step={0.01}
                    min={0}
                    defaultValue={0}
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <Label htmlFor="service_fee_percent">Service Fee (%)</Label>
                  <Input
                    id="service_fee_percent"
                    name="service_fee_percent"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={10}
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities</h3>
              {amenities.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity.id}`}
                        name="amenities"
                        value={String(amenity.id)}
                      />
                      <Label
                        htmlFor={`amenity-${amenity.id}`}
                        className="cursor-pointer font-normal"
                      >
                        {amenity.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No amenities available</p>
              )}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photos</h3>

              <div>
                <Label htmlFor="main_image">Main Image *</Label>
                <Input
                  id="main_image"
                  name="main_image"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  required
                />
                {mainImagePreview && (
                  <div className="relative mt-2 h-48 w-full">
                    <Image
                      src={mainImagePreview}
                      alt="Main preview"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="gallery_images">Gallery Images</Label>
                <Input
                  id="gallery_images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can select multiple images. Selected: {galleryFiles.length}
                </p>
                {galleryPreview.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {galleryPreview.map((url, i) => (
                      <div key={i} className="group relative h-24">
                        <Image
                          src={url}
                          alt={`Gallery preview ${i + 1}`}
                          fill
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Remove image ${i + 1}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            {state?.errors?._form && <p className="text-red-500">{state.errors._form[0]}</p>}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Submitting...' : 'Create Property'}
            </Button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}

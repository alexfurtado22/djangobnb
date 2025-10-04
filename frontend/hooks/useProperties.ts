'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { propertyApi, bookingApi, reviewApi } from '@/lib/api'
import type { Property, Category, Amenity, Booking, Review } from '@/lib/api'

// A generic type for URL query parameters
type ApiParams = Record<string, any>

// =============================================================================
// PROPERTY HOOKS
// =============================================================================

export function useProperties(params: ApiParams = {}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await propertyApi.getProperties(params)
      setProperties(data.results || [])
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to fetch properties'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return { properties, isLoading, error, refetch: fetchProperties }
}

export function useProperty(id: number | string | undefined | null) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = useCallback(async () => {
    if (!id) {
      setProperty(null)
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const data = await propertyApi.getProperty(id)
      setProperty(data)
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to fetch property'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  return { property, isLoading, error, refetch: fetchProperty }
}

export function usePropertyMutations() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const createProperty = async (
    propertyData: FormData
  ): Promise<{ success: boolean; data?: Property; error?: string }> => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await propertyApi.createProperty(propertyData)
      return { success: true, data }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to create property'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProperty = async (
    id: number | string,
    propertyData: Partial<Property> | FormData
  ): Promise<{ success: boolean; data?: Property; error?: string }> => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await propertyApi.updateProperty(id, propertyData)
      return { success: true, data }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to update property'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProperty = async (
    id: number | string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      setError(null)
      await propertyApi.deleteProperty(id)
      return { success: true }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to delete property'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return { createProperty, updateProperty, deleteProperty, isLoading, error }
}

export function usePropertyMetadata() {
  const [categories, setCategories] = useState<Category[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetadata = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [categoriesData, amenitiesData] = await Promise.all([
        propertyApi.getCategories(),
        propertyApi.getAmenities(),
      ])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setAmenities(Array.isArray(amenitiesData) ? amenitiesData : [])
    } catch (err) {
      setError('Failed to fetch metadata')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  return { categories, amenities, isLoading, error, refetch: fetchMetadata }
}

// =============================================================================
// BOOKING & REVIEW HOOKS
// =============================================================================

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await bookingApi.getBookings()
      setBookings(data.results || [])
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to fetch bookings'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const createBooking = async (
    bookingData: Partial<Booking>
  ): Promise<{ success: boolean; data?: Booking; error?: string }> => {
    try {
      setError(null)
      const data = await bookingApi.createBooking(bookingData)
      setBookings((prev) => [...prev, data])
      return { success: true, data }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) &&
          (err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail)) ||
        'Failed to create booking'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteBooking = async (
    id: number | string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await bookingApi.deleteBooking(id)
      setBookings((prev) => prev.filter((booking) => booking.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to delete booking'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return { bookings, isLoading, error, createBooking, deleteBooking, refetch: fetchBookings }
}

export function useReviews(params: ApiParams = {}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await reviewApi.getReviews(params)
      setReviews(data.results || [])
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to fetch reviews'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const createReview = async (
    reviewData: Partial<Review>
  ): Promise<{ success: boolean; data?: Review; error?: string }> => {
    try {
      setError(null)
      const data = await reviewApi.createReview(reviewData)
      setReviews((prev) => [...prev, data])
      return { success: true, data }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to create review'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateReview = async (
    id: number | string,
    reviewData: Partial<Review>
  ): Promise<{ success: boolean; data?: Review; error?: string }> => {
    try {
      setError(null)
      const data = await reviewApi.updateReview(id, reviewData)
      setReviews((prev) => prev.map((review) => (review.id === id ? data : review)))
      return { success: true, data }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to update review'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteReview = async (
    id: number | string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null)
      await reviewApi.deleteReview(id)
      setReviews((prev) => prev.filter((review) => review.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to delete review'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    reviews,
    isLoading,
    error,
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  }
}

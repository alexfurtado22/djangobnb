'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { propertyApi } from '@/lib/api'
import type { Property } from '@/lib/api'

export function useProperty(id: number | string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data: Property = await propertyApi.getProperty(id)
        setProperty(data)
      } catch (err) {
        const errorMessage =
          (axios.isAxiosError(err) && err.response?.data?.detail) || 'Failed to fetch property'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchProperty()
  }, [id])

  return { property, isLoading, error }
}

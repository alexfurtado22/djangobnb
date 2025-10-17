'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { propertyApi } from '@/lib/api'
import type { Property } from '@/lib/api'

export function useProperty(id: number | string | null) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = useCallback(async () => {
    if (id === null || id === undefined) return

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
  }, [id]) // ✅ Only depends on the primitive `id`

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  return { property, isLoading, error, refetch: fetchProperty }
}

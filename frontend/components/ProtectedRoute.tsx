'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import type { User } from '@/lib/api'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getUser()
        setUser(data)
      } catch {
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (isLoading) {
    return <p>Loading...</p> // Or a spinner component
  }

  if (!user) {
    return null // User will be redirected
  }

  return <>{children}</>
}

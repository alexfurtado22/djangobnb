'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginCredentials } from '@/lib/api'
import { toast } from 'react-hot-toast' // 1. Import toast
import Load from '@/components/Load'

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    email: '',
    password: '',
  })
  // 2. The local error state is no longer needed
  // const [error, setError] = useState('')

  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(credentials)

    if (result.success) {
      // 3. Show a success toast notification
      toast.success('Successfully logged in!')
      router.push('/')
    } else {
      // 4. Show an error toast notification
      toast.error(result.error || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
      {/* 5. The old error message div is removed from here */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />

        <input
          type="text"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Load className="animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  )
}

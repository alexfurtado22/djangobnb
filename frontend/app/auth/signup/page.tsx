'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { RegistrationData } from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function Register() {
  const [userData, setUserData] = useState<RegistrationData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
  })
  const { register, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userData.password1 !== userData.password2) {
      toast.error('Passwords do not match')
      return
    }

    const result = await register(userData)

    if (result.success) {
      toast.success('Account created successfully!')
      router.push('/')
    } else {
      toast.error(result.error || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          name="password1"
          placeholder="Password"
          value={userData.password1}
          onChange={(e) => setUserData({ ...userData, password1: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          name="password2"
          placeholder="Confirm Password"
          value={userData.password2}
          // FIX: Corrected the typo from 'e.gittarget' to 'e.target'
          onChange={(e) => setUserData({ ...userData, password2: e.target.value })}
          className="mb-4 w-full rounded border p-2"
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-full rounded bg-green-500 p-2 text-white hover:bg-green-600 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}

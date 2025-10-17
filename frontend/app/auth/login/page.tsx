'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginCredentials } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Load from '@/components/Load'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Eye, EyeOff, Lock, Mail, User, Home } from 'lucide-react'

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(credentials)

    if (result.success) {
      toast.success('Successfully logged in!')
      router.push(redirectTo as Route)
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="section border-surface-4 col-span-full mx-auto grid max-w-7xl grid-cols-2 justify-center overflow-hidden rounded-2xl border shadow max-md:grid-cols-1">
      {/* Left Panel */}
      <div className="text-text-1 relative col-span-1 min-h-[20rem] p-10 text-center">
        <Image
          src="/images/login-bg.jpg"
          alt="Soft pastel background"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="absolute inset-0 h-full w-full rounded-md object-cover opacity-50"
        />
        <div className="relative z-10">
          <h3 className="mb-4 text-2xl font-semibold">Welcome to Airbnb</h3>
          <p className="opacity-90">A peaceful place to connect, create, and collaborate.</p>
        </div>
      </div>
      {/* Right Panel (Form) */}
      <div className="col-span-1 p-10">
        <div className="mb-6 flex items-center justify-center">
          <Logo className="h-20 w-20" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">Log in to Your Portal</h1>
        <p className="text-text-2 mb-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-brand hover:text-brand/80 font-semibold underline"
          >
            Sign Up
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="text-text-3 h-5 w-5" />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="text-text-1 w-full rounded border p-2 pl-10"
              required
              disabled={isLoading}
            />
          </div>

          {/* Email Field */}
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="text-text-3 h-5 w-5" />
            </div>
            <input
              type="text"
              name="email"
              placeholder="Email"
              autoComplete="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="text-text-1 w-full rounded border p-2 pl-10"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="relative mb-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="text-text-3 h-5 w-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="text-text-1 w-full rounded border p-2 pr-10 pl-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="text-text-3 hover:text-text-1 h-5 w-5" />
              ) : (
                <Eye className="text-text-3 hover:text-text-1 h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="bg-brand hover:bg-brand/60 mb-4 flex w-full items-center justify-center gap-2 rounded p-2 text-white disabled:bg-gray-400"
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

          {/* Browse Properties Link */}
          <div className="text-center">
            <Link
              href="/properties"
              className="text-text-2 hover:text-brand inline-flex items-center gap-2 text-sm transition-colors"
            >
              <Home className="h-4 w-4" />
              Browse Properties
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

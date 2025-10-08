import Logo from '@/components/Logo'
import Link from 'next/link'
import React from 'react'

export const metadata = {
  title: 'Page Not Found',
}

const NotFound = () => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <Logo className="mb-2 animate-pulse" />
      <h1 className="mb-2 text-6xl font-bold">404</h1>
      <h2 className="mb-4 text-2xl">Oops! Page not found.</h2>
      <p className="mb-4 max-w-md text-center">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Link
        href="/"
        className="bg-brand hover:bg-brand/50 rounded-lg px-10 py-6 text-sm text-white transition-all duration-300"
        aria-label="Go back to homepage"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFound

'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import React from 'react'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAuthPage = pathname.startsWith('/auth')

  if (isAuthPage) {
    // Login/Signup pages: full height with footer at bottom
    return (
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  }

  // Default site layout with Header and Footer
  return (
    <div className="holder grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header />
      <main className="col-span-2 grid grid-cols-1">{children}</main>
      <Footer />
    </div>
  )
}

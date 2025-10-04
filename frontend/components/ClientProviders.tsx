'use client'

import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import ThemeProvider from './ThemeProvider'
import api from '@/lib/api'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Fetch CSRF token once on client
  useEffect(() => {
    api.get('/useraccount/csrf/').catch(console.error)
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
        {/* 🔥 Toasts mounted globally */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111827',
              color: '#f3f4f6',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              fontWeight: 500,
            },
            success: {
              style: {
                background: '#22c55e',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#22c55e',
              },
            },
            error: {
              style: {
                background: '#f87171',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#f87171',
              },
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  )
}

import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './global.css'
import './shadcn.css'
import ClientProviders from '@/components/ClientProviders'
import LayoutClient from '@/components/LayoutClient' // client wrapper
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'

const inter = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          {/* Client wrapper will decide to show Header/Footer */}
          <LayoutClient>{children}</LayoutClient>
        </ClientProviders>
      </body>
    </html>
  )
}

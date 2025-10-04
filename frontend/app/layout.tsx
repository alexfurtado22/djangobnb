import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './global.css'
import './shadcn.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientProviders from '@/components/ClientProviders' // new wrapper
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
    template: `%s | ${APP_NAME}`, // Used everywhere else
    default: APP_NAME, // Homepage fallback
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <div className="holder grid min-h-dvh grid-rows-[auto_1fr_auto]">
            <Header />
            <main className="col-span-2 grid grid-cols-1 items-center justify-center">
              {children}
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}

import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="border-surface-3 col-span-2 mt-16 border-t px-4 py-10 text-center text-sm">
      <div className="mx-auto max-w-screen-xl space-y-8">
        <p>
          &copy; {year} {APP_NAME}. All rights reserved..
        </p>
        <nav className="flex justify-center gap-4">
          <Link href="/about" className="hover:text-sky-600">
            About
          </Link>
          <Link href="/contact" className="hover:text-sky-600">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-sky-600">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer

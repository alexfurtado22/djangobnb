'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import Hamburger from '../public/icons/bar.svg'
import CloseIcon from '../public/icons/x.svg'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

// 1. Import Shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const Header = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  // 2. Unnecessary state and ref for desktop dropdown are removed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  const navLinks = [
    { href: '/host/new', label: 'List Your Space' },
    { href: '/properties', label: 'Properties' },
  ] as const

  const userMenuLinks = [
    { href: '/trips', label: 'My Trips' },
    { href: '/listings', label: 'My Listings' },
    { href: '/account', label: 'My Account' },
  ] as const

  // 3. Cleaned up handleLogout
  const handleLogout = async () => {
    await logout()
    setIsMobileMenuOpen(false)
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 4. Cleaned up useEffect to only handle the mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 5. Cleaned up Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
  }, [isMobileMenuOpen])

  return (
    <header className="col-span-2">
      <nav className="flex items-center justify-between px-6 py-4">
        <Logo className="max-md:hidden" />

        <div className="flex items-center gap-6 max-sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? 'text-brand text-sm font-bold'
                  : 'text-text-1 hover:text-brand/60 text-sm transition duration-300'
              }
            >
              {link.label}
            </Link>
          ))}

          {/* 6. Theme switcher is now correctly inside the desktop nav */}
          <ThemeSwitcher id="desktop-theme-switcher" />

          {/* 7. This entire block is now the Shadcn DropdownMenu */}
          {isLoading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  className="relative h-10 w-10 rounded-full focus-visible:ring-sky-500"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{user?.username}</p>
                    <p className="text-muted-foreground text-xs leading-none">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenuLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        <button
          ref={mobileButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="hover:text-text-1/50 flex h-10 w-10 items-center justify-center rounded-md transition-all duration-500 sm:hidden"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <Hamburger className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`bg-surface-1 fixed inset-0 top-[72px] z-40 transform px-6 py-6 shadow-lg transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0'
        }`}
      >
        <div
          className="flex cursor-pointer items-center justify-center"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Logo className="text-brand mb-4 h-8 w-auto" />
        </div>
        <div className="space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-semibold text-gray-700 hover:text-sky-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 max-sm:flex-col">
            <label
              htmlFor="mobile-theme-switcher"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Select theme:
            </label>
            <ThemeSwitcher id="mobile-theme-switcher" label="Select theme:" />
          </div>
          {!isAuthenticated && (
            <div className="space-y-3 border-t pt-4">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-semibold text-gray-700 hover:text-sky-600"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full rounded-full bg-sky-500 px-4 py-3 text-center text-base font-semibold text-white hover:bg-sky-600"
              >
                Sign Up
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="space-y-3 border-t pt-4">
              {userMenuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-semibold text-gray-700 hover:text-sky-600"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-base font-semibold text-gray-700 hover:text-sky-600"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

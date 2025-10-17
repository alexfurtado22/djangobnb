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
import { LiveSearch } from './LiveSearch'

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

  const filteredNavLinks = navLinks.filter((link) => link.href !== '/host/new' || isAuthenticated)

  // Add this state near your other useState hooks
  const [isUserSubMenuOpen, setIsUserSubMenuOpen] = useState(false)

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
          {filteredNavLinks.map((link) => (
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
      <div className="section flex items-center justify-center max-sm:hidden">
        <LiveSearch />
      </div>

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
          {/* General links available to everyone */}
          {filteredNavLinks.map((link) => (
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
            <ThemeSwitcher id="mobile-theme-switcher" label="Select theme:" />
          </div>

          {/* --- UPGRADED AUTHENTICATION SECTION --- */}
          <div className="border-t pt-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                {/* Interactive Trigger */}
                <button
                  onClick={() => setIsUserSubMenuOpen(!isUserSubMenuOpen)}
                  className={`focus-visible:ring-brand focus-visible:ring-offset-surface-1 flex w-full items-center justify-between rounded-md p-2 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-brand flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user?.username}</span>
                      <span className="text-muted-foreground text-xs">{user?.email}</span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                      isUserSubMenuOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Animated Sub-Menu with staggered links */}
                <div
                  className={`overflow-hidden pl-4 transition-all duration-300 ease-in-out ${
                    isUserSubMenuOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="flex flex-col space-y-2 border-l py-2 pl-6">
                    {userMenuLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block transform text-base font-semibold text-gray-700 transition duration-300 hover:text-sky-600 ${
                          isUserSubMenuOpen
                            ? 'translate-x-0 opacity-100'
                            : '-translate-x-2 opacity-0'
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className={`block w-full transform text-left text-base font-semibold text-gray-700 transition duration-300 hover:text-sky-600 ${
                        isUserSubMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                      }`}
                      style={{ transitionDelay: `${userMenuLinks.length * 100}ms` }}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Logged-out users
              <div className="space-y-3">
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
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

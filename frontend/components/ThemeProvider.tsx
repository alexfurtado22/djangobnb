'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type ThemeContextType = {
  theme: string
  setTheme: (t: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')

  // Add data-theme to <body>
  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

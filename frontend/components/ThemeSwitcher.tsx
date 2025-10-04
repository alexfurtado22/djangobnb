'use client'

import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

type ThemeSwitcherProps = {
  id?: string
  label?: string
  className?: string
}

export function ThemeSwitcher({ id = 'theme-switcher', label, className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className={`bg-surface-2 border-surface-3 h-fit w-fit rounded-lg border px-2 py-1 text-xs focus:ring-0 focus:outline-none ${className ?? ''}`}
      >
        <option value="light">Light ☀️</option>
        <option value="dark">Dark 🌙</option>
        <option value="lime">Lime 🌿</option>
        <option value="blue">Blue 🌊</option>
        <option value="dim">Dim 🌫️</option>
        <option value="grape">Grape 🍇</option>
        <option value="choco">Choco 🍫</option>
        <option value="auto">Auto 🖥️</option>
      </select>
    </div>
  )
}

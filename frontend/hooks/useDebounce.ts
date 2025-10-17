// hooks/useDebounce.ts

import { useState, useEffect } from 'react'

// This hook takes a value and a delay, and returns a "debounced" version of that value.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timer if the value changes before the delay is over
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Only re-run if value or delay changes

  return debouncedValue
}

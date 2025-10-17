// components/LiveSearch.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import { propertyApi } from '@/lib/api'
import type { Property } from '@/lib/api'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import MagnifyingIcon from './Magnifying'

export function LiveSearch() {
  const router = useRouter()

  // 1. State Management
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 2. Debounce the search query
  const debouncedQuery = useDebounce(query, 300) // 300ms delay

  // 3. Fetch search results when the debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }

    async function fetchResults() {
      setIsLoading(true)
      try {
        const response = await propertyApi.getProperties({ search: debouncedQuery })
        setResults(response.items)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // 4. Handle navigation and closing the popover
  const handleSelect = useCallback(
    (propertyId: number) => {
      router.push(`/properties/${propertyId}`)
      setIsOpen(false)
    },
    [router]
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-surface-2 border-surface-3 hover:bg-surface-3 w-[300px] justify-start border"
        >
          <MagnifyingIcon className="mr-2" />
          Search destinations...
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-surface-2 text-text-1 border-surface-3 w-[300px] p-0"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search city, country, or title..."
            value={query}
            onValueChange={setQuery}
            className="text-text-1"
          />
          <CommandList>
            {isLoading && <CommandLoading>Searching...</CommandLoading>}
            {!isLoading && results.length === 0 && debouncedQuery.length > 1 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Properties">
                {results.map((property) => (
                  <CommandItem
                    key={property.id}
                    onSelect={() => handleSelect(property.id)}
                    value={`${property.title} ${property.city} ${property.country}`}
                    className="bg-surface-2 text-text-1"
                  >
                    <span>
                      {property.title} in {property.city}, {property.country}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

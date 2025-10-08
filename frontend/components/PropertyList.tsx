'use client'

import { useProperties } from '@/hooks/useProperties'
import type { Property } from '@/lib/api'
import { PropertyCard } from '@/components/PropertyCard'

export default function PropertyList() {
  const { properties, isLoading, error } = useProperties()

  if (isLoading) return <div>Loading properties...</div>
  if (error) return <div>Error: {String(error)}</div>

  return (
    <div className="p-5">
      <h1 className="mb-6 text-2xl font-bold">Properties ({properties.length})</h1>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 max-lg:grid-cols-1">
        {properties.map((property: Property, index: number) => (
          <PropertyCard key={property.id} property={property} index={index} />
        ))}
      </div>
    </div>
  )
}

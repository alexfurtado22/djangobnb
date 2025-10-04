'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { propertyService, Property, ApiResponse } from '../services/propertyService'

// Renamed from Home to PropertyList
export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    propertyService
      .getProperties()
      .then((data: ApiResponse) => {
        console.log('API Response:', data)
        setProperties(data.results)
        setLoading(false)
      })
      .catch((error) => {
        console.error('API Error:', error)
        setError(error.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading properties...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-5">
      <h1 className="mb-6 text-2xl font-bold">Properties ({properties.length})</h1>

      {properties.map((property, index) => (
        <div key={property.id} className="mb-4 rounded-md border border-gray-300 p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">{property.title}</h3>

          <p className="text-sm text-gray-700">
            <strong>Location:</strong> {property.city}, {property.country}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Price:</strong> ${property.price_per_night} / night
          </p>
          <p className="mb-3 text-sm text-gray-700">
            <strong>Host:</strong> {property.owner}
          </p>

          {property.main_image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
              <Image
                src={property.main_image}
                alt={property.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw,
                       (max-width: 1200px) 50vw,
                       33vw"
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

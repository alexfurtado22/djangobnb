'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import type { Property } from '@/lib/api'

type PropertyCardProps = {
  property: Property
  index: number
}

export function PropertyCard({ property, index }: PropertyCardProps) {
  return (
    <Link
      key={property.id}
      href={`/properties/${String(property.id)}` as Route}
      aria-label={`View details for ${property.title}`}
      className="border-surface-2 row-span-4 grid grid-rows-subgrid rounded-3xl border p-4 text-center shadow-md transition-shadow hover:shadow-lg"
    >
      <figure className="aspect-[4/3] w-full overflow-hidden rounded-md">
        <Image
          src={property.main_image}
          alt={property.title}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          priority={index < 4}
        />
      </figure>

      <h3 className="mb-2 self-start text-lg font-semibold">{property.title}</h3>

      <p className="self-start text-sm text-gray-700">
        <strong>Location:</strong> {property.city}, {property.country}
      </p>

      <p className="self-end text-sm text-gray-700">
        <strong>Price:</strong> ${property.price_per_night} / night
      </p>
    </Link>
  )
}

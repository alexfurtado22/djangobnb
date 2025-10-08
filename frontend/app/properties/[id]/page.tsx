'use client'

import { useParams } from 'next/navigation'
import { useProperty } from '@/hooks/useProperty'
import Image from 'next/image'
import type { Amenity, PropertyImage, Review } from '@/lib/api'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { property, isLoading, error } = useProperty(id)

  if (isLoading) return <div>Loading property...</div>
  if (error) return <div>Error: {error}</div>
  if (!property) return <div>Property not found</div>

  return (
    <div className="mx-auto grid grid-cols-1 gap-8">
      {/* Left column */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{property.title}</h1>

        {/* Main image */}
        {property.main_image && (
          <Image
            src={property.main_image}
            alt={property.title}
            width={1200}
            height={800}
            className="h-auto w-full rounded-lg object-cover"
            priority
          />
        )}

        {/* Image gallery */}
        {property.images.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 max-lg:grid-cols-1">
            {property.images.map((img: PropertyImage, index) => (
              <div key={img.id} className="relative aspect-[3/2] w-full">
                <Image
                  src={img.image}
                  alt={`${property.title} image ${img.id}`}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0} // LCP optimization // optional, first image above the fold
                />
              </div>
            ))}
          </div>
        )}

        <p>{property.description ?? 'No description available.'}</p>

        <h2 className="text-xl font-semibold">Amenities</h2>
        {property.amenities && property.amenities.length > 0 ? (
          <ul className="list-disc pl-6">
            {property.amenities.map((a: Amenity) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed.</p>
        )}

        <h2 className="text-xl font-semibold">Reviews</h2>
        {property.reviews && property.reviews.length > 0 ? (
          property.reviews.map((r: Review) => (
            <div key={r.id} className="border-b py-2">
              <strong>{r.author}</strong> ({r.rating}/5):
              <p>{r.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {/* Right column - booking */}
      <aside className="border-surface-2 rounded-xl border p-6 shadow-md">
        <p className="mb-4 text-2xl font-bold">
          ${property.price_per_night} <span className="text-base font-normal">/ night</span>
        </p>
        <div className="space-y-2">
          <p>Guests: {property.num_guests}</p>
          <p>Bedrooms: {property.num_bedrooms}</p>
          <p>Bathrooms: {property.num_bathrooms}</p>
        </div>
        <button className="bg-brand hover:bg-brand/50 mt-4 w-full rounded-lg px-4 py-2 font-semibold text-white">
          Reserve
        </button>
      </aside>
    </div>
  )
}

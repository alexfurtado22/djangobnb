'use client'

import { useParams } from 'next/navigation'
import { useProperty } from '@/hooks/useProperty'
import Image from 'next/image'
import type { Amenity, PropertyImage, Review } from '@/lib/api'
import { BookingWidget } from '@/components/BookingWidget'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { property, isLoading, error } = useProperty(id)

  if (isLoading) return <div>Loading property...</div>
  if (error) return <div>Error: {error}</div>
  if (!property) return <div>Property not found</div>

  return (
    <div className="section mx-auto grid grid-cols-1 gap-8">
      {/* Left column */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{property.title}</h1>

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

        {property.images.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 max-lg:grid-cols-1">
            {property.images.map((img: PropertyImage) => (
              <div key={img.id} className="relative aspect-[3/2] w-full">
                <Image
                  src={img.image}
                  alt={`${property.title} image ${img.id}`}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        <p>{property.description ?? 'No description available.'}</p>

        <h2 className="text-xl font-semibold">Amenities</h2>
        {property.amenities.length > 0 ? (
          <ul className="list-disc pl-6">
            {property.amenities.map((a: Amenity) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        ) : (
          <p>No amenities listed.</p>
        )}

        <h2 className="text-xl font-semibold">Reviews</h2>
        {property.reviews.length > 0 ? (
          property.reviews.map((r: Review) => (
            <div key={r.id} className="border-b py-2">
              <strong>{r.author}</strong> ({r.rating}/5):
              <p>{r.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}

        <div className="space-y-2">
          <p>Guests: {property.num_guests}</p>
          <p>Bedrooms: {property.num_bedrooms}</p>
          <p>Bathrooms: {property.num_bathrooms}</p>
        </div>
      </div>

      {/* Right column - booking */}
      <aside>
        <BookingWidget property={property} booked_dates={property.booked_dates} />
      </aside>
    </div>
  )
}

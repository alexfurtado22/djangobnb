// app/host/new/page.tsx
import NewPropertyForm from '@/components/NewPropertyForm' // Adjust path to where your form component is
import { propertyApi } from '@/lib/api'

export default async function NewPropertyPage() {
  // Fetch categories and amenities from Django API
  const [categories, amenities] = await Promise.all([
    propertyApi.getCategories(),
    propertyApi.getAmenities(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <NewPropertyForm categories={categories} amenities={amenities} />
    </div>
  )
}

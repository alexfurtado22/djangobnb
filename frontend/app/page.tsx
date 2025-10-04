import PropertyList from '@/components/PropertyList'

// Now you can add metadata here without any errors!
export const metadata = {
  title: 'Home | Airbnb',
}
export default function Home() {
  return (
    <main>
      <PropertyList />
    </main>
  )
}

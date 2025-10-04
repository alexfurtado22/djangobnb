import api from '../lib/axios'

export interface Property {
  id: number
  title: string
  city: string
  country: string
  price_per_night: number
  main_image: string
  owner: string
  description?: string
  bedrooms?: number
  bathrooms?: number
}

export interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Property[]
}

export interface CreatePropertyData {
  title: string
  description: string
  city: string
  country: string
  price_per_night: number
  bedrooms: number
  bathrooms: number
  main_image?: File
}

export const propertyService = {
  // Public - anyone can view
  getProperties: async (): Promise<ApiResponse> => {
    const response = await api.get('/property/properties/')
    return response.data
  },

  getProperty: async (id: number): Promise<Property> => {
    const response = await api.get(`/property/properties/${id}/`)
    return response.data
  },

  // Authenticated - only logged in users
  createProperty: async (propertyData: CreatePropertyData): Promise<Property> => {
    const formData = new FormData()

    // Convert numbers to strings for FormData
    Object.entries(propertyData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert numbers to strings, leave files and strings as-is
        if (typeof value === 'number') {
          formData.append(key, value.toString())
        } else {
          formData.append(key, value)
        }
      }
    })

    const response = await api.post('/property/properties/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Only property owner
  updateProperty: async (
    id: number,
    propertyData: Partial<CreatePropertyData>
  ): Promise<Property> => {
    const formData = new FormData()

    Object.entries(propertyData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert numbers to strings, leave files and strings as-is
        if (typeof value === 'number') {
          formData.append(key, value.toString())
        } else {
          formData.append(key, value)
        }
      }
    })

    const response = await api.put(`/property/properties/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Only property owner
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/property/properties/${id}/`)
  },
}

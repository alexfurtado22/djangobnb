import api from '../lib/axios'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password1: string
  password2: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  key?: string // For token-based auth
  user?: User
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login/', credentials)
      return response.data
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },

  // Register
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/registration/', userData)
      return response.data
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/')
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/user/')
      return response.data
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },

  // Password reset
  async passwordReset(email: string): Promise<void> {
    try {
      await api.post('/auth/password/reset/', { email })
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },

  // Verify email (if you have email verification)
  async verifyEmail(key: string): Promise<void> {
    try {
      await api.post('/auth/registration/verify-email/', { key })
    } catch (error: any) {
      throw error.response?.data || error.message
    }
  },
}

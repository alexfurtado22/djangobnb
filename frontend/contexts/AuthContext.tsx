'use client'

import { createContext, useContext, useState, useEffect, ReactNode, FC, ComponentType } from 'react'
import axios from 'axios'
import { authApi } from '@/lib/api'
import type { User, LoginCredentials, RegistrationData } from '@/lib/api'

// 1. Define the shape of the context's value for type safety
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegistrationData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<void>
}

// 2. Create the context, initializing with null for a stricter type check
const AuthContext = createContext<AuthContextType | null>(null)

// Define the props for the AuthProvider component
type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  // 3. Add types to the state hooks
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const userData = await authApi.getUser()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      await authApi.login(credentials)
      const userData = await authApi.getUser()
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      let errorMessage = 'Login failed'
      // 4. Type-safe error handling
      if (axios.isAxiosError(error) && error.response) {
        errorMessage =
          error.response.data?.detail || error.response.data?.non_field_errors?.[0] || errorMessage
      }
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegistrationData) => {
    try {
      setIsLoading(true)
      await authApi.register(userData)
      const newUserData = await authApi.getUser()
      setUser(newUserData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      let errorMessage = 'Registration failed'
      if (axios.isAxiosError(error) && error.response) {
        errorMessage =
          error.response.data?.email?.[0] ||
          error.response.data?.username?.[0] ||
          error.response.data?.password1?.[0] ||
          error.response.data?.non_field_errors?.[0] ||
          errorMessage
      }
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Tell the server to clear cookies / blacklist refresh token
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error) // 401 = already logged out, so it's safe to ignore
    } finally {
      // Always clear local state
      setUser(null)
      setIsAuthenticated(false)

      // ✅ FINAL STEP: Remove the token from storage
      // Make sure 'authToken' is the same key you use when logging in.
      localStorage.removeItem('authToken') // Redirect to login

      window.location.href = '/auth/login'
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 5. Type the custom hook to return the defined context type
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 6. Type the Higher-Order Component (HOC) using generics
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const ProtectedRoute: FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return <div>Loading...</div> // Or a spinner component
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>
    }

    return <WrappedComponent {...(props as P)} />
  }
  return ProtectedRoute
}

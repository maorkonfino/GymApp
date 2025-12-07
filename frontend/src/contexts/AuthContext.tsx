import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthContextType } from '../types'
import api from '../api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in (from localStorage or sessionStorage)
    const savedUser = localStorage.getItem('gym_user') || sessionStorage.getItem('gym_user')
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      
      // Refresh user data from server to get latest role and details
      refreshUserData(parsedUser.email)
    }
  }, [])

  const refreshUserData = async (email: string) => {
    try {
      const response = await api.post('/auth/login-refresh', { email })
      const userData = response.data
      setUser(userData)
      
      // Update in the same storage where it was saved
      if (localStorage.getItem('gym_user')) {
        localStorage.setItem('gym_user', JSON.stringify(userData))
      } else if (sessionStorage.getItem('gym_user')) {
        sessionStorage.setItem('gym_user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      // Keep existing user data if refresh fails
    }
  }

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const userData = response.data
      
      setUser(userData)
      
      // Save to localStorage if "Remember Me" is checked, otherwise sessionStorage
      if (rememberMe) {
        localStorage.setItem('gym_user', JSON.stringify(userData))
        sessionStorage.removeItem('gym_user') // Clear session storage
      } else {
        sessionStorage.setItem('gym_user', JSON.stringify(userData))
        localStorage.removeItem('gym_user') // Clear local storage
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.error || 'נכשל ההתחברות')
    }
  }

  const register = async (name: string, lastName: string, phone: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, lastName, phone, email, password })
      const userData = response.data
      
      setUser(userData)
      localStorage.setItem('gym_user', JSON.stringify(userData))
    } catch (error: any) {
      console.error('Register error:', error)
      throw new Error(error.response?.data?.error || 'נכשלה ההרשמה')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gym_user')
    sessionStorage.removeItem('gym_user')
  }

  const updateProfile = async (name: string, email: string, phone: string) => {
    if (user) {
      try {
        await api.put(`/users/${user.id}`, { name, email, phone })
        const updatedUser = { ...user, name, email, phone }
        setUser(updatedUser)
        
        // Update in the same storage where it was saved
        if (localStorage.getItem('gym_user')) {
          localStorage.setItem('gym_user', JSON.stringify(updatedUser))
        } else if (sessionStorage.getItem('gym_user')) {
          sessionStorage.setItem('gym_user', JSON.stringify(updatedUser))
        }
      } catch (error) {
        console.error('Update profile error:', error)
        throw new Error('נכשל עדכון הפרופיל')
      }
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}


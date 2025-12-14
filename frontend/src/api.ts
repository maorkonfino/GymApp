import axios from 'axios'
import { Registration } from './types'

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Log for debugging
console.log('🔗 API URL:', API_URL)
console.log('🌍 Environment:', import.meta.env.MODE)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API Functions
export const registrationAPI = {
  // Create new registration
  create: async (data: Omit<Registration, 'id' | 'createdAt'>) => {
    const response = await api.post('/registrations', data)
    return response.data
  },

  // Get all registrations
  getAll: async (): Promise<Registration[]> => {
    const response = await api.get('/registrations')
    return response.data
  },

  // Get registrations for a specific user
  getByUser: async (email: string): Promise<Registration[]> => {
    const response = await api.get(`/registrations/user/${email}`)
    return response.data
  },

  // Get registrations by date
  getByDate: async (date: string): Promise<Registration[]> => {
    const response = await api.get(`/registrations/date/${date}`)
    return response.data
  },

  // Get registrations by date range
  getByRange: async (start: string, end: string): Promise<Registration[]> => {
    const response = await api.get('/registrations/range', {
      params: { start, end }
    })
    return response.data
  },

  // Get count of registrations for specific date and time
  getCount: async (date: string, time: string): Promise<number> => {
    const response = await api.get('/registrations/count', {
      params: { date, time }
    })
    return response.data.count
  },

  // Delete registration
  delete: async (id: number): Promise<void> => {
    await api.delete(`/registrations/${id}`)
  },
}

export default api


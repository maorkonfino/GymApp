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
    // Note: Create endpoint expects mixed case - name for full name but camelCase for times
    const backendData = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime
    }
    const response = await api.post('/registrations', backendData)
    return response.data
  },

  // Get all registrations
  getAll: async (): Promise<Registration[]> => {
    const response = await api.get('/registrations')
    // Convert snake_case from backend to camelCase for frontend
    return response.data.map((reg: any) => ({
      ...reg,
      name: reg.full_name,
      startTime: reg.start_time,
      endTime: reg.end_time,
      createdAt: reg.created_at
    }))
  },

  // Get registrations for a specific user
  getByUser: async (email: string): Promise<Registration[]> => {
    const response = await api.get(`/registrations/user/${email}`)
    // Convert snake_case from backend to camelCase for frontend
    return response.data.map((reg: any) => ({
      ...reg,
      name: reg.full_name,
      startTime: reg.start_time,
      endTime: reg.end_time,
      createdAt: reg.created_at
    }))
  },

  // Get registrations by date
  getByDate: async (date: string): Promise<Registration[]> => {
    const response = await api.get(`/registrations/date/${date}`)
    // Convert snake_case from backend to camelCase for frontend
    return response.data.map((reg: any) => ({
      ...reg,
      name: reg.full_name,
      startTime: reg.start_time,
      endTime: reg.end_time,
      createdAt: reg.created_at
    }))
  },

  // Get registrations by date range
  getByRange: async (start: string, end: string): Promise<Registration[]> => {
    const response = await api.get('/registrations/range', {
      params: { start, end }
    })
    // Convert snake_case from backend to camelCase for frontend
    return response.data.map((reg: any) => ({
      ...reg,
      name: reg.full_name,
      startTime: reg.start_time,
      endTime: reg.end_time,
      createdAt: reg.created_at
    }))
  },

  // Get count of registrations for specific date and time
  getCount: async (date: string, time: string): Promise<number> => {
    const response = await api.get('/registrations/count', {
      params: { date, time }
    })
    return response.data.count
  },

  // Update registration
  update: async (id: number, date: string, startTime: string, endTime: string): Promise<void> => {
    // Note: Update endpoint expects camelCase (different from other endpoints)
    await api.put(`/registrations/${id}`, { 
      date, 
      startTime, 
      endTime 
    })
  },

  // Delete registration
  delete: async (id: number): Promise<void> => {
    await api.delete(`/registrations/${id}`)
  },
}

export default api


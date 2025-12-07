import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { registrationAPI } from '../api'
import { Registration } from '../types'
import RegistrationsList from './RegistrationsList'

interface DayViewProps {
  date: Date
  onRegister: () => void
  refreshTrigger?: number
  onEditRegistration?: (registration: Registration) => void
}

const DayView: React.FC<DayViewProps> = ({ date, onRegister, refreshTrigger, onEditRegistration }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)

  const dayName = format(date, 'EEEE', { locale: he })
  const formattedDate = format(date, 'd.M.yyyy')

  useEffect(() => {
    console.log('🔄 DayView refresh triggered:', { date: format(date, 'yyyy-MM-dd'), refreshTrigger })
    fetchRegistrations()
  }, [date, refreshTrigger])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      console.log('🔍 Fetching registrations for date:', dateString)
      const data = await registrationAPI.getByDate(dateString)
      console.log('📊 Received data:', data)
      
      // Transform data to match expected format
      const transformedData = Array.isArray(data) ? data.map((reg: any) => ({
        id: reg.id,
        name: reg.full_name || reg.name,
        email: reg.email,
        phone: reg.phone,
        date: reg.date,
        startTime: reg.start_time || reg.startTime,
        endTime: reg.end_time || reg.endTime,
        createdAt: reg.created_at || reg.createdAt
      })) : []
      
      console.log('✅ Transformed registrations:', transformedData)
      setRegistrations(transformedData)
    } catch (error) {
      console.error('❌ Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onRegister}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          הרשמה לאימון
        </button>
        
        <div className="text-center sm:text-right">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {dayName}, {formattedDate}
          </h2>
          <p className="text-cyan-400 text-xs sm:text-sm mt-1">
            {registrations.length} {registrations.length === 1 ? 'רישום' : 'רישומים'}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">טוען...</p>
        </div>
      ) : registrations.length > 0 ? (
        <RegistrationsList 
          registrations={registrations} 
          onUpdate={fetchRegistrations}
          onEdit={onEditRegistration}
        />
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-dark-hover rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-gray-400 text-base sm:text-lg mb-2">אין אימונים מתוכננים</h3>
          <p className="text-gray-500 text-xs sm:text-sm px-4">לחץ על "הרשמה לאימון" כדי להוסיף אימון חדש</p>
        </div>
      )}
    </div>
  )
}

export default DayView


import React, { useState, useEffect } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { he } from 'date-fns/locale'
import { Registration } from '../types'
import { registrationAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import RegistrationsList from './RegistrationsList'

interface WeekViewProps {
  weekOffset: number
  onWeekChange: (offset: number) => void
  refreshTrigger?: number
}

const WeekView: React.FC<WeekViewProps> = ({ weekOffset, onWeekChange }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const { user, isAdmin } = useAuth()

  // Get week dates
  const getWeekDates = () => {
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 0 })
    const baseDate = addDays(start, weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => addDays(baseDate, i))
  }

  const weekDates = getWeekDates()

  // Fetch registrations for the week
  useEffect(() => {
    fetchRegistrations()
  }, [weekOffset])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const startDate = format(weekDates[0], 'yyyy-MM-dd')
      const endDate = format(weekDates[6], 'yyyy-MM-dd')
      
      console.log('🔍 Fetching week registrations:', startDate, 'to', endDate)
      const data = await registrationAPI.getByRange(startDate, endDate)
      console.log('📊 Received week data:', data)
      
      // Transform data
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
      
      console.log('✅ Transformed week registrations:', transformedData)
      setRegistrations(transformedData)
    } catch (error) {
      console.error('❌ Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  // Group registrations by date
  const registrationsByDate = registrations.reduce((acc, reg) => {
    if (!acc[reg.date]) {
      acc[reg.date] = []
    }
    acc[reg.date].push(reg)
    return acc
  }, {} as Record<string, Registration[]>)

  // Get day name in Hebrew
  const getDayName = (date: Date) => {
    return format(date, 'EEEE', { locale: he })
  }

  // Get registrations count for a day
  const getDayCount = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return registrationsByDate[dateString]?.length || 0
  }


  const handleDayClick = (index: number) => {
    setSelectedDay(selectedDay === index ? null : index)
  }

  const getMonthRange = () => {
    const firstDate = weekDates[0]
    const lastDate = weekDates[6]
    const firstMonth = format(firstDate, 'LLLL', { locale: he })
    const lastMonth = format(lastDate, 'LLLL', { locale: he })
    
    if (firstMonth === lastMonth) {
      return firstMonth
    }
    return `${firstMonth} - ${lastMonth}`
  }

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onWeekChange(weekOffset + 1)}
            className="p-2 hover:bg-dark-hover rounded-lg transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              תצוגה שבועית - {getMonthRange()}
            </h2>
            <p className="text-cyan-400 text-sm mt-1">
              {format(weekDates[0], 'd')} - {format(weekDates[6], 'd בMMMM yyyy', { locale: he })}
            </p>
          </div>
          
          <button
            onClick={() => onWeekChange(weekOffset - 1)}
            className="p-2 hover:bg-dark-hover rounded-lg transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Week Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-dark-hover rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{registrations.length}</div>
            <div className="text-xs text-gray-400 mt-1">סך הרישומים</div>
          </div>
          
          {isAdmin && (
            <>
              <div className="bg-dark-hover rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {new Set(registrations.map(r => r.email)).size}
                </div>
                <div className="text-xs text-gray-400 mt-1">מתאמנים ייחודיים</div>
              </div>
              
              <div className="bg-dark-hover rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Object.keys(registrationsByDate).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">ימים פעילים</div>
              </div>
              
              <div className="bg-dark-hover rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(registrations.length / 7)}
                </div>
                <div className="text-xs text-gray-400 mt-1">ממוצע ליום</div>
              </div>
            </>
          )}
          
          {!isAdmin && user && (
            <div className="bg-dark-hover rounded-lg p-3 text-center col-span-1">
              <div className="text-2xl font-bold text-cyan-400">
                {registrations.filter(r => r.email === user.email).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">האימונים שלי</div>
            </div>
          )}
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {weekDates.map((date, index) => {
          const dateString = format(date, 'yyyy-MM-dd')
          const dayRegistrations = registrationsByDate[dateString] || []
          const isExpanded = selectedDay === index
          const myRegs = isAdmin ? 0 : dayRegistrations.filter(r => r.email === user?.email).length
          const count = getDayCount(date)

          return (
            <div
              key={index}
              className="bg-dark-card border border-dark-border rounded-xl overflow-hidden transition-all hover:border-cyan-500/50"
            >
              {/* Day Header */}
              <button
                onClick={() => handleDayClick(index)}
                className="w-full p-4 hover:bg-dark-hover transition-colors text-right"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-semibold text-sm">
                      {getDayName(date)}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-300">
                    {format(date, 'd.M')}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">{count} רישומים</span>
                  </div>
                  
                  {!isAdmin && myRegs > 0 && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                      {myRegs} שלי
                    </span>
                  )}
                </div>

                {count === 0 && (
                  <p className="text-gray-500 text-xs mt-2">אין רישומים</p>
                )}
              </button>

              {/* Day Details - Expandable */}
              {isExpanded && count > 0 && (
                <div className="border-t border-dark-border p-4 bg-dark-hover/50">
                  <RegistrationsList
                    registrations={dayRegistrations}
                    onUpdate={fetchRegistrations}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {registrations.length === 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-dark-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-gray-400 text-lg mb-2">אין רישומים השבוע</h3>
          <p className="text-gray-500 text-sm">לא נמצאו רישומים לשבוע זה</p>
        </div>
      )}
    </div>
  )
}

export default WeekView


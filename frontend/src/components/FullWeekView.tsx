import React, { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import { Registration } from '../types'
import { registrationAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { X, Calendar, ChevronDown, Users, Edit2, Save } from 'lucide-react'
import { generateTimeSlotRanges } from '../utils/timeSlotRanges'
import { getRestrictionMessage, getAvailableTimeOptions } from '../utils/timeRestrictions'

interface FullWeekViewProps {
  isOpen: boolean
  onClose: () => void
  weekOffset: number
  onWeekChange?: (direction: 'prev' | 'next') => void // Made optional as navigation is disabled
  refreshTrigger?: number
  onCellClick?: (date: Date, timeRange: string) => void
  embedded?: boolean
  onDataChange?: () => void
}

const FullWeekView: React.FC<FullWeekViewProps> = ({ 
  isOpen, 
  onClose, 
  weekOffset, 
  refreshTrigger,
  onCellClick,
  embedded = false,
  onDataChange
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [showAllModal, setShowAllModal] = useState(false)
  const [selectedCellRegistrations, setSelectedCellRegistrations] = useState<Registration[]>([])
  const [showMyWorkoutsModal, setShowMyWorkoutsModal] = useState(false)
  const [myWorkouts, setMyWorkouts] = useState<Registration[]>([])
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<{date: string, startTime: string, endTime: string}>({
    date: '',
    startTime: '',
    endTime: ''
  })
  const { user, isAdmin } = useAuth()

  // Get week dates - Sunday to Saturday with rolling logic
  const getWeekDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset to start of day
    const currentDayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Calculate the Sunday of current week
    const currentSunday = addDays(today, -currentDayOfWeek)
    
    const dates = []
    
    // For each day of the week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      let date = addDays(currentSunday, dayOfWeek)
      
      // If this day has already passed (before today), show next week's same day
      if (dayOfWeek < currentDayOfWeek) {
        date = addDays(date, 7)
      }
      
      dates.push(date)
    }
    
    return dates
  }

  const weekDates = getWeekDates()
  const timeSlotRanges = generateTimeSlotRanges()

  // Week navigation disabled - only showing current 7 days

  useEffect(() => {
    if (isOpen || embedded) {
      fetchRegistrations()
    }
  }, [isOpen, embedded, weekOffset, refreshTrigger])

  // Scroll to top when component mounts, view changes, or week changes
  useEffect(() => {
    if (embedded) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [embedded, weekOffset])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      // Clean up old registrations first
      await registrationAPI.cleanupOld()
      
      // Get week dates for display
      const allDates = weekDates.map(d => d.getTime())
      const minDate = new Date(Math.min(...allDates))
      const maxDate = new Date(Math.max(...allDates))
      
      const startDate = format(minDate, 'yyyy-MM-dd')
      const endDate = format(maxDate, 'yyyy-MM-dd')
      
      const data = await registrationAPI.getByRange(startDate, endDate)
      
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
      
      setRegistrations(transformedData)
    } catch (error) {
      console.error('❌ Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  
  // Get first name only
  const getFirstName = (fullName: string): string => {
    return fullName.split(' ')[0]
  }

  // Handle "Show All" modal
  const handleShowAllClick = (regs: Registration[], e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCellRegistrations(regs)
    setShowAllModal(true)
  }

  // Handle delete registration
  const handleDeleteRegistration = async (regId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הרישום?')) {
      return
    }

    try {
      await registrationAPI.delete(regId)
      // Refresh data
      await fetchRegistrations()
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
      alert('שגיאה במחיקת הרישום')
    }
  }

  // Check if user can delete a registration
  const canDeleteRegistration = (reg: Registration): boolean => {
    if (isAdmin) return true // Admin can delete any
    if (user?.email === reg.email) return true // User can delete their own
    return false
  }

  // Load all user's workouts
  const loadMyWorkouts = async () => {
    if (!user?.email) return
    
    try {
      setLoading(true)
      // Fetch all registrations for this user
      const userRegs = await registrationAPI.getByUser(user.email)
      
      // Sort by date and time
      const sortedRegs = userRegs.sort((a, b) => {
        // Sort by date first
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        // Then by start time
        return a.startTime.localeCompare(b.startTime)
      })
      
      setMyWorkouts(sortedRegs)
      setShowMyWorkoutsModal(true)
    } catch (error) {
      console.error('Error loading user workouts:', error)
      alert('שגיאה בטעינת האימונים')
    } finally {
      setLoading(false)
    }
  }

  // Start editing a workout
  const handleEditWorkout = (workout: Registration) => {
    setEditingWorkoutId(workout.id!)
    setEditFormData({
      date: workout.date,
      startTime: workout.startTime,
      endTime: workout.endTime
    })
  }

  // Save edited workout
  const handleSaveWorkout = async (workoutId: number) => {
    try {
      await registrationAPI.update(
        workoutId,
        editFormData.date,
        editFormData.startTime,
        editFormData.endTime
      )
      
      // Update local state
      setMyWorkouts(prev => prev.map(w => 
        w.id === workoutId 
          ? { ...w, date: editFormData.date, startTime: editFormData.startTime, endTime: editFormData.endTime }
          : w
      ))
      
      // Reset editing state
      setEditingWorkoutId(null)
      
      // Refresh main table
      await fetchRegistrations()
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error('Error updating workout:', error)
      alert('שגיאה בעדכון האימון')
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingWorkoutId(null)
    setEditFormData({ date: '', startTime: '', endTime: '' })
  }

  if (!isOpen && !embedded) return null

  const content = (
    <div 
      className={embedded ? 'bg-dark-card border border-dark-border rounded-2xl px-2 sm:px-4 py-2 sm:py-4' : ''}
    >
      {/* Title - Only in embedded mode */}
      {embedded && (
        <div className="mb-2 sm:mb-4 text-center">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-cyan-400 text-base sm:text-2xl">📅</span>
            הרשמה לאימון
          </h2>
        </div>
      )}
      
      {/* Week Display - My Workouts Button */}
      <div className="pb-2 sm:pb-4">
        <div className="flex items-center justify-center bg-dark-hover rounded-lg p-2 sm:p-3 shadow-lg">
          <button
            onClick={loadMyWorkouts}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            כל האימונים שלי
          </button>
        </div>
      </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">טוען...</p>
          </div>
        ) : (
        <table className="w-full text-sm border-collapse table-fixed">
          <thead className="bg-dark-card shadow-lg sticky top-0 z-20">
                  <tr>
                    <th className="p-1 text-right border border-dark-border bg-dark-hover font-medium sticky right-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] text-[9px] w-[55px]">
                      <span className="text-white">שעות</span>
                      <span className="text-gray-500 mx-0.5">|</span>
                      <span className="text-cyan-400">יום</span>
                    </th>
                    {weekDates.map((date, idx) => {
                      const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      const isEvenColumn = idx % 2 === 1 // Alternate coloring: column 1,3,5 lighter
                      return (
                        <th 
                          key={idx} 
                          className={`p-1 text-center border border-dark-border font-medium ${
                            isToday 
                              ? 'bg-cyan-500/20' 
                              : isEvenColumn 
                                ? 'bg-dark-hover/70' 
                                : 'bg-dark-hover'
                          }`}
                        >
                          <div className="text-[10px] leading-tight text-cyan-400 font-bold">{format(date, 'EEE', { locale: he })}</div>
                          <div className="text-[8px] text-cyan-400 mt-0.5">{format(date, 'd.M')}</div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlotRanges.map((timeRange, timeIdx) => {
                    const [rangeStart, rangeEnd] = timeRange.split('-')
                    
                    return (
                      <tr key={timeIdx} className="hover:bg-dark-hover/30 h-[40px] max-h-[40px] min-h-[40px]">
                        {/* Time Range Cell */}
                        <td className="p-1 text-white font-medium border border-dark-border bg-dark-card sticky right-0 z-10 text-[8px] shadow-[2px_0_5px_rgba(0,0,0,0.3)] leading-tight w-[55px] h-[40px] max-h-[40px] min-h-[40px] align-middle overflow-hidden">
                          {timeRange}
                        </td>
                        
                        {/* Date Cells */}
                        {weekDates.map((date, dateIdx) => {
                          const dateStr = format(date, 'yyyy-MM-dd')
                          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          const isEvenColumn = dateIdx % 2 === 1 // Alternate coloring
                          const columnBgClass = isToday 
                            ? 'bg-cyan-500/10' 
                            : isEvenColumn 
                              ? 'bg-dark-hover/30' 
                              : 'bg-dark-bg'
                          
                          // Check for "Closed for Seniors" restriction
                          const restriction = getRestrictionMessage(date, rangeStart)
                          const dayOfWeek = date.getDay()
                          const isSundayOrThursday = dayOfWeek === 0 || dayOfWeek === 4
                          
                          // Handle seniors time (9:00-10:00) - skip 09:30-10:00 slot
                          if (restriction && isSundayOrThursday && rangeStart === '09:30') {
                            return null // Will be handled by the 09:00 slot with rowSpan
                          }
                          
                          if (restriction && isSundayOrThursday && rangeStart === '09:00') {
                            return (
                              <td 
                                key={dateIdx} 
                                rowSpan={2}
                                className={`p-1 border border-dark-border align-middle bg-orange-500/10 h-[80px] max-h-[80px] overflow-hidden ${columnBgClass}`}
                              >
                                <div className="text-center py-2 text-orange-400 font-medium text-[8px] leading-tight">
                                  סגור לגיל השלישי<br/>
                                  <span className="text-[7px]">09:00-10:00</span>
                                </div>
                              </td>
                            )
                          }
                          
                          // Convert time to minutes for comparison
                          const timeToMinutes = (time: string) => {
                            const [h, m] = time.split(':').map(Number)
                            return h * 60 + m
                          }
                          
                          const slotStartMin = timeToMinutes(rangeStart)
                          const slotEndMin = timeToMinutes(rangeEnd)
                          
                          // Get all registrations for this date that overlap with this time slot
                          const dateRegs = registrations.filter(r => format(new Date(r.date), 'yyyy-MM-dd') === dateStr)
                          const overlappingRegs = dateRegs.filter((reg) => {
                            const regStartMin = timeToMinutes(reg.startTime)
                            const regEndMin = timeToMinutes(reg.endTime)
                            // Registration overlaps this slot if it starts before slot ends and ends after slot starts
                            return regStartMin < slotEndMin && regEndMin > slotStartMin
                          })
                          
                          // Sort registrations: current user first, then by start time
                          const sortedRegs = [...overlappingRegs].sort((a, b) => {
                            const aIsCurrentUser = user?.email && a.email === user.email
                            const bIsCurrentUser = user?.email && b.email === user.email
                            
                            // Current user always first
                            if (aIsCurrentUser && !bIsCurrentUser) return -1
                            if (!aIsCurrentUser && bIsCurrentUser) return 1
                            
                            // Then by start time
                            return a.startTime.localeCompare(b.startTime)
                          })
                          
                          // If there are registrations
                          if (sortedRegs.length > 0) {
                            // Determine cell background color based on number of registrations
                            const cellBgClass = sortedRegs.length === 1 
                              ? 'bg-orange-900/20' // 1 person: red-brown transparent
                              : 'bg-green-500/15'  // 2+ people: green transparent
                            
                            return (
                              <td 
                                key={dateIdx}
                                className={`p-1 border border-dark-border relative overflow-hidden ${cellBgClass} h-[40px] max-h-[40px] min-h-[40px] ${
                                  onCellClick ? 'cursor-pointer hover:bg-dark-hover/50' : ''
                                }`}
                                onClick={() => onCellClick && onCellClick(date, timeRange)}
                              >
                                {/* "More" button - top left corner - always shown when there are registrations */}
                                <button
                                  onClick={(e) => handleShowAllClick(sortedRegs, e)}
                                  className="absolute top-0 left-0 z-10 text-white hover:text-cyan-400 transition-colors p-0.5"
                                  title={`צפה בכל הרשומים (${sortedRegs.length})`}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                
                                {/* Display up to 3 names - one below the other */}
                                <div className="flex flex-col items-center justify-center h-full gap-0.5 text-[9px] font-medium leading-tight">
                                  {sortedRegs.slice(0, 3).map((reg) => (
                                    <div
                                      key={reg.id}
                                      className={`truncate max-w-full ${
                                        user?.email === reg.email
                                          ? 'text-cyan-400'  // Current user: cyan
                                          : 'text-white'     // Others: white
                                      }`}
                                    >
                                      {getFirstName(reg.name)}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            )
                          }
                          
                          // Empty cell - clickable for registration
                          return (
                            <td 
                              key={dateIdx} 
                              className={`p-0.5 border border-dark-border align-top h-[40px] max-h-[40px] overflow-hidden ${columnBgClass} ${
                                onCellClick ? 'cursor-pointer hover:bg-cyan-500/10 transition-colors' : ''
                              }`}
                              onClick={() => onCellClick && onCellClick(date, timeRange)}
                            >
                              <div className="text-center text-gray-600 text-[9px] py-1">
                                {onCellClick ? '+' : '-'}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        )}
    </div>
  )

  if (embedded) {
    return (
      <>
        {content}
        {/* Modal for showing all registrations */}
        {showAllModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">כל הרשומים ({selectedCellRegistrations.length})</h3>
                </div>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-2">
                  {selectedCellRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className={`p-3 rounded-lg relative group ${
                        user?.email === reg.email
                          ? 'bg-cyan-500/20 border border-cyan-500/40'
                          : 'bg-gray-400/30 border border-gray-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${
                          user?.email === reg.email ? 'text-cyan-300' : 'text-gray-200'
                        }`}>
                          {reg.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${
                            user?.email === reg.email ? 'text-cyan-300' : 'text-gray-200'
                          }`}>
                            {reg.startTime}-{reg.endTime}
                          </div>
                          {canDeleteRegistration(reg) && (
                            <button
                              onClick={(e) => {
                                handleDeleteRegistration(reg.id!, e)
                                // Update the modal list
                                setSelectedCellRegistrations(prev => prev.filter(r => r.id !== reg.id))
                                // Close modal if no registrations left
                                if (selectedCellRegistrations.length <= 1) {
                                  setShowAllModal(false)
                                }
                              }}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                              title="מחק רישום"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for showing all user's workouts - EMBEDDED MODE */}
        {showMyWorkoutsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">כל האימונים שלי ({myWorkouts.length})</h3>
                </div>
                <button
                  onClick={() => setShowMyWorkoutsModal(false)}
                  className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {myWorkouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">אין אימונים רשומים</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myWorkouts.map((reg) => {
                      const workoutDate = new Date(reg.date)
                      const dayName = format(workoutDate, 'EEEE', { locale: he })
                      const dateStr = format(workoutDate, 'd.M.yyyy')
                      const isEditing = editingWorkoutId === reg.id
                      
                      // Get available times for this date (can't use useMemo inside map)
                      const availableTimes = getAvailableTimeOptions(workoutDate, user?.role)
                      
                      // Extract unique hours and minutes from available times
                      const hoursSet = new Set(availableTimes.map(time => time.split(':')[0]))
                      const hours = Array.from(hoursSet).sort()
                      
                      const minutesSet = new Set(availableTimes.map(time => time.split(':')[1]))
                      const minutes = Array.from(minutesSet).sort()
                      
                      // Parse time into hours and minutes
                      const [startHour, startMinute] = editFormData.startTime ? editFormData.startTime.split(':') : ['06', '00']
                      const [endHour, endMinute] = editFormData.endTime ? editFormData.endTime.split(':') : ['07', '00']
                      
                      const handleStartTimeChange = (hour: string, minute: string) => {
                        setEditFormData(prev => ({ ...prev, startTime: `${hour}:${minute}` }))
                      }
                      
                      const handleEndTimeChange = (hour: string, minute: string) => {
                        setEditFormData(prev => ({ ...prev, endTime: `${hour}:${minute}` }))
                      }
                      
                      return (
                        <div
                          key={reg.id}
                          className="p-3 rounded-lg bg-cyan-500/30 border border-cyan-500/50 relative group"
                        >
                          {isEditing ? (
                            // Edit Mode
                            <div className="space-y-3">
                              {/* Display date (not editable) */}
                              <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/30">
                                <span className="text-cyan-400 font-bold text-sm">{dayName}</span>
                                <span className="text-gray-400 text-sm">{dateStr}</span>
                              </div>
                              
                              {/* Edit times only - with scrollable selects */}
                              <div className="flex items-end gap-2 justify-center">
                                {/* End Time */}
                                <div className="flex-1">
                                  <label className="block text-cyan-400 text-xs mb-1 text-center">שעת סיום</label>
                                  <div className="flex gap-1">
                                    {/* Minutes */}
                                    <div className="relative flex-1">
                                      <select
                                        value={endMinute}
                                        onChange={(e) => handleEndTimeChange(endHour, e.target.value)}
                                        className="w-full bg-dark-hover border border-cyan-500/50 rounded-lg pl-2 pr-5 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                                        style={{
                                          appearance: 'none',
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none'
                                        }}
                                      >
                                        {minutes.map((minute) => (
                                          <option key={minute} value={minute} className="bg-dark-card text-white">
                                            {minute}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-2 h-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    <div className="text-white text-sm font-bold self-center">:</div>
                                    
                                    {/* Hours */}
                                    <div className="relative flex-1">
                                      <select
                                        value={endHour}
                                        onChange={(e) => handleEndTimeChange(e.target.value, endMinute)}
                                        className="w-full bg-dark-hover border border-cyan-500/50 rounded-lg pl-2 pr-5 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                                        style={{
                                          appearance: 'none',
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none'
                                        }}
                                      >
                                        {hours.map((hour) => (
                                          <option key={hour} value={hour} className="bg-dark-card text-white">
                                            {hour}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-2 h-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Separator */}
                                <div className="text-white text-sm font-bold pb-1.5">-</div>
                                
                                {/* Start Time */}
                                <div className="flex-1">
                                  <label className="block text-cyan-400 text-xs mb-1 text-center">שעת התחלה</label>
                                  <div className="flex gap-1">
                                    {/* Minutes */}
                                    <div className="relative flex-1">
                                      <select
                                        value={startMinute}
                                        onChange={(e) => handleStartTimeChange(startHour, e.target.value)}
                                        className="w-full bg-dark-hover border border-cyan-500/50 rounded-lg pl-2 pr-5 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                                        style={{
                                          appearance: 'none',
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none'
                                        }}
                                      >
                                        {minutes.map((minute) => (
                                          <option key={minute} value={minute} className="bg-dark-card text-white">
                                            {minute}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-2 h-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    <div className="text-white text-sm font-bold self-center">:</div>
                                    
                                    {/* Hours */}
                                    <div className="relative flex-1">
                                      <select
                                        value={startHour}
                                        onChange={(e) => handleStartTimeChange(e.target.value, startMinute)}
                                        className="w-full bg-dark-hover border border-cyan-500/50 rounded-lg pl-2 pr-5 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                                        style={{
                                          appearance: 'none',
                                          WebkitAppearance: 'none',
                                          MozAppearance: 'none'
                                        }}
                                      >
                                        {hours.map((hour) => (
                                          <option key={hour} value={hour} className="bg-dark-card text-white">
                                            {hour}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-2 h-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 justify-end pt-2">
                                <button
                                  onClick={() => handleCancelEdit()}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                                >
                                  ביטול
                                </button>
                                <button
                                  onClick={() => handleSaveWorkout(reg.id!)}
                                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
                                >
                                  <Save className="w-3 h-3" />
                                  שמור
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode - Similar to table cell
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {/* Date - like table header */}
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-cyan-400 font-bold text-sm">{dayName}</span>
                                  <span className="text-gray-400 text-xs">{dateStr}</span>
                                </div>
                                {/* Name and Time - like table cell */}
                                <div className="text-cyan-100 font-bold text-sm mb-0.5">
                                  {reg.name ? reg.name.split(' ')[0] : user?.name || 'אתה'}
                                </div>
                                <div className="text-cyan-200 text-xs opacity-90">
                                  {reg.startTime} - {reg.endTime}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditWorkout(reg)}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                  title="ערוך שעות"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האימון?')) {
                                      return
                                    }
                                    
                                    try {
                                      await registrationAPI.delete(reg.id!)
                                      setMyWorkouts(prev => prev.filter(r => r.id !== reg.id))
                                      await fetchRegistrations()
                                      if (onDataChange) {
                                        onDataChange()
                                      }
                                      if (myWorkouts.length <= 1) {
                                        setShowMyWorkoutsModal(false)
                                      }
                                    } catch (error) {
                                      console.error('Error deleting workout:', error)
                                      alert('שגיאה במחיקת האימון')
                                    }
                                  }}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                  title="מחק אימון"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">תצוגה שבועית מלאה</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {content}
          </div>
        </div>
      </div>
      
      {/* Modal for showing all registrations */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">כל הרשומים ({selectedCellRegistrations.length})</h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {selectedCellRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className={`p-3 rounded-lg relative group ${
                      user?.email === reg.email
                        ? 'bg-cyan-500/20 border border-cyan-500/40'
                        : 'bg-blue-500/20 border border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${
                        user?.email === reg.email ? 'text-cyan-300' : 'text-blue-300'
                      }`}>
                        {reg.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-medium ${
                          user?.email === reg.email ? 'text-cyan-300' : 'text-blue-300'
                        }`}>
                          {reg.startTime}-{reg.endTime}
                        </div>
                        {canDeleteRegistration(reg) && (
                          <button
                            onClick={(e) => {
                              handleDeleteRegistration(reg.id!, e)
                              // Update the modal list
                              setSelectedCellRegistrations(prev => prev.filter(r => r.id !== reg.id))
                              // Close modal if no registrations left
                              if (selectedCellRegistrations.length <= 1) {
                                setShowAllModal(false)
                              }
                            }}
                            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                            title="מחק רישום"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FullWeekView


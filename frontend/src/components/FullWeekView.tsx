import React, { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import { Registration } from '../types'
import { registrationAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { X, Calendar, ChevronDown, Users } from 'lucide-react'
import { generateTimeSlotRanges } from '../utils/timeSlotRanges'
import { getRestrictionMessage } from '../utils/timeRestrictions'

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
  const { user, isAdmin } = useAuth()

  // Get week dates - smart rolling week logic
  const getWeekDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset to start of day
    const currentDayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Calculate the Sunday of current week
    const currentSunday = addDays(today, -currentDayOfWeek)
    
    const dates = []
    
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      let date = addDays(currentSunday, dayOfWeek)
      
      // Rolling week logic based on current day
      if (currentDayOfWeek >= 3 && currentDayOfWeek <= 5) {
        // Today is Wed (3), Thu (4), or Fri (5)
        // Days Sun, Mon, Tue (0,1,2) -> show next week
        if (dayOfWeek <= 2) {
          date = addDays(date, 7)
        }
      } else if (currentDayOfWeek === 6) {
        // Today is Saturday (6)
        // Days Sun-Fri (0-5) -> show next week, only Sat stays current week
        if (dayOfWeek <= 5) {
          date = addDays(date, 7)
        }
      } else {
        // Today is Sun (0), Mon (1), or Tue (2)
        // Saturday (6) -> show next week
        if (dayOfWeek === 6) {
          date = addDays(date, 7)
        }
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
      // For smart rolling week, we need to fetch data for potentially 2 separate weeks
      // So we get min and max dates which covers both weeks
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

  // Get registrations that start in this time slot
  const getRegistrationsStartingInSlot = (date: Date, timeRange: string): Registration[] => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const [rangeStart] = timeRange.split('-')
    
    const filtered = registrations.filter((reg) =>
      reg.date === dateStr && reg.startTime === rangeStart
    )
    
    // Sort: admins first, then others
    return filtered.sort((a, b) => {
      const aIsAdmin = user?.email && a.email === user.email && isAdmin
      const bIsAdmin = user?.email && b.email === user.email && isAdmin
      
      if (aIsAdmin && !bIsAdmin) return -1
      if (!aIsAdmin && bIsAdmin) return 1
      return 0
    })
  }

  // Calculate how many rows a registration should span
  const calculateRowSpan = (reg: Registration): number => {
    const startMinutes = parseInt(reg.startTime.split(':')[0]) * 60 + parseInt(reg.startTime.split(':')[1])
    const endMinutes = parseInt(reg.endTime.split(':')[0]) * 60 + parseInt(reg.endTime.split(':')[1])
    const durationMinutes = endMinutes - startMinutes
    
    return Math.ceil(durationMinutes / 30)
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
      
      {/* Week Display - No Navigation */}
      <div className="pb-2 sm:pb-4">
        <div className="flex items-center justify-center bg-dark-hover rounded-lg p-2 sm:p-3 shadow-lg">
          <div className="text-center">
            <div className="text-white font-medium text-xs sm:text-base">
              {format(weekDates[0], 'd.M')} - {format(weekDates[6], 'd.M.yyyy')}
            </div>
            <div className="text-[10px] sm:text-sm text-cyan-400 mt-0.5 sm:mt-1">
              {(() => {
                const startMonth = format(weekDates[0], 'MMMM', { locale: he })
                const endMonth = format(weekDates[6], 'MMMM', { locale: he })
                const year = format(weekDates[6], 'yyyy')
                
                if (startMonth === endMonth) {
                  return `${startMonth} ${year}`
                } else {
                  return `${startMonth} - ${endMonth} ${year}`
                }
              })()}
            </div>
          </div>
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
                    <th className="p-1 sm:p-2 text-right border border-dark-border bg-dark-hover font-medium sticky right-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] text-[9px] sm:text-sm w-[55px] sm:w-[80px]">
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
                          className={`p-0.5 sm:p-2 text-center border border-dark-border font-medium ${
                            isToday 
                              ? 'bg-cyan-500/20' 
                              : isEvenColumn 
                                ? 'bg-dark-hover/70' 
                                : 'bg-dark-hover'
                          }`}
                        >
                          <div className="text-[10px] sm:text-base leading-tight text-cyan-400 font-bold">{format(date, 'EEE', { locale: he })}</div>
                          <div className="text-[7px] sm:text-xs text-cyan-400 mt-0.5">{format(date, 'd.M')}</div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Build skip map for this render
                    const skipCells = new Set<string>()
                    
                    return timeSlotRanges.map((timeRange, timeIdx) => {
                      const [rangeStart] = timeRange.split('-')
                      
                      return (
                        <tr key={timeIdx} className="hover:bg-dark-hover/30">
                          {/* Time Range Cell */}
                          <td className="p-0.5 sm:p-2 text-white font-medium border border-dark-border bg-dark-card sticky right-0 z-10 text-[8px] sm:text-xs shadow-[2px_0_5px_rgba(0,0,0,0.3)] leading-tight w-[55px] sm:w-[80px]">
                            {timeRange}
                          </td>
                          
                          {/* Date Cells */}
                          {weekDates.map((date, dateIdx) => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            const cellKey = `${dateStr}-${timeRange}`
                            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                            const isEvenColumn = dateIdx % 2 === 1 // Alternate coloring
                            const columnBgClass = isToday 
                              ? 'bg-cyan-500/10' 
                              : isEvenColumn 
                                ? 'bg-dark-hover/30' 
                                : 'bg-dark-bg'
                            
                            // Skip if this cell was already rendered by a rowSpan
                            if (skipCells.has(cellKey)) {
                              return null
                            }
                            
                            // Check for "Closed for Seniors"
                            const restriction = getRestrictionMessage(date, rangeStart)
                            const dayOfWeek = date.getDay()
                            const isSundayOrThursday = dayOfWeek === 0 || dayOfWeek === 4
                            
                            // Handle seniors time (9:00-10:00)
                            if (restriction && isSundayOrThursday) {
                              if (rangeStart === '09:00') {
                                // Mark next cell as rendered
                                skipCells.add(`${dateStr}-09:30-10:00`)
                                
                                return (
                                  <td 
                                    key={dateIdx} 
                                    rowSpan={2}
                                    className={`p-0.5 sm:p-2 border border-dark-border align-middle bg-orange-500/10 ${columnBgClass}`}
                                  >
                                    <div className="text-center py-1 sm:py-4 text-orange-400 font-medium text-[8px] sm:text-sm leading-tight">
                                      סגור לגיל השלישי<br/>
                                      <span className="text-[7px] sm:text-xs">09:00-10:00</span>
                                    </div>
                                  </td>
                                )
                              }
                            }
                            
                            // Get registrations that START in this time slot
                            const regsStartingHere = getRegistrationsStartingInSlot(date, timeRange)
                            
                            // Render cells for registrations starting here
                            if (regsStartingHere.length > 0) {
                              // Don't use rowSpan - display each registration in its start time slot only
                              // This prevents hiding other registrations that start at later times
                              
                              return (
                                <td 
                                  key={dateIdx} 
                                  className={`p-0 border border-dark-border relative overflow-hidden bg-green-500/15 ${
                                    onCellClick ? 'cursor-pointer hover:bg-dark-hover/50' : ''
                                  }`}
                                  onClick={() => onCellClick && onCellClick(date, timeRange)}
                                >
                                  {/* "More" button - top left corner - always shown */}
                                  <button
                                    onClick={(e) => handleShowAllClick(regsStartingHere, e)}
                                    className="absolute top-0 left-0 z-10 text-white hover:text-cyan-400 transition-colors p-0.5"
                                    title={`צפה בכל הרשומים (${regsStartingHere.length})`}
                                  >
                                    <ChevronDown className="w-2 h-2" />
                                  </button>
                                  
                                  {/* Display registrations vertically (one below the other) */}
                                  <div className="flex flex-col gap-1 h-full p-1">
                                    {regsStartingHere.slice(0, 4).map((reg) => (
                                      <div
                                        key={reg.id}
                                        className={`relative px-2 py-1 rounded flex flex-col justify-center text-center group min-h-[30px] ${
                                          user?.email === reg.email
                                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                                            : 'bg-blue-500/30 text-blue-200 border border-blue-500/30'
                                        }`}
                                      >
                                        {canDeleteRegistration(reg) && (
                                          <button
                                            onClick={(e) => handleDeleteRegistration(reg.id!, e)}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            title="מחק רישום"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        )}
                                        <div className="font-bold leading-tight mb-0.5 text-[6px]">
                                          <div className="truncate">{getFirstName(reg.name)}</div>
                                        </div>
                                        <div className="opacity-80 leading-tight text-[5px]">
                                          <div className="truncate">{reg.startTime}-{reg.endTime}</div>
                                        </div>
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
                                className={`p-0.5 border border-dark-border align-top ${columnBgClass} ${
                                  onCellClick ? 'cursor-pointer hover:bg-cyan-500/10 transition-colors' : ''
                                }`}
                                onClick={() => onCellClick && onCellClick(date, timeRange)}
                              >
                                <div className="text-center text-gray-600 text-[9px] sm:text-xs py-0.5 sm:py-2">
                                  {onCellClick ? '+' : '-'}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                  })()}
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


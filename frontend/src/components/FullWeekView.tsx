import React, { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import { Registration } from '../types'
import { registrationAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { X, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Users } from 'lucide-react'
import { generateTimeSlotRanges } from '../utils/timeSlotRanges'
import { getRestrictionMessage, isTeenBeastHours } from '../utils/timeRestrictions'

interface FullWeekViewProps {
  isOpen: boolean
  onClose: () => void
  weekOffset: number
  onWeekChange: (direction: 'prev' | 'next') => void
  refreshTrigger?: number
  onCellClick?: (date: Date, timeRange: string) => void
  embedded?: boolean
  onDataChange?: () => void
}

const FullWeekView: React.FC<FullWeekViewProps> = ({ 
  isOpen, 
  onClose, 
  weekOffset, 
  onWeekChange, 
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

  // Get week dates - start from today
  const getWeekDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset to start of day
    const baseDate = addDays(today, weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => addDays(baseDate, i))
  }

  const weekDates = getWeekDates()
  const timeSlotRanges = generateTimeSlotRanges()

  // Swipe gesture support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px) to trigger week change
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // Reset touch end
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // Swipe left = next week (forward)
      onWeekChange('next')
    } else if (isRightSwipe) {
      // Swipe right = previous week (back)
      onWeekChange('prev')
    }
  }

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
      const startDate = format(weekDates[0], 'yyyy-MM-dd')
      const endDate = format(weekDates[6], 'yyyy-MM-dd')
      
      console.log('🔍 Fetching full week registrations:', startDate, 'to', endDate)
      const data = await registrationAPI.getByRange(startDate, endDate)
      console.log('📊 Received full week data:', data)
      
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
      
      console.log('✅ Transformed full week registrations:', transformedData)
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
    
    return registrations.filter((reg) => 
      reg.date === dateStr && reg.startTime === rangeStart
    )
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
      className={embedded ? 'h-full flex flex-col bg-dark-card border border-dark-border rounded-2xl p-2 sm:p-4' : ''}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Title - Only in embedded mode */}
      {embedded && (
        <div className="mb-2 sm:mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <span className="text-cyan-400 text-base sm:text-2xl">📅</span>
            הרשמה לאימון
          </h2>
        </div>
      )}
      
      {/* Week Navigation */}
      <div className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between bg-dark-hover rounded-lg p-2 sm:p-3">
          <button
            onClick={() => onWeekChange('prev')}
            className="p-1.5 sm:p-2 hover:bg-dark-card rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-cyan-400"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">שבוע קודם</span>
          </button>
          
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
          
          <button
            onClick={() => onWeekChange('next')}
            className="p-1.5 sm:p-2 hover:bg-dark-card rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-cyan-400"
          >
            <span className="text-xs sm:text-sm">שבוע הבא</span>
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className={embedded ? 'flex-1 overflow-auto' : 'overflow-auto'} style={!embedded ? { maxHeight: '60vh' } : {}}>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">טוען...</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse table-fixed">
            <thead className="sticky top-0 bg-dark-card z-20 shadow-lg">
                  <tr>
                    <th className="p-1 sm:p-2 text-right border border-dark-border bg-dark-hover text-gray-400 font-medium sticky right-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] text-[9px] sm:text-sm w-[45px] sm:w-[80px]">
                      שעות
                    </th>
                    {weekDates.map((date, idx) => (
                      <th key={idx} className="p-0.5 sm:p-2 text-center border border-dark-border bg-dark-hover text-gray-400 font-medium">
                        <div className="text-[8px] sm:text-sm leading-tight">{format(date, 'EEE', { locale: he })}</div>
                        <div className="text-[7px] sm:text-xs text-cyan-400 mt-0.5">{format(date, 'd.M')}</div>
                      </th>
                    ))}
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
                          <td className="p-0.5 sm:p-2 text-white font-medium border border-dark-border bg-dark-card sticky right-0 z-10 text-[8px] sm:text-xs shadow-[2px_0_5px_rgba(0,0,0,0.3)] leading-tight">
                            {timeRange}
                          </td>
                          
                          {/* Date Cells */}
                          {weekDates.map((date, dateIdx) => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            const cellKey = `${dateStr}-${timeRange}`
                            
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
                                    className="p-0.5 sm:p-2 border border-dark-border align-middle bg-yellow-500/10"
                                  >
                                    <div className="text-center py-1 sm:py-4 text-yellow-400 font-medium text-[8px] sm:text-sm leading-tight">
                                      🔒 סגור<br/>
                                      <span className="text-[7px] sm:text-xs">09:00-10:00</span>
                                    </div>
                                  </td>
                                )
                              }
                            }
                            
                            // Check if this is TeenBEAST hours (show trainer)
                            const isTeenHours = isTeenBeastHours(date, timeRange)
                            
                            // Get registrations that START in this time slot
                            const regsStartingHere = getRegistrationsStartingInSlot(date, timeRange)
                            
                            // Render cells for registrations starting here
                            if (regsStartingHere.length > 0) {
                              const firstReg = regsStartingHere[0]
                              const rowSpan = calculateRowSpan(firstReg)
                              
                              // Mark future cells as rendered
                              for (let i = 1; i < rowSpan; i++) {
                                const futureTimeRange = timeSlotRanges[timeIdx + i]
                                if (futureTimeRange) {
                                  skipCells.add(`${dateStr}-${futureTimeRange}`)
                                }
                              }
                              
                              return (
                                <td 
                                  key={dateIdx} 
                                  rowSpan={rowSpan}
                                  className={`p-0 border border-dark-border relative ${
                                    onCellClick ? 'cursor-pointer hover:bg-dark-hover/50' : ''
                                  } ${
                                    isTeenHours 
                                      ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10' 
                                      : 'bg-blue-500/15'
                                  }`}
                                  onClick={() => onCellClick && onCellClick(date, timeRange)}
                                >
                                  {/* "More" button - top right corner */}
                                  {regsStartingHere.length > 4 && (
                                    <button
                                      onClick={(e) => handleShowAllClick(regsStartingHere, e)}
                                      className="absolute top-1 right-1 z-10 p-0.5 rounded bg-gray-500/40 hover:bg-gray-500/60 text-gray-300 hover:text-white border border-gray-500/60 transition-colors"
                                      title={`עוד ${regsStartingHere.length - 4} רשומים`}
                                    >
                                      <MoreHorizontal className="w-3 h-3" />
                                    </button>
                                  )}
                                  
                                  {/* Teen hours - show trainer badge at top */}
                                  {isTeenHours && (
                                    <div className="text-center pt-0.5 pb-1">
                                      <div className="inline-block px-1 sm:px-1.5 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded text-[5px] sm:text-[7px] font-bold leading-tight">
                                        שלומי - מאמן
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className={`grid ${regsStartingHere.length <= 2 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5 h-full p-0.5`}>
                                    {regsStartingHere.slice(0, 4).map((reg) => (
                                      <div
                                        key={reg.id}
                                        className={`relative px-0.5 py-0.5 sm:px-1.5 sm:py-1 rounded flex flex-col justify-center text-center group ${
                                          user?.email === reg.email
                                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                            : 'bg-blue-500/20 text-blue-300'
                                        }`}
                                      >
                                        {canDeleteRegistration(reg) && (
                                          <button
                                            onClick={(e) => handleDeleteRegistration(reg.id!, e)}
                                            className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            title="מחק רישום"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                        <div className="text-[6px] sm:text-[9px] font-medium leading-tight">
                                          {getFirstName(reg.name)}
                                        </div>
                                        <div className="text-[5px] sm:text-[7px] opacity-60 mt-0.5 leading-tight">
                                          {reg.startTime}-{reg.endTime}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              )
                            }
                            
                            // Empty cell or TeenBEAST hours (show trainer)
                            if (isTeenHours) {
                              return (
                                <td 
                                  key={dateIdx} 
                                  className={`p-0.5 border border-dark-border align-middle ${
                                    onCellClick ? 'cursor-pointer hover:bg-cyan-500/10 transition-colors' : ''
                                  } bg-gradient-to-br from-cyan-500/10 to-blue-500/10`}
                                  onClick={() => onCellClick && onCellClick(date, timeRange)}
                                >
                                  <div className="text-center py-1 sm:py-2">
                                    <div className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded text-[6px] sm:text-[9px] font-bold leading-tight">
                                      שלומי - מאמן
                                    </div>
                                  </div>
                                </td>
                              )
                            }
                            
                            // Empty cell - clickable for registration (dark background)
                            return (
                              <td 
                                key={dateIdx} 
                                className={`p-0.5 border border-dark-border align-top bg-dark-bg ${
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
                          {getFirstName(reg.name)}
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
                        {getFirstName(reg.name)}
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


import React, { useState, useEffect, useMemo } from 'react'
import { X, Clock, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { registrationAPI } from '../api'
import { canRegisterAtTime, getAvailableTimeOptions } from '../utils/timeRestrictions'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  initialStartTime?: string
  initialEndTime?: string
  onSuccess: () => void
  editingRegistration?: any
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate: initialDate,
  initialStartTime = '06:00',
  initialEndTime = '07:00',
  onSuccess,
  editingRegistration
}) => {
  const { user, isAdmin } = useAuth()
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registerForOther, setRegisterForOther] = useState(false)
  const [otherUserFirstName, setOtherUserFirstName] = useState('')
  const [otherUserLastName, setOtherUserLastName] = useState('')
  const isEditing = !!editingRegistration

  // Parse time into hours and minutes
  const [startHour, startMinute] = startTime.split(':')
  const [endHour, endMinute] = endTime.split(':')

  // Get available times based on date and user role
  const availableTimes = useMemo(() => {
    return getAvailableTimeOptions(selectedDate, user?.role)
  }, [selectedDate, user?.role])

  // Extract unique hours and minutes from available times
  const hours = useMemo(() => {
    const hoursSet = new Set(availableTimes.map(time => time.split(':')[0]))
    return Array.from(hoursSet).sort()
  }, [availableTimes])

  const minutes = useMemo(() => {
    const minutesSet = new Set(availableTimes.map(time => time.split(':')[1]))
    return Array.from(minutesSet).sort()
  }, [availableTimes])

  const handleStartTimeChange = (hour: string, minute: string) => {
    setStartTime(`${hour}:${minute}`)
  }

  const handleEndTimeChange = (hour: string, minute: string) => {
    setEndTime(`${hour}:${minute}`)
  }

  // Update date and times when props change
  useEffect(() => {
    setSelectedDate(initialDate)
    if (!editingRegistration) {
      setStartTime(initialStartTime)
      setEndTime(initialEndTime)
    }
  }, [initialDate, initialStartTime, initialEndTime, isOpen, editingRegistration])

  // Load editing data
  useEffect(() => {
    if (editingRegistration && isOpen) {
      setSelectedDate(new Date(editingRegistration.date))
      setStartTime(editingRegistration.startTime)
      setEndTime(editingRegistration.endTime)
    } else if (!isOpen) {
      // Reset on close
      setError('')
      setRegisterForOther(false)
      setOtherUserFirstName('')
      setOtherUserLastName('')
    }
  }, [editingRegistration, isOpen])

  // Auto-update end time when start time changes (+1 hour)
  useEffect(() => {
    if (editingRegistration) return // Don't auto-update when editing
    
    const [hours, minutes] = startTime.split(':').map(Number)
    const newEndHour = hours + 1
    
    // Check if new end time is in available times
    const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    if (availableTimes.includes(newEndTime)) {
      setEndTime(newEndTime)
    } else if (availableTimes.length > 0) {
      // Find next available time
      const currentIndex = availableTimes.indexOf(startTime)
      if (currentIndex >= 0 && currentIndex < availableTimes.length - 1) {
        setEndTime(availableTimes[currentIndex + 1])
      }
    }
  }, [startTime, editingRegistration, availableTimes])

  // Update start/end times if they're not in available times
  useEffect(() => {
    if (availableTimes.length === 0) return
    
    // If current start time is not available, set to first available
    if (!availableTimes.includes(startTime)) {
      setStartTime(availableTimes[0])
    }
    
    // If current end time is not available, set to next available after start
    if (!availableTimes.includes(endTime)) {
      const startIndex = availableTimes.indexOf(startTime)
      if (startIndex >= 0 && startIndex < availableTimes.length - 1) {
        setEndTime(availableTimes[startIndex + 1])
      } else if (availableTimes.length > 1) {
        setEndTime(availableTimes[1])
      }
    }
  }, [selectedDate, availableTimes])

  if (!isOpen) return null
  
  // Check if no times available for this date
  const noTimesAvailable = availableTimes.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('יש להתחבר כדי להירשם לאימון')
      setLoading(false)
      return
    }

    // Validate if registering for other user
    if (registerForOther && isAdmin) {
      if (!otherUserFirstName || !otherUserLastName) {
        setError('יש למלא שם פרטי ושם משפחה')
        setLoading(false)
        return
      }
    }

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      
      // Validate times
      if (startTime >= endTime) {
        setError('שעת הסיום חייבת להיות אחרי שעת ההתחלה')
        setLoading(false)
        return
      }

      // Check time restrictions
      const timeCheck = canRegisterAtTime(selectedDate, startTime, endTime, user.role)
      if (!timeCheck.allowed) {
        setError(timeCheck.message || 'שעה זו אינה זמינה להרשמה')
        setLoading(false)
        return
      }

      // Check for duplicate registration (only for regular users, not admin quick registration)
      console.log('DEBUG: Checking conditions - registerForOther:', registerForOther, 'isEditing:', isEditing);
      
      if (!registerForOther && !isEditing) {
        console.log('🔍 Checking for duplicate registrations...');
        try {
          const response = await registrationAPI.get(`/registrations/range?start=${dateString}&end=${dateString}`)
          const existingRegistrations = response.data || []
          console.log('📋 Existing registrations:', existingRegistrations.length);
          
          // DEBUG: Show on mobile
          if (existingRegistrations.length > 0) {
            console.log('DEBUG: Found', existingRegistrations.length, 'existing registrations');
          
          // Parse time to minutes for comparison
          const parseTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number)
            return hours * 60 + minutes
          }
          
          const newStartMinutes = parseTime(startTime)
          const newEndMinutes = parseTime(endTime)
          console.log('🕐 New registration time:', { startTime, endTime, newStartMinutes, newEndMinutes });
          
          // Check if user already has a registration with overlapping time
          const hasDuplicate = existingRegistrations.some((reg: any) => {
            console.log('  Checking against:', { email: reg.email, times: `${reg.start_time}-${reg.end_time}` });
            
            if (reg.email !== user.email) {
              console.log('    ✗ Different user');
              return false
            }
            
            console.log('    ✓ Same user! Checking overlap...');
            const existingStartMinutes = parseTime(reg.start_time)
            const existingEndMinutes = parseTime(reg.end_time)
            
            // Check overlap
            const hasOverlap = (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes)
            console.log('    Overlap check:', {
              existing: `${existingStartMinutes}-${existingEndMinutes}`,
              new: `${newStartMinutes}-${newEndMinutes}`,
              hasOverlap: hasOverlap ? '🔴 YES - DUPLICATE!' : '✅ NO'
            });
            
            return hasOverlap
          })
          
          if (hasDuplicate) {
            console.log('❌ DUPLICATE FOUND! Blocking registration');
            const duplicateReg = existingRegistrations.find((reg: any) => {
              if (reg.email !== user.email) return false;
              const existingStartMinutes = parseTime(reg.start_time);
              const existingEndMinutes = parseTime(reg.end_time);
              return (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
            });
            
            const errorMsg = duplicateReg 
              ? `כבר קיים רישום עבורך ב-${format(selectedDate, 'd.M.yyyy')} בשעות ${duplicateReg.start_time}-${duplicateReg.end_time}\n\nלא ניתן להירשם פעמיים לאותן שעות חופפות.`
              : 'כבר קיים רישום עבורך באותו התאריך ושעות חופפות';
            
            setError(errorMsg);
            setLoading(false);
            return;
          }
          
          console.log('✅ No duplicate found, proceeding...');
        } catch (err) {
          console.error('❌ Error checking for duplicates:', err);
          // Continue anyway - backend will catch it
        }
      } else {
        console.log('DEBUG: Skipping duplicate check - registerForOther:', registerForOther, 'isEditing:', isEditing);
      }

      // Determine registration data
      let registrationData
      if (registerForOther && isAdmin) {
        // For quick registration by admin
        const fullName = `${otherUserFirstName} ${otherUserLastName}`
        const tempEmail = `guest_${Date.now()}@temp.com` // Temporary email
        const tempPhone = '0000000000' // Default phone
        
        registrationData = {
          name: fullName,
          email: tempEmail,
          phone: tempPhone,
          date: dateString,
          startTime,
          endTime
        }
      } else {
        // Regular registration
        registrationData = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          date: dateString,
          startTime,
          endTime
        }
      }

      if (isEditing && editingRegistration?.id) {
        // Delete old and create new (since we don't have update endpoint)
        console.log('Updating registration:', editingRegistration.id)
        await registrationAPI.delete(editingRegistration.id)
        
        // Create new registration with updated data
        const result = await registrationAPI.create(registrationData)
        console.log('Registration updated successfully:', result)
      } else {
        // Create new registration
        console.log('Creating registration:', registrationData)

        const result = await registrationAPI.create(registrationData)

        console.log('Registration created successfully:', result)
      }
      
      onSuccess()
      onClose()
      
      // Reset times
      setStartTime('06:00')
      setEndTime('07:00')
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.error || err.message || 'שגיאה ביצירת ההרשמה'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = format(selectedDate, 'EEEE, d בMMMM yyyy', { locale: he })

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl max-w-lg w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEditing ? 'עריכת אימון' : 'הרשמה לאימון'}
          </h2>
          <p className="text-cyan-400 text-sm">{formattedDate}</p>
        </div>

        {/* No times available message */}
        {noTimesAvailable && user?.role === 'teenbeast' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center mb-6">
            <p className="text-yellow-300 font-medium mb-2">⚠️ לא ניתן להירשם ביום זה</p>
            <p className="text-gray-400 text-sm">
              משתמשי TeenBEAST יכולים להירשם רק בימים ובשעות מסוימים
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Admin: Register for Self or Other */}
          {user && isAdmin && !isEditing && (
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setRegisterForOther(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  !registerForOther
                    ? 'bg-cyan-500 text-white'
                    : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
                }`}
              >
                עצמי
              </button>
              <button
                type="button"
                onClick={() => setRegisterForOther(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  registerForOther
                    ? 'bg-cyan-500 text-white'
                    : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
                }`}
              >
                מתאמן אחר
              </button>
            </div>
          )}

          {/* Name fields - only for admin quick registration */}
          {user && isAdmin && registerForOther && !isEditing && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="שם פרטי"
                value={otherUserFirstName}
                onChange={(e) => setOtherUserFirstName(e.target.value)}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="שם משפחה"
                value={otherUserLastName}
                onChange={(e) => setOtherUserLastName(e.target.value)}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              תאריך האימון
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              dir="ltr"
              style={{ textAlign: 'right' }}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                שעת התחלה
              </label>
              <div className="flex gap-2">
                {/* Minutes - עכשיו מימין */}
                <div className="relative flex-1">
                  <select
                    value={startMinute}
                    onChange={(e) => handleStartTimeChange(startHour, e.target.value)}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg pl-3 pr-8 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                    required
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute} className="bg-dark-card text-white">
                        {minute}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="text-white text-2xl font-bold self-center">:</div>

                {/* Hours - עכשיו משמאל */}
                <div className="relative flex-1">
                  <select
                    value={startHour}
                    onChange={(e) => handleStartTimeChange(e.target.value, startMinute)}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg pl-3 pr-8 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                    required
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour} className="bg-dark-card text-white">
                        {hour}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                שעת סיום
              </label>
              <div className="flex gap-2">
                {/* Minutes - עכשיו מימין */}
                <div className="relative flex-1">
                  <select
                    value={endMinute}
                    onChange={(e) => handleEndTimeChange(endHour, e.target.value)}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg pl-3 pr-8 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                    required
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute} className="bg-dark-card text-white">
                        {minute}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="text-white text-2xl font-bold self-center">:</div>

                {/* Hours - עכשיו משמאל */}
                <div className="relative flex-1">
                  <select
                    value={endHour}
                    onChange={(e) => handleEndTimeChange(e.target.value, endMinute)}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg pl-3 pr-8 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer hover:bg-dark-border transition-colors text-center"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                    required
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour} className="bg-dark-card text-white">
                        {hour}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || noTimesAvailable}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/30"
          >
            {loading ? 'שומר...' : noTimesAvailable ? 'לא זמין ביום זה' : (isEditing ? 'עדכן אימון' : 'הרשם לאימון')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegistrationModal


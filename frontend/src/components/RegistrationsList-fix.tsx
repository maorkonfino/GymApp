import React from 'react'
import { Registration } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { Clock, User as UserIcon, Phone, Mail, Trash2, Edit2 } from 'lucide-react'
import { registrationAPI } from '../api'
import { hasTimePassed } from '../utils/timeRestrictions'

interface RegistrationsListProps {
  registrations: Registration[]
  onUpdate: () => void
  onEdit?: (registration: Registration) => void
}

const RegistrationsList: React.FC<RegistrationsListProps> = ({ registrations, onUpdate, onEdit }) => {
  const { user, isAdmin } = useAuth()

  const handleDelete = async (id: number, registration: Registration) => {
    // Check if training has passed (only for non-admin)
    if (!isAdmin && hasTimePassed(registration.date, registration.startTime)) {
      alert('לא ניתן למחוק אימון שכבר התקיים')
      return
    }

    // Check permissions
    if (!isAdmin && user?.email !== registration.email) {
      alert('אין לך הרשאה למחוק רישום זה')
      return
    }

    if (!confirm('האם אתה בטוח שברצונך למחוק רישום זה?')) {
      return
    }

    try {
      await registrationAPI.delete(id)
      onUpdate()
    } catch (error) {
      alert('שגיאה במחיקת הרישום')
    }
  }

  const canEdit = (registration: Registration) => {
    // Admin can always edit
    if (isAdmin) return true
    
    // User can only edit their own future trainings
    if (user?.email !== registration.email) return false
    
    // Check if training has passed
    return !hasTimePassed(registration.date, registration.startTime)
  }

  // Ensure registrations is an array
  const validRegistrations = Array.isArray(registrations) ? registrations : []

  if (validRegistrations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-dark-hover rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400">אין רישומים להצגה</p>
      </div>
    )
  }

  // Group registrations by overlapping time periods
  const groupedByTime = validRegistrations.reduce((acc, reg) => {
    // Find existing group that overlaps with this registration
    let foundGroup = false
    for (const key in acc) {
      const existingRegs = acc[key]
      // Check if any registration in this group overlaps
      const hasOverlap = existingRegs.some(existing => 
        (reg.startTime >= existing.startTime && reg.startTime < existing.endTime) ||
        (existing.startTime >= reg.startTime && existing.startTime < reg.endTime)
      )
      
      if (hasOverlap) {
        acc[key].push(reg)
        foundGroup = true
        break
      }
    }
    
    // If no overlap found, create new group
    if (!foundGroup) {
      const timeKey = `${reg.startTime}-${reg.endTime}`
      acc[timeKey] = [reg]
    }
    
    return acc
  }, {} as Record<string, Registration[]>)

  return (
    <div className="space-y-4">
      {Object.entries(groupedByTime).map(([timeKey, regs]) => {
        // Get the actual time range from all registrations in this group
        const earliestStart = regs.reduce((min, r) => r.startTime < min ? r.startTime : min, regs[0].startTime)
        const latestEnd = regs.reduce((max, r) => r.endTime > max ? r.endTime : max, regs[0].endTime)
        
        return (
          <div key={timeKey} className="bg-dark-hover rounded-xl p-4 border border-dark-border">
            {/* Time Header - טווח השעות */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">
                  {earliestStart} - {latestEnd}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {regs.length} {regs.length === 1 ? 'מתאמן' : 'מתאמנים'}
              </span>
            </div>

            {/* Users Grid - כל המשתמשים באותו תא */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regs.map((reg) => {
                const isPast = hasTimePassed(reg.date, reg.startTime)
                
                return (
                  <div
                    key={reg.id}
                    className={`
                      bg-dark-card border rounded-lg p-3
                      ${user?.email === reg.email 
                        ? 'border-cyan-500/50 bg-cyan-500/10' 
                        : 'border-dark-border'
                      }
                      ${isPast ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium text-sm">{reg.name}</span>
                        </div>
                        {canEdit(reg) && (
                          <div className="flex gap-1">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(reg)}
                                className="p-1 hover:bg-cyan-500/20 rounded transition-colors group"
                                title="ערוך"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(reg.id!, reg)}
                              className="p-1 hover:bg-red-500/20 rounded transition-colors group"
                              title={isPast && !isAdmin ? 'אימון שעבר - לא ניתן למחוק' : 'מחק'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {user?.email === reg.email && (
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                            אתה
                          </span>
                        )}
                        {isPast && (
                          <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">
                            הסתיים
                          </span>
                        )}
                      </div>

                      {(isAdmin || user?.email === reg.email) && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{reg.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{reg.phone}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RegistrationsList


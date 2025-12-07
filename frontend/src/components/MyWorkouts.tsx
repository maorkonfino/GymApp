import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Trash2, Dumbbell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { registrationAPI } from '../api'
import { Registration } from '../types'
import { format, parseISO, isPast } from 'date-fns'
import { he } from 'date-fns/locale'

interface MyWorkoutsProps {
  refreshTrigger?: number
  onDataChange?: () => void
}

const MyWorkouts: React.FC<MyWorkoutsProps> = ({ refreshTrigger, onDataChange }) => {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyWorkouts()
    }
  }, [user, refreshTrigger])

  const fetchMyWorkouts = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/registrations/user/${user.email}`)
      const data = await response.json()
      setRegistrations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching workouts:', error)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האימון?')) return
    
    try {
      await registrationAPI.delete(id)
      fetchMyWorkouts()
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error('Error deleting workout:', error)
      alert('שגיאה במחיקת האימון')
    }
  }

  const canEdit = (registration: Registration) => {
    const workoutDate = parseISO(`${registration.date}T${registration.startTime}`)
    return !isPast(workoutDate)
  }

  if (!user) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
        <Dumbbell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">יש להתחבר כדי לראות את האימונים שלך</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">טוען אימונים...</p>
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
        <Dumbbell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">אין לך אימונים רשומים</p>
        <p className="text-gray-500 text-sm">לחץ על "הרשמה לאימון" כדי להירשם</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Dumbbell className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">האימונים שלי</h2>
        <span className="text-sm text-gray-400">({registrations.length} אימונים)</span>
      </div>

      <div className="space-y-3">
        {registrations.map((reg) => {
          const workoutDate = parseISO(reg.date)
          const isPastWorkout = canEdit(reg) === false
          
          return (
            <div
              key={reg.id}
              className={`p-4 rounded-lg border transition-all ${
                isPastWorkout
                  ? 'bg-dark-hover/30 border-gray-700'
                  : 'bg-dark-hover border-dark-border hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-medium">
                      {format(workoutDate, 'EEEE, d בMMMM yyyy', { locale: he })}
                    </span>
                    {isPastWorkout && (
                      <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                        הושלם
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>
                      {reg.startTime} - {reg.endTime}
                    </span>
                  </div>
                </div>

                {!isPastWorkout && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(reg.id!)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="מחק"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyWorkouts


import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Dumbbell, Plus, Save } from 'lucide-react'
import BeastLogo from './BeastLogo'

interface Exercise {
  name: string
  set1_kg: string
  set1_reps: string
  set2_kg: string
  set2_reps: string
  set3_kg: string
  set3_reps: string
}

interface Week {
  weekNumber: number
  exercises: Exercise[]
}

const WorkoutPlan: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [weeks, setWeeks] = useState<Week[]>([
    { weekNumber: 1, exercises: [] }
  ])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState<boolean | null>(null) // null = loading, true = has plan, false = no plan

  // Check if user has a workout plan
  useEffect(() => {
    const checkWorkoutPlan = async () => {
      if (!user) {
        setHasWorkoutPlan(false)
        return
      }

      if (isAdmin) {
        setHasWorkoutPlan(true) // Admin always has access
        return
      }

      try {
        const response = await fetch(`http://localhost:3001/api/workout-plans/${user.email}`)
        const data = await response.json()
        
        // Check if there's actual plan content
        if (data && data.plan_content && data.plan_content.trim() !== '' && data.plan_content !== '[]' && data.plan_content !== '{}') {
          setHasWorkoutPlan(true)
        } else {
          setHasWorkoutPlan(false)
        }
      } catch (error) {
        console.error('Error checking workout plan:', error)
        setHasWorkoutPlan(false)
      }
    }

    checkWorkoutPlan()
  }, [user, isAdmin])

  const addWeek = () => {
    setWeeks([...weeks, { weekNumber: weeks.length + 1, exercises: [] }])
  }

  const addExercise = (weekIndex: number) => {
    const newWeeks = [...weeks]
    newWeeks[weekIndex].exercises.push({
      name: '',
      set1_kg: '',
      set1_reps: '',
      set2_kg: '',
      set2_reps: '',
      set3_kg: '',
      set3_reps: ''
    })
    setWeeks(newWeeks)
  }

  const updateExercise = (weekIndex: number, exerciseIndex: number, field: keyof Exercise, value: string) => {
    const newWeeks = [...weeks]
    newWeeks[weekIndex].exercises[exerciseIndex][field] = value
    setWeeks(newWeeks)
  }

  const removeExercise = (weekIndex: number, exerciseIndex: number) => {
    const newWeeks = [...weeks]
    newWeeks[weekIndex].exercises.splice(exerciseIndex, 1)
    setWeeks(newWeeks)
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    // כאן תהיה שמירה ל-API
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  // Loading state
  if (hasWorkoutPlan === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">טוען...</p>
        </div>
      </div>
    )
  }

  // No workout plan - show message
  if (!hasWorkoutPlan && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="max-w-md text-center space-y-6 animate-fade-in">
          <BeastLogo size="large" />
          
          <div className="space-y-2">
            <p className="text-cyan-400 text-lg">בית לאימון מבוסס מדע</p>
            <h2 className="text-3xl font-bold text-white">תוכנית האימון שלי</h2>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 space-y-3">
            <p className="text-yellow-300 text-lg font-medium">
              ⚠️ אין לך תוכנית אימון
            </p>
            <p className="text-gray-300">
              עדיין לא הוגדרה עבורך תוכנית אימון מותאמת אישית.
            </p>
            <p className="text-gray-400 text-sm">
              💬 יש ליצור קשר עם המנהל להגדרת תוכנית אימון
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">תוכנית האימון שלי</h2>
              <p className="text-gray-400 text-sm">תכנית אימונים מותאמת אישית</p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={addWeek}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף שבוע
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'שומר...' : saved ? 'נשמר!' : 'שמור'}
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm">
            ✅ התוכנית נשמרה בהצלחה!
          </div>
        )}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-purple-400">שבוע {week.weekNumber}</h3>
            {isAdmin && (
              <button
                onClick={() => addExercise(weekIndex)}
                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                הוסף תרגיל
              </button>
            )}
          </div>

          {/* Exercises Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-right p-3 text-gray-400 font-medium">תרגיל</th>
                  <th className="text-center p-3 text-gray-400 font-medium">סט 1</th>
                  <th className="text-center p-3 text-gray-400 font-medium">סט 2</th>
                  <th className="text-center p-3 text-gray-400 font-medium">סט 3</th>
                  {isAdmin && <th className="w-20"></th>}
                </tr>
                <tr className="border-b border-dark-border/50">
                  <th className="text-right p-2"></th>
                  <th className="text-center p-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <span>KG</span>
                      <span>×</span>
                      <span>REPS</span>
                    </div>
                  </th>
                  <th className="text-center p-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <span>KG</span>
                      <span>×</span>
                      <span>REPS</span>
                    </div>
                  </th>
                  <th className="text-center p-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <span>KG</span>
                      <span>×</span>
                      <span>REPS</span>
                    </div>
                  </th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {week.exercises.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-gray-500">
                      אין תרגילים בשבוע זה
                      {isAdmin && ' - לחץ "הוסף תרגיל" להוספה'}
                    </td>
                  </tr>
                ) : (
                  week.exercises.map((exercise, exerciseIndex) => (
                    <tr key={exerciseIndex} className="border-b border-dark-border/30">
                      <td className="p-3">
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(weekIndex, exerciseIndex, 'name', e.target.value)}
                          className="w-full bg-dark-hover border border-dark-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="שם התרגיל"
                          readOnly={!isAdmin}
                        />
                      </td>
                      {['1', '2', '3'].map((setNum) => (
                        <td key={setNum} className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              value={exercise[`set${setNum}_kg` as keyof Exercise]}
                              onChange={(e) => updateExercise(weekIndex, exerciseIndex, `set${setNum}_kg` as keyof Exercise, e.target.value)}
                              className="w-16 bg-dark-hover border border-dark-border rounded px-2 py-2 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="0"
                              readOnly={!isAdmin}
                            />
                            <span className="text-gray-500">×</span>
                            <input
                              type="text"
                              value={exercise[`set${setNum}_reps` as keyof Exercise]}
                              onChange={(e) => updateExercise(weekIndex, exerciseIndex, `set${setNum}_reps` as keyof Exercise, e.target.value)}
                              className="w-16 bg-dark-hover border border-dark-border rounded px-2 py-2 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="0"
                              readOnly={!isAdmin}
                            />
                          </div>
                        </td>
                      ))}
                      {isAdmin && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removeExercise(weekIndex, exerciseIndex)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WorkoutPlan


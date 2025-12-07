import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Dumbbell } from 'lucide-react'
import { User } from '../types'
import api from '../api'

interface AdminWorkoutEditorProps {
  user: User
  onClose: () => void
}

interface WeeklyTracking {
  [week: number]: {
    weight: string
    reps: string
  }[]
}

interface Exercise {
  name: string
  sets: string
  repsRange: string
  rest: string
  rir: string
  weeklyData: WeeklyTracking
}

interface Workout {
  name: string
  exercises: Exercise[]
}

interface WorkoutPlan {
  numberOfWeeks: number
  workouts: Workout[]
}

const AdminWorkoutEditor: React.FC<AdminWorkoutEditorProps> = ({ user, onClose }) => {
  const [numberOfWeeks, setNumberOfWeeks] = useState(4)
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      name: 'אימון 1',
      exercises: [
        { 
          name: '', 
          sets: '', 
          repsRange: '', 
          rest: '', 
          rir: '',
          weeklyData: {}
        }
      ]
    }
  ])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchWorkoutPlan()
  }, [user.id])

  const fetchWorkoutPlan = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/workout-plans/user/${user.id}`)
      if (response.data && response.data.length > 0) {
        const planData = response.data[0]
        const parsed = JSON.parse(planData.plan_content || '{}')
        if (parsed.workouts && parsed.workouts.length > 0) {
          setWorkouts(parsed.workouts)
          setNumberOfWeeks(parsed.numberOfWeeks || 4)
        }
      }
    } catch (error) {
      console.error('Error fetching workout plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async () => {
    setSaving(true)
    try {
      const planData: WorkoutPlan = {
        numberOfWeeks,
        workouts
      }
      await api.post('/workout-plans', {
        userId: user.id,
        planData: JSON.stringify(planData),
        created_by: user.email
      })
      console.log('✅ תוכנית אימון נשמרה אוטומטית')
    } catch (error) {
      console.error('Error saving workout plan:', error)
    } finally {
      setTimeout(() => setSaving(false), 1000)
    }
  }

  const handleSave = async () => {
    await saveData()
    alert('תוכנית האימון נשמרה בהצלחה!')
    onClose()
  }

  // Auto-save when workouts or numberOfWeeks change (with debounce)
  useEffect(() => {
    if (!user || workouts.length === 0) return

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Set new timeout for auto-save (2 seconds after last change)
    const timeout = setTimeout(() => {
      saveData()
    }, 2000)

    setSaveTimeout(timeout)

    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [workouts, numberOfWeeks])

  const addWorkout = () => {
    setWorkouts([
      ...workouts,
      {
        name: `אימון ${workouts.length + 1}`,
        exercises: [
          { 
            name: '', 
            sets: '', 
            repsRange: '', 
            rest: '', 
            rir: '',
            weeklyData: {}
          }
        ]
      }
    ])
  }

  const removeWorkout = (workoutIndex: number) => {
    if (workouts.length > 1) {
      setWorkouts(workouts.filter((_, i) => i !== workoutIndex))
    }
  }

  const addExercise = (workoutIndex: number) => {
    const newWorkouts = [...workouts]
    newWorkouts[workoutIndex].exercises.push({
      name: '',
      sets: '',
      repsRange: '',
      rest: '',
      rir: '',
      weeklyData: {}
    })
    setWorkouts(newWorkouts)
  }

  const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts]
    if (newWorkouts[workoutIndex].exercises.length > 1) {
      newWorkouts[workoutIndex].exercises.splice(exerciseIndex, 1)
      setWorkouts(newWorkouts)
    }
  }

  const updateWorkoutName = (workoutIndex: number, name: string) => {
    const newWorkouts = [...workouts]
    newWorkouts[workoutIndex].name = name
    setWorkouts(newWorkouts)
  }

  const updateExerciseField = (
    workoutIndex: number, 
    exerciseIndex: number, 
    field: keyof Exercise, 
    value: string
  ) => {
    const newWorkouts = [...workouts]
    if (field !== 'weeklyData') {
      (newWorkouts[workoutIndex].exercises[exerciseIndex][field] as string) = value
    }
    setWorkouts(newWorkouts)
  }

  const updateWeeklyData = (
    workoutIndex: number,
    exerciseIndex: number,
    week: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const newWorkouts = [...workouts]
    const exercise = newWorkouts[workoutIndex].exercises[exerciseIndex]
    
    if (!exercise.weeklyData[week]) {
      exercise.weeklyData[week] = []
    }
    
    if (!exercise.weeklyData[week][setIndex]) {
      exercise.weeklyData[week][setIndex] = { weight: '', reps: '' }
    }
    
    exercise.weeklyData[week][setIndex][field] = value
    setWorkouts(newWorkouts)
  }

  const getWeeklyData = (exercise: Exercise, week: number, setIndex: number) => {
    return exercise.weeklyData[week]?.[setIndex] || { weight: '', reps: '' }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">עריכת תוכנית אימון</h2>
            <p className="text-gray-400 text-sm">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">טוען תוכנית...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Number of Weeks Selector */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <label className="block text-purple-300 font-semibold mb-2">מספר שבועות בתוכנית:</label>
                <select
                  value={numberOfWeeks}
                  onChange={(e) => setNumberOfWeeks(parseInt(e.target.value))}
                  className="w-full bg-dark-card border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num}>{num} שבועות</option>
                  ))}
                </select>
              </div>

              {/* Workouts */}
              {workouts.map((workout, workoutIndex) => (
                <div key={workoutIndex} className="bg-dark-hover border border-dark-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-6 h-6 text-cyan-400" />
                      <input
                        type="text"
                        value={workout.name}
                        onChange={(e) => updateWorkoutName(workoutIndex, e.target.value)}
                        className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-cyan-500 focus:border-cyan-500 focus:outline-none px-2 py-1"
                      />
                    </div>
                    {workouts.length > 1 && (
                      <button
                        onClick={() => removeWorkout(workoutIndex)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                        title="מחק אימון"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Exercises Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-dark-card">
                          <th className="border border-dark-border px-3 py-2 text-gray-300 text-sm font-semibold text-right">תרגיל</th>
                          <th className="border border-dark-border px-2 py-2 text-gray-300 text-sm font-semibold text-center w-16">סטים</th>
                          <th className="border border-dark-border px-2 py-2 text-gray-300 text-sm font-semibold text-center w-24">טווח חזרות</th>
                          <th className="border border-dark-border px-2 py-2 text-gray-300 text-sm font-semibold text-center w-24">מנוחה</th>
                          <th className="border border-dark-border px-2 py-2 text-gray-300 text-sm font-semibold text-center w-16">RIR</th>
                          {Array.from({ length: numberOfWeeks }, (_, i) => i + 1).map(week => (
                            <th key={week} className="border border-dark-border px-2 py-2 text-cyan-300 text-sm font-semibold text-center" colSpan={1}>
                              שבוע {week}
                            </th>
                          ))}
                          <th className="border border-dark-border px-2 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {workout.exercises.map((exercise, exerciseIndex) => {
                          const numSets = parseInt(exercise.sets) || 3
                          return (
                            <tr key={exerciseIndex} className="hover:bg-dark-card/30">
                              <td className="border border-dark-border px-3 py-2">
                                <input
                                  type="text"
                                  placeholder="שם התרגיל"
                                  value={exercise.name}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'name', e.target.value)}
                                  className="w-full bg-transparent text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-2 py-1"
                                />
                              </td>
                              <td className="border border-dark-border px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="3"
                                  value={exercise.sets}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'sets', e.target.value)}
                                  className="w-full bg-dark-card text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-2 py-1"
                                />
                              </td>
                              <td className="border border-dark-border px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="8-12"
                                  value={exercise.repsRange}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'repsRange', e.target.value)}
                                  className="w-full bg-dark-card text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-2 py-1"
                                />
                              </td>
                              <td className="border border-dark-border px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="90s"
                                  value={exercise.rest}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'rest', e.target.value)}
                                  className="w-full bg-dark-card text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-2 py-1"
                                />
                              </td>
                              <td className="border border-dark-border px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="2"
                                  value={exercise.rir}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'rir', e.target.value)}
                                  className="w-full bg-dark-card text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-2 py-1"
                                />
                              </td>
                              {Array.from({ length: numberOfWeeks }, (_, i) => i + 1).map(week => (
                                <td key={week} className="border border-dark-border px-1 py-1">
                                  <div className="space-y-1">
                                    {Array.from({ length: numSets }, (_, setIdx) => {
                                      const data = getWeeklyData(exercise, week, setIdx)
                                      return (
                                        <div key={setIdx} className="flex gap-1">
                                          <input
                                            type="text"
                                            placeholder="R"
                                            value={data.reps}
                                            onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'reps', e.target.value)}
                                            className="w-10 bg-dark-card text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-0.5"
                                            maxLength={3}
                                          />
                                          <input
                                            type="text"
                                            placeholder="KG"
                                            value={data.weight}
                                            onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'weight', e.target.value)}
                                            className="w-12 bg-dark-card text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-0.5"
                                            maxLength={3}
                                          />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </td>
                              ))}
                              <td className="border border-dark-border px-2 py-2 text-center">
                                {workout.exercises.length > 1 && (
                                  <button
                                    onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                                    className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-all"
                                    title="מחק תרגיל"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => addExercise(workoutIndex)}
                    className="w-full mt-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף תרגיל
                  </button>
                </div>
              ))}

              <button
                onClick={addWorkout}
                className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                הוסף אימון
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-border">
          <div className="flex gap-3 mb-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  שמור וסגור
                </>
              )}
            </button>
          </div>
          <div className="text-center text-xs text-green-400">
            ✓ נשמר אוטומטית
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminWorkoutEditor


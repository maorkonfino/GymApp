import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Dumbbell, ChevronDown, ChevronUp } from 'lucide-react'
import BeastLogo from './BeastLogo'
import api from '../api'

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
  numberOfWeeks: number | 'flexible'
  workouts: Workout[]
}

const WorkoutPlanUser: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState<boolean | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [userAddedWeeks, setUserAddedWeeks] = useState(1) // For flexible plans
  const [collapsedWorkouts, setCollapsedWorkouts] = useState<Set<number>>(new Set()) // Track collapsed workouts
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set()) // Track collapsed weeks (format: "workoutIndex-weekNumber")

  useEffect(() => {
    fetchWorkoutPlan()
  }, [user])

  const fetchWorkoutPlan = async () => {
    if (!user) {
      setLoading(false)
      setHasWorkoutPlan(false)
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/workout-plans/${user.email}`)
      
      if (response.data && response.data.plan_content) {
        const parsedPlan = JSON.parse(response.data.plan_content)
        if (parsedPlan.workouts && parsedPlan.workouts.length > 0) {
          setPlan(parsedPlan)
          setHasWorkoutPlan(true)
        } else {
          setHasWorkoutPlan(false)
        }
      } else {
        setHasWorkoutPlan(false)
      }
    } catch (error) {
      console.error('Error fetching workout plan:', error)
      setHasWorkoutPlan(false)
    } finally {
      setLoading(false)
    }
  }

  const updateWeeklyData = (
    workoutIndex: number,
    exerciseIndex: number,
    week: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    if (!plan) return

    const newPlan = { ...plan }
    const exercise = newPlan.workouts[workoutIndex].exercises[exerciseIndex]
    
    if (!exercise.weeklyData[week]) {
      exercise.weeklyData[week] = []
    }
    
    if (!exercise.weeklyData[week][setIndex]) {
      exercise.weeklyData[week][setIndex] = { weight: '', reps: '' }
    }
    
    exercise.weeklyData[week][setIndex][field] = value
    setPlan(newPlan)
  }

  const toggleWorkoutCollapse = (workoutIndex: number) => {
    setCollapsedWorkouts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(workoutIndex)) {
        newSet.delete(workoutIndex)
      } else {
        newSet.add(workoutIndex)
      }
      return newSet
    })
  }

  const toggleWeekCollapse = (workoutIndex: number, weekNumber: number) => {
    const weekKey = `${workoutIndex}-${weekNumber}`
    setCollapsedWeeks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(weekKey)) {
        newSet.delete(weekKey)
      } else {
        newSet.add(weekKey)
      }
      return newSet
    })
  }

  const addWeek = () => {
    if (plan?.numberOfWeeks === 'flexible') {
      setUserAddedWeeks(prev => prev + 1)
    }
  }

  const getActualWeeks = () => {
    if (!plan) return 0
    if (plan.numberOfWeeks === 'flexible') {
      return userAddedWeeks
    }
    return plan.numberOfWeeks
  }

  const getWeeklyData = (exercise: Exercise, week: number, setIndex: number) => {
    return exercise.weeklyData[week]?.[setIndex] || { weight: '', reps: '' }
  }

  const saveData = async () => {
    if (!plan || !user) return

    setIsSaving(true)
    try {
      await api.post('/workout-plans', {
        userId: user.id,
        planData: JSON.stringify(plan),
        created_by: user.email
      })
      console.log('✅ תוכנית אימון נשמרה אוטומטית')
    } catch (error) {
      console.error('Error saving workout tracking:', error)
    } finally {
      setTimeout(() => setIsSaving(false), 1000)
    }
  }

  // Auto-save when plan changes (with debounce)
  useEffect(() => {
    if (!user || !plan) return

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
  }, [plan])

  if (loading || hasWorkoutPlan === null) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">טוען תוכנית אימון...</p>
      </div>
    )
  }

  if (!hasWorkoutPlan && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center p-4">
        <BeastLogo size="large" showScratch={true} showWolf={true} />
        <p className="text-xl text-cyan-400 font-medium mt-4">
          בית לאימון מבוסס מדע
        </p>
        <h2 className="text-3xl font-bold text-white mt-6 mb-4">תוכנית האימון שלי</h2>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md w-full">
          <p className="text-red-300 text-lg font-medium mb-2">⚠️ אין לך תוכנית אימון</p>
          <p className="text-gray-400 text-sm">עדיין לא הוגדרה עבורך תוכנית אימונים.</p>
          <p className="text-gray-400 text-sm mt-1">יש ליצור קשר עם המנהל כדי לקבל תוכנית מותאמת אישית.</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">אין תוכנית אימון להצגה</p>
      </div>
    )
  }

  return (
    <div className="w-full p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">תוכנית האימון שלי</h1>
        <p className="text-cyan-400 mb-2">
          מעקב אחר התקדמות - {plan.numberOfWeeks === 'flexible' ? `${userAddedWeeks} שבועות (גמיש)` : `${plan.numberOfWeeks} שבועות`}
        </p>
        {isSaving ? (
          <div className="text-cyan-400 flex items-center gap-2 justify-center text-sm">
            <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <span>שומר...</span>
          </div>
        ) : (
          <div className="text-green-400 text-sm">✓ נשמר אוטומטית</div>
        )}
      </div>

      {plan.workouts.map((workout, workoutIndex) => {
        const isCollapsed = collapsedWorkouts.has(workoutIndex)
        
        return (
        <div key={workoutIndex} className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
          <div 
            className="flex items-center justify-between mb-6 cursor-pointer hover:bg-dark-hover/30 -m-2 p-2 rounded-lg transition-colors"
            onClick={() => toggleWorkoutCollapse(workoutIndex)}
          >
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">{workout.name}</h2>
            </div>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              {isCollapsed ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
            </button>
          </div>

          {!isCollapsed && (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[8px] sm:text-[10px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-dark-hover">
                  <th className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-gray-300 font-semibold text-right sticky right-0 bg-dark-hover z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[60px]">תרגיל</th>
                  <th className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-gray-300 font-semibold text-center w-8 sm:w-12">סטים</th>
                  <th className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-gray-300 font-semibold text-center w-12 sm:w-16">חזרות</th>
                  <th className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-gray-300 font-semibold text-center w-12 sm:w-16">מנוחה</th>
                  <th className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-gray-300 font-semibold text-center w-8 sm:w-12">RIR</th>
                  {Array.from({ length: getActualWeeks() }, (_, i) => i + 1).map(week => {
                    const weekKey = `${workoutIndex}-${week}`
                    const isWeekCollapsed = collapsedWeeks.has(weekKey)
                    
                    // Always render header, even if collapsed, to show the toggle button
                    return (
                      <th key={week} className={`border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-cyan-300 font-semibold text-center ${isWeekCollapsed ? 'w-12' : 'w-16 sm:w-20'}`}>
                        <button
                          onClick={() => toggleWeekCollapse(workoutIndex, week)}
                          className="w-full flex items-center justify-center gap-1 hover:text-cyan-200 transition-colors"
                          title={isWeekCollapsed ? `שבוע ${week}` : undefined}
                        >
                          {isWeekCollapsed ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <>
                              <span>שבוע {week}</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </th>
                    )
                  })}
                  {plan.numberOfWeeks === 'flexible' && (
                    <th className="border border-dark-border px-1 py-1">
                      <button
                        onClick={addWeek}
                        className="w-full px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-[10px] sm:text-xs font-medium transition-all flex items-center justify-center gap-0.5"
                        title="הוסף שבוע"
                      >
                        <span className="text-sm sm:text-base">+</span> שבוע
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {workout.exercises.map((exercise, exerciseIndex) => {
                  const numSets = parseInt(exercise.sets) || 3
                  return (
                    <tr key={exerciseIndex} className="hover:bg-dark-hover/50">
                      <td className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-white font-medium sticky right-0 bg-dark-card z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                        {exercise.name}
                      </td>
                      <td className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-center text-gray-300">
                        {exercise.sets}
                      </td>
                      <td className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-center text-gray-300">
                        {exercise.repsRange}
                      </td>
                      <td className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-center text-gray-300">
                        {exercise.rest}
                      </td>
                      <td className="border border-dark-border px-0.5 sm:px-1 py-0.5 sm:py-1 text-center text-gray-300">
                        {exercise.rir}
                      </td>
                      {Array.from({ length: getActualWeeks() }, (_, i) => i + 1).map(week => {
                        const weekKey = `${workoutIndex}-${week}`
                        const isWeekCollapsed = collapsedWeeks.has(weekKey)
                        
                        if (isWeekCollapsed) {
                          // Render minimal cell for collapsed week
                          return <td key={week} className="border border-dark-border px-0 py-0.5 w-12"></td>
                        }
                        
                        return (
                          <td key={week} className="border border-dark-border px-0.5 py-0.5">
                            <div className="space-y-0.5">
                              {Array.from({ length: numSets }, (_, setIdx) => {
                                const data = getWeeklyData(exercise, week, setIdx)
                                return (
                                  <div key={setIdx} className="flex gap-0.5">
                                    <input
                                      type="text"
                                      placeholder="R"
                                      value={data.reps}
                                      onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'reps', e.target.value)}
                                      className="w-6 sm:w-8 bg-dark-hover text-white text-[8px] sm:text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5 border border-dark-border"
                                      maxLength={3}
                                    />
                                    <input
                                      type="text"
                                      placeholder="KG"
                                      value={data.weight}
                                      onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'weight', e.target.value)}
                                      className="w-7 sm:w-9 bg-dark-hover text-white text-[8px] sm:text-[10px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5 border border-dark-border"
                                      maxLength={3}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
        )
      })}

      <div className="flex justify-center">
        {isSaving ? (
          <div className="text-cyan-400 flex items-center gap-2">
            <div className="w-5 h-5 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <span className="font-semibold">שומר...</span>
          </div>
        ) : (
          <div className="text-green-400 flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">נשמר אוטומטית</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutPlanUser


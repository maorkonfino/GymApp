import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, ChevronDown, ChevronUp, Archive, FolderOpen, StickyNote, X } from 'lucide-react'
import api from '../api'

interface WeeklyTracking {
  [week: number]: {
    weight: string
    reps: string
  }[]
}

interface WeekNotes {
  [workoutIndex: number]: {
    [week: number]: string
  }
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
  const navigate = useNavigate()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState<boolean | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [userAddedWeeks, setUserAddedWeeks] = useState(() => {
    // Load user added weeks from localStorage
    if (user) {
      const saved = localStorage.getItem(`workout-user-weeks-${user.email}`)
      return saved ? parseInt(saved) : 1
    }
    return 1
  })
  const [collapsedWorkouts, setCollapsedWorkouts] = useState<Set<number>>(() => {
    // Load collapsed workouts from localStorage
    const saved = localStorage.getItem('workout-collapsed-workouts')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(() => {
    // Load collapsed weeks from localStorage
    const saved = localStorage.getItem('workout-collapsed-weeks')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [weekNotes, setWeekNotes] = useState<WeekNotes>({})
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [currentNotesKey, setCurrentNotesKey] = useState<{workoutIdx: number, week: number} | null>(null)
  const [archiveWorkoutIndex, setArchiveWorkoutIndex] = useState<number | null>(null)
  const [archiveFolders, setArchiveFolders] = useState<Array<{id: number, name: string}>>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)

  useEffect(() => {
    fetchWorkoutPlan()
  }, [user])

  // Save collapsed workouts to localStorage
  useEffect(() => {
    localStorage.setItem('workout-collapsed-workouts', JSON.stringify(Array.from(collapsedWorkouts)))
  }, [collapsedWorkouts])

  // Save collapsed weeks to localStorage
  useEffect(() => {
    localStorage.setItem('workout-collapsed-weeks', JSON.stringify(Array.from(collapsedWeeks)))
  }, [collapsedWeeks])

  // Save user added weeks to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`workout-user-weeks-${user.email}`, userAddedWeeks.toString())
    }
  }, [userAddedWeeks, user])

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
          // Extract notes and userAddedWeeks if they exist
          const { weekNotes: savedNotes, userAddedWeeks: savedUserWeeks, ...planData } = parsedPlan
          setPlan(planData)
          if (savedNotes) {
            setWeekNotes(savedNotes)
          }
          // Load user added weeks from plan (for flexible plans)
          if (savedUserWeeks && planData.numberOfWeeks === 'flexible') {
            setUserAddedWeeks(savedUserWeeks)
          }
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

    // Auto-open new week if current week is fully completed
    if (plan.numberOfWeeks === 'flexible' && week === userAddedWeeks) {
      // Check if all exercises in the current week (highest week) are complete
      const isCurrentWeekComplete = newPlan.workouts.every(workout => 
        workout.exercises.every(ex => {
          const numSets = parseInt(ex.sets) || 3
          // Check if all sets have both weight and reps
          return Array.from({ length: numSets }, (_, i) => i).every(setIdx => {
            const data = ex.weeklyData[week]?.[setIdx]
            return data && data.weight && data.weight.trim() !== '' && data.reps && data.reps.trim() !== ''
          })
        })
      )

      if (isCurrentWeekComplete) {
        const newUserWeeks = userAddedWeeks + 1
        setUserAddedWeeks(newUserWeeks)
        if (user) {
          localStorage.setItem(`workout-user-weeks-${user.email}`, newUserWeeks.toString())
        }
        console.log(`🎉 שבוע ${week} הושלם! נפתח שבוע ${newUserWeeks} אוטומטית`)
      }
    }
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
      setUserAddedWeeks(prev => {
        const newCount = prev + 1
        // Trigger save after state update
        setTimeout(() => saveData(), 100)
        return newCount
      })
    }
  }

  const openArchiveModal = async (workoutIndex: number) => {
    if (!user) return
    
    try {
      // Fetch folders
      const response = await api.get(`/workout-plans/archive/${user.email}`)
      setArchiveFolders(response.data.folders || [])
      setArchiveWorkoutIndex(workoutIndex)
      setSelectedFolderId(null)
    } catch (error) {
      console.error('Error fetching folders:', error)
      setArchiveFolders([])
      setArchiveWorkoutIndex(workoutIndex)
      setSelectedFolderId(null)
    }
  }

  const handleArchiveWorkout = async () => {
    if (!plan || !user || archiveWorkoutIndex === null) return

    const workout = plan.workouts[archiveWorkoutIndex]

    try {
      // Create a minimal plan with just this workout
      const workoutPlan = {
        numberOfWeeks: plan.numberOfWeeks,
        workouts: [workout]
      }

      // Archive the workout
      await api.post('/workout-plans/archive', {
        userEmail: user.email,
        name: workout.name,
        planContent: JSON.stringify(workoutPlan),
        folderId: selectedFolderId
      })

      // Remove workout from current plan
      const newWorkouts = plan.workouts.filter((_, idx) => idx !== archiveWorkoutIndex)
      const updatedPlan = { ...plan, workouts: newWorkouts }
      
      // Update local state
      setPlan(updatedPlan)
      
      // Close modal
      setArchiveWorkoutIndex(null)
      setSelectedFolderId(null)
      
      alert('האימון הועבר לארכיון בהצלחה!')
    } catch (error) {
      console.error('Error archiving workout:', error)
      alert('שגיאה בהעברה לארכיון')
    }
  }

  const getActualWeeks = () => {
    if (!plan) return 0
    if (plan.numberOfWeeks === 'flexible') {
      return userAddedWeeks
    }
    return plan.numberOfWeeks
  }

  // Find the current week to work on (first week where ALL exercises have data moves to next week)
  const getCurrentWeek = (workoutIndex: number): number => {
    if (!plan) return 1
    const workout = plan.workouts[workoutIndex]
    const totalWeeks = getActualWeeks()
    
    // Check each week starting from week 1
    for (let week = 1; week <= totalWeeks; week++) {
      // Check if ALL exercises in this week have BOTH weight AND reps in set 1
      const allExercisesHaveData = workout.exercises.every(exercise => {
        const weekData = exercise.weeklyData[week]?.[0] // Check set 1 only
        return weekData && weekData.weight && weekData.reps
      })
      
      // If not all exercises have data, this is the current week to fill
      if (!allExercisesHaveData) {
        return week
      }
      
      // If all exercises have data and this is not the last week, check next week
      if (week < totalWeeks) {
        const nextWeekAllFilled = workout.exercises.every(exercise => {
          const nextWeekData = exercise.weeklyData[week + 1]?.[0] // Check set 1 only
          return nextWeekData && nextWeekData.weight && nextWeekData.reps
        })
        
        // If next week is not fully filled, it's the current week
        if (!nextWeekAllFilled) {
          return week + 1
        }
      }
    }
    
    // If all weeks are fully filled, return the last week
    return totalWeeks
  }

  // Sort weeks: current week first, previous week second for comparison, then others
  const getSortedWeeks = (workoutIndex: number): number[] => {
    const totalWeeks = getActualWeeks()
    const currentWeek = getCurrentWeek(workoutIndex)
    const allWeeks = Array.from({ length: totalWeeks }, (_, i) => i + 1)
    
    // If current week is 1, just show all weeks in order
    if (currentWeek === 1) {
      return allWeeks
    }
    
    // Current week first, then previous week for comparison (week - 1), then rest
    const previousWeek = currentWeek - 1
    const beforePrevious = allWeeks.filter(w => w < previousWeek).reverse() // Weeks before the previous week
    const afterCurrent = allWeeks.filter(w => w > currentWeek) // Weeks after current
    
    return [currentWeek, previousWeek, ...beforePrevious, ...afterCurrent]
  }

  const getWeeklyData = (exercise: Exercise, week: number, setIndex: number) => {
    return exercise.weeklyData[week]?.[setIndex] || { weight: '', reps: '' }
  }

  const saveData = async () => {
    if (!plan || !user) return

    setIsSaving(true)
    try {
      const dataToSave = {
        ...plan,
        weekNotes,
        userAddedWeeks // Save user added weeks for flexible plans
      }
      await api.post('/workout-plans', {
        userId: user.id,
        planData: JSON.stringify(dataToSave),
        created_by: user.email
      })
      console.log('✅ תוכנית אימון נשמרה אוטומטית')
    } catch (error) {
      console.error('Error saving workout tracking:', error)
    } finally {
      setTimeout(() => setIsSaving(false), 1000)
    }
  }

  const openNotesModal = (workoutIdx: number, week: number) => {
    setCurrentNotesKey({ workoutIdx, week })
    setNotesModalOpen(true)
  }

  const saveNotes = (notes: string) => {
    if (!currentNotesKey) return
    
    setWeekNotes(prev => ({
      ...prev,
      [currentNotesKey.workoutIdx]: {
        ...prev[currentNotesKey.workoutIdx],
        [currentNotesKey.week]: notes
      }
    }))
    setNotesModalOpen(false)
  }

  // Auto-save when plan, weekNotes, or userAddedWeeks changes (with debounce)
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
  }, [plan, weekNotes, userAddedWeeks])

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
        <img src="/header-logo.svg" alt="BEAST Logo" className="w-64 sm:w-80 h-auto mb-6" />
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
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-white">תוכנית האימון שלי</h1>
          <button
            onClick={() => navigate('/workout-archive')}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2 font-semibold"
            title="עבור לארכיון"
          >
            <Archive className="w-5 h-5" />
            ארכיון
          </button>
        </div>
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
            className="flex items-center justify-between mb-6 -m-2 p-2 rounded-lg"
          >
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-dark-hover/30 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => toggleWorkoutCollapse(workoutIndex)}
            >
              <Dumbbell className="w-8 h-8 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">{workout.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  openArchiveModal(workoutIndex)
                }}
                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                title="העבר לארכיון"
              >
                <FolderOpen className="w-6 h-6" />
              </button>
              <button 
                onClick={() => toggleWorkoutCollapse(workoutIndex)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {isCollapsed ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {!isCollapsed && (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[7px] sm:text-[9px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-dark-hover">
                  <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-right sticky right-0 bg-dark-hover z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] w-[50px] sm:w-[70px]">תרגיל</th>
                  <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-6 sm:w-8">סטים</th>
                  <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-8 sm:w-12">חזרות</th>
                  <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-8 sm:w-12">מנוחה</th>
                  <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-6 sm:w-8">RIR</th>
                  {(() => {
                    // Sort weeks: current week first, then previous weeks for comparison
                    const sortedWeeks = getSortedWeeks(workoutIndex)
                    
                    return sortedWeeks.map(week => {
                      const weekKey = `${workoutIndex}-${week}`
                      const isWeekCollapsed = collapsedWeeks.has(weekKey)
                    
                      // Always render header, even if collapsed, to show the toggle button
                      return (
                        <th key={week} className={`border border-dark-border px-0.5 py-0.5 text-cyan-300 font-semibold text-center ${isWeekCollapsed ? 'w-8' : 'w-16 sm:w-20'}`}>
                          <button
                            onClick={() => toggleWeekCollapse(workoutIndex, week)}
                            className="w-full flex items-center justify-center gap-0.5 hover:text-cyan-200 transition-colors"
                            title={isWeekCollapsed ? `שבוע ${week}` : undefined}
                          >
                            {isWeekCollapsed ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <>
                                <span className="text-[7px] sm:text-[9px]">שבוע {week}</span>
                                <ChevronUp className="w-2 h-2 sm:w-3 sm:h-3" />
                              </>
                            )}
                          </button>
                        </th>
                      )
                    })
                  })()}
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
                      <td className="border border-dark-border px-0.5 py-0.5 text-white font-medium sticky right-0 bg-dark-card z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                        {exercise.name}
                      </td>
                      <td className="border border-dark-border px-0.5 py-0.5 text-center text-gray-300">
                        {exercise.sets}
                      </td>
                      <td className="border border-dark-border px-0.5 py-0.5 text-center text-gray-300">
                        {exercise.repsRange}
                      </td>
                      <td className="border border-dark-border px-0.5 py-0.5 text-center text-gray-300">
                        {exercise.rest}
                      </td>
                      <td className="border border-dark-border px-0.5 py-0.5 text-center text-gray-300">
                        {exercise.rir}
                      </td>
                      {(() => {
                        // Sort weeks: current week first, then previous weeks for comparison
                        const sortedWeeks = getSortedWeeks(workoutIndex)
                        
                        return sortedWeeks.map(week => {
                          const weekKey = `${workoutIndex}-${week}`
                          const isWeekCollapsed = collapsedWeeks.has(weekKey)
                        
                          if (isWeekCollapsed) {
                            // Render minimal cell for collapsed week
                            return <td key={week} className="border border-dark-border px-0 py-0.5 w-8"></td>
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
                                        placeholder="Rep"
                                        value={data.reps}
                                        onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'reps', e.target.value)}
                                        className="w-7 sm:w-8 bg-dark-hover text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5 border border-dark-border"
                                        maxLength={3}
                                      />
                                      <input
                                        type="text"
                                        placeholder="KG"
                                        value={data.weight}
                                        onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'weight', e.target.value)}
                                        className="w-7 sm:w-8 bg-dark-hover text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5 border border-dark-border"
                                        maxLength={5}
                                      />
                                      {setIdx === 0 && (
                                        <button
                                          onClick={() => openNotesModal(workoutIndex, week)}
                                          className="w-3 h-3 flex items-center justify-center bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded text-[6px] transition-all"
                                          title="הערות"
                                        >
                                          <StickyNote className="w-2 h-2" />
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                          )
                        })
                      })()}
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

      {/* Notes Modal */}
      {notesModalOpen && currentNotesKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-400" />
                הערות - שבוע {currentNotesKey.week}
              </h3>
              <button
                onClick={() => setNotesModalOpen(false)}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={weekNotes[currentNotesKey.workoutIdx]?.[currentNotesKey.week] || ''}
                onChange={(e) => {
                  const newNotes = e.target.value
                  setWeekNotes(prev => ({
                    ...prev,
                    [currentNotesKey.workoutIdx]: {
                      ...prev[currentNotesKey.workoutIdx],
                      [currentNotesKey.week]: newNotes
                    }
                  }))
                }}
                placeholder="הכנס הערות לשבוע זה..."
                className="w-full h-40 bg-dark-hover border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
              <button
                onClick={() => saveNotes(weekNotes[currentNotesKey.workoutIdx]?.[currentNotesKey.week] || '')}
                className="w-full mt-3 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-all font-semibold"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Archive Modal */}
      {archiveWorkoutIndex !== null && plan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setArchiveWorkoutIndex(null)}>
          <div className="bg-dark-card border border-purple-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FolderOpen className="w-7 h-7 text-purple-400" />
              העבר אימון לארכיון
            </h3>
            
            <p className="text-gray-300 mb-4">
              מעביר את "{plan.workouts[archiveWorkoutIndex].name}" לארכיון
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                בחר תיקייה (אופציונלי):
              </label>
              <select
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">ללא תיקייה (לא מאורגן)</option>
                {archiveFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleArchiveWorkout}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all font-semibold"
              >
                העבר לארכיון
              </button>
              <button
                onClick={() => {
                  setArchiveWorkoutIndex(null)
                  setSelectedFolderId(null)
                }}
                className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all font-semibold"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkoutPlanUser


import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Dumbbell, Archive, FolderOpen, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { User } from '../types'
import api from '../api'
import AdminArchiveViewer from './AdminArchiveViewer'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

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
  numberOfWeeks: number | 'flexible'
  workouts: Workout[]
  userAddedWeeks?: number
}

const AdminWorkoutEditor: React.FC<AdminWorkoutEditorProps> = ({ user, onClose }) => {
  const [numberOfWeeks, setNumberOfWeeks] = useState<number | 'flexible'>(4)
  const [userAddedWeeks, setUserAddedWeeks] = useState<number>(0)
  const [archiveWorkoutIndex, setArchiveWorkoutIndex] = useState<number | null>(null)
  const [archiveFolders, setArchiveFolders] = useState<Array<{id: number, name: string}>>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [showArchiveViewer, setShowArchiveViewer] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
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
          setUserAddedWeeks(parsed.userAddedWeeks || 0)
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
        workouts,
        ...(numberOfWeeks === 'flexible' ? { userAddedWeeks } : {})
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
  }, [workouts, numberOfWeeks, userAddedWeeks])

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

  const moveWorkoutUp = (workoutIndex: number) => {
    if (workoutIndex === 0) return
    const newWorkouts = [...workouts]
    const temp = newWorkouts[workoutIndex]
    newWorkouts[workoutIndex] = newWorkouts[workoutIndex - 1]
    newWorkouts[workoutIndex - 1] = temp
    setWorkouts(newWorkouts)
  }

  const moveWorkoutDown = (workoutIndex: number) => {
    if (workoutIndex === workouts.length - 1) return
    const newWorkouts = [...workouts]
    const temp = newWorkouts[workoutIndex]
    newWorkouts[workoutIndex] = newWorkouts[workoutIndex + 1]
    newWorkouts[workoutIndex + 1] = temp
    setWorkouts(newWorkouts)
  }

  const openArchiveModal = async (workoutIndex: number) => {
    try {
      // Fetch folders for this user
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
    if (archiveWorkoutIndex === null) return

    const workout = workouts[archiveWorkoutIndex]

    try {
      // Create a minimal plan with just this workout
      const workoutPlan = {
        numberOfWeeks: numberOfWeeks,
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
      const newWorkouts = workouts.filter((_, idx) => idx !== archiveWorkoutIndex)
      setWorkouts(newWorkouts)
      
      // Close modal
      setArchiveWorkoutIndex(null)
      setSelectedFolderId(null)
      
      alert('האימון הועבר לארכיון בהצלחה!')
    } catch (error) {
      console.error('Error archiving workout:', error)
      alert('שגיאה בהעברה לארכיון')
    }
  }

  const openUserArchive = () => {
    console.log('AdminWorkoutEditor - Opening archive modal for user:', user.id, user.email, user.name)
    setShowArchiveViewer(true)
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

  const moveExerciseUp = (workoutIndex: number, exerciseIndex: number) => {
    if (exerciseIndex === 0) return
    const newWorkouts = [...workouts]
    const exercises = newWorkouts[workoutIndex].exercises
    const temp = exercises[exerciseIndex]
    exercises[exerciseIndex] = exercises[exerciseIndex - 1]
    exercises[exerciseIndex - 1] = temp
    setWorkouts(newWorkouts)
  }

  const moveExerciseDown = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts]
    const exercises = newWorkouts[workoutIndex].exercises
    if (exerciseIndex === exercises.length - 1) return
    const temp = exercises[exerciseIndex]
    exercises[exerciseIndex] = exercises[exerciseIndex + 1]
    exercises[exerciseIndex + 1] = temp
    setWorkouts(newWorkouts)
  }

  const deleteWeek = (weekNumber: number) => {
    const totalWeeks = numberOfWeeks === 'flexible' ? (userAddedWeeks + 1) : numberOfWeeks
    if (totalWeeks <= 1) return

    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את שבוע ${weekNumber}? כל הנתונים של שבוע זה יימחקו לצמיתות.`)) return

    const newWorkouts = workouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => {
        const newWeeklyData: WeeklyTracking = {}
        for (const key of Object.keys(exercise.weeklyData)) {
          const k = parseInt(key)
          if (k === weekNumber) continue
          if (k > weekNumber) {
            newWeeklyData[k - 1] = exercise.weeklyData[k]
          } else {
            newWeeklyData[k] = exercise.weeklyData[k]
          }
        }
        return { ...exercise, weeklyData: newWeeklyData }
      })
    }))

    setWorkouts(newWorkouts)
    if (numberOfWeeks === 'flexible') {
      setUserAddedWeeks(Math.max(0, userAddedWeeks - 1))
    } else {
      setNumberOfWeeks((numberOfWeeks as number) - 1)
    }
  }

  const moveExerciseToWorkout = (sourceWorkoutIndex: number, exerciseIndex: number, targetWorkoutIndex: number) => {
    if (sourceWorkoutIndex === targetWorkoutIndex) return
    const newWorkouts = [...workouts].map(w => ({ ...w, exercises: [...w.exercises] }))
    const [exercise] = newWorkouts[sourceWorkoutIndex].exercises.splice(exerciseIndex, 1)
    newWorkouts[targetWorkoutIndex].exercises.push(exercise)
    if (newWorkouts[sourceWorkoutIndex].exercises.length === 0) {
      newWorkouts[sourceWorkoutIndex].exercises.push({
        name: '', sets: '', repsRange: '', rest: '', rir: '', weeklyData: {}
      })
    }
    setWorkouts(newWorkouts)
  }

  const handleWorkoutDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1])
      const newIndex = parseInt(over.id.toString().split('-')[1])

      if (!isNaN(oldIndex) && !isNaN(newIndex)) {
        setWorkouts(arrayMove(workouts, oldIndex, newIndex))
      }
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
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">עריכת תוכנית אימון</h2>
              <p className="text-gray-400 text-sm">{user.name}</p>
            </div>
            <button
              onClick={openUserArchive}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm"
              title="פתח ארכיון"
            >
              <Archive className="w-4 h-4" />
              ארכיון
            </button>
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
                  onChange={(e) => setNumberOfWeeks(e.target.value === 'flexible' ? 'flexible' : parseInt(e.target.value))}
                  className="w-full bg-dark-card border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="flexible">גמיש (המתאמן יוסיף שבועות)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num}>{num} שבועות</option>
                  ))}
                </select>
                {numberOfWeeks === 'flexible' && (
                  <p className="text-sm text-purple-300 mt-2">
                    💡 במצב גמיש, המתאמן יוכל להוסיף שבועות נוספים בעצמו
                  </p>
                )}
              </div>

              {/* Workouts */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleWorkoutDragEnd}
              >
                <SortableContext
                  items={workouts.map((_, i) => `workout-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {workouts.map((workout, workoutIndex) => (
                    <div key={`workout-${workoutIndex}`} className="bg-dark-hover border border-dark-border rounded-xl p-5 mb-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-dark-card rounded transition-all"
                            title="גרור להזזה"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveWorkoutUp(workoutIndex)}
                              disabled={workoutIndex === 0}
                              className="p-1 hover:bg-dark-card rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="הזז למעלה"
                            >
                              <ChevronUp className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                              onClick={() => moveWorkoutDown(workoutIndex)}
                              disabled={workoutIndex === workouts.length - 1}
                              className="p-1 hover:bg-dark-card rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="הזז למטה"
                            >
                              <ChevronDown className="w-4 h-4 text-cyan-400" />
                            </button>
                          </div>
                          <Dumbbell className="w-6 h-6 text-cyan-400" />
                      <input
                        type="text"
                        value={workout.name}
                        onChange={(e) => updateWorkoutName(workoutIndex, e.target.value)}
                        className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-cyan-500 focus:border-cyan-500 focus:outline-none px-2 py-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openArchiveModal(workoutIndex)}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
                        title="העבר לארכיון"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
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
                  </div>

                  {/* Exercises Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[7px] sm:text-[9px]">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-dark-card">
                          <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-8">סדר</th>
                          <th className="border border-dark-border px-1 py-1 text-gray-300 font-semibold text-right w-[120px] sm:w-[180px] md:w-[220px]">תרגיל</th>
                          <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-6 sm:w-8">סטים</th>
                          <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-8 sm:w-12">חזרות</th>
                          <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-8 sm:w-12">מנוחה</th>
                          <th className="border border-dark-border px-0.5 py-0.5 text-gray-300 font-semibold text-center w-6 sm:w-8">RIR</th>
                          {Array.from({ length: numberOfWeeks === 'flexible' ? (userAddedWeeks + 1) : numberOfWeeks }, (_, i) => i + 1).map(week => {
                            const totalWeeks = numberOfWeeks === 'flexible' ? (userAddedWeeks + 1) : numberOfWeeks
                            return (
                              <th key={week} className="border border-dark-border px-0.5 py-0.5 text-cyan-300 font-semibold text-center w-16 sm:w-20">
                                <div className="flex items-center justify-center gap-0.5">
                                  <span>שבוע {week}</span>
                                  {totalWeeks > 1 && (
                                    <button
                                      onClick={() => deleteWeek(week)}
                                      className="p-0.5 hover:bg-red-500/20 text-gray-500 hover:text-red-300 rounded transition-all"
                                      title={`מחק שבוע ${week}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </th>
                            )
                          })}
                          {/* Admin sees user's weeks but cannot add more - this is view only */}
                          {false && numberOfWeeks === 'flexible' && (
                            <th className="border border-dark-border px-0.5 py-0.5 text-purple-300 font-semibold text-center w-16 sm:w-20">
                              ...גמיש
                            </th>
                          )}
                          <th className="border border-dark-border px-0.5 py-0.5 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {workout.exercises.map((exercise, exerciseIndex) => {
                          const numSets = parseInt(exercise.sets) || 3
                          return (
                            <tr key={exerciseIndex} className="hover:bg-dark-card/30">
                              <td className="border border-dark-border px-0.5 py-0.5">
                                <div className="flex flex-col items-center gap-0.5">
                                  <button
                                    onClick={() => moveExerciseUp(workoutIndex, exerciseIndex)}
                                    disabled={exerciseIndex === 0}
                                    className="p-0.5 hover:bg-dark-hover rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                    title="הזז למעלה"
                                  >
                                    <ChevronUp className="w-3 h-3 text-cyan-400" />
                                  </button>
                                  <button
                                    onClick={() => moveExerciseDown(workoutIndex, exerciseIndex)}
                                    disabled={exerciseIndex === workout.exercises.length - 1}
                                    className="p-0.5 hover:bg-dark-hover rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                    title="הזז למטה"
                                  >
                                    <ChevronDown className="w-3 h-3 text-cyan-400" />
                                  </button>
                                </div>
                              </td>
                              <td className="border border-dark-border px-1 py-1">
                                <input
                                  type="text"
                                  placeholder="שם התרגיל"
                                  value={exercise.name}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'name', e.target.value)}
                                  className="w-full bg-transparent text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1"
                                />
                              </td>
                              <td className="border border-dark-border px-0.5 py-0.5">
                                <input
                                  type="text"
                                  placeholder="3"
                                  value={exercise.sets}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'sets', e.target.value)}
                                  className="w-full bg-dark-card text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5"
                                />
                              </td>
                              <td className="border border-dark-border px-0.5 py-0.5">
                                <input
                                  type="text"
                                  placeholder="8-12"
                                  value={exercise.repsRange}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'repsRange', e.target.value)}
                                  className="w-full bg-dark-card text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5"
                                />
                              </td>
                              <td className="border border-dark-border px-0.5 py-0.5">
                                <input
                                  type="text"
                                  placeholder="90s"
                                  value={exercise.rest}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'rest', e.target.value)}
                                  className="w-full bg-dark-card text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5"
                                />
                              </td>
                              <td className="border border-dark-border px-0.5 py-0.5">
                                <input
                                  type="text"
                                  placeholder="2"
                                  value={exercise.rir}
                                  onChange={(e) => updateExerciseField(workoutIndex, exerciseIndex, 'rir', e.target.value)}
                                  className="w-full bg-dark-card text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5"
                                />
                              </td>
                              {Array.from({ length: numberOfWeeks === 'flexible' ? (userAddedWeeks + 1) : numberOfWeeks }, (_, i) => i + 1).map(week => (
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
                                            className="w-7 sm:w-8 bg-dark-card text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5"
                                            maxLength={3}
                                          />
                                          <input
                                            type="text"
                                            placeholder="KG"
                                            value={data.weight}
                                            onChange={(e) => updateWeeklyData(workoutIndex, exerciseIndex, week, setIdx, 'weight', e.target.value)}
                                            className="w-7 sm:w-8 bg-dark-card text-white text-[7px] sm:text-[9px] text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-0.5 py-0.5"
                                            maxLength={5}
                                          />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </td>
                              ))}
                              <td className="border border-dark-border px-0.5 py-0.5 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  {workouts.length > 1 && (
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        const targetIdx = parseInt(e.target.value)
                                        if (!isNaN(targetIdx)) {
                                          moveExerciseToWorkout(workoutIndex, exerciseIndex, targetIdx)
                                        }
                                      }}
                                      className="w-14 bg-dark-card text-cyan-300 text-[7px] sm:text-[8px] border border-dark-border rounded px-0.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                                      title="העבר לאימון אחר"
                                    >
                                      <option value="" disabled>העבר...</option>
                                      {workouts.map((w, i) =>
                                        i !== workoutIndex ? (
                                          <option key={i} value={i}>{w.name}</option>
                                        ) : null
                                      )}
                                    </select>
                                  )}
                                  {workout.exercises.length > 1 && (
                                    <button
                                      onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                                      className="p-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-all"
                                      title="מחק תרגיל"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
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
                </SortableContext>
              </DndContext>

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

      {/* Archive Modal */}
      {archiveWorkoutIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">העבר לארכיון</h3>
            <p className="text-gray-300 mb-4">בחר תיקייה:</p>
            
            {archiveFolders.length === 0 ? (
              <p className="text-gray-400 text-sm mb-4">אין תיקיות זמינות. האימון יועבר לארכיון ללא תיקייה.</p>
            ) : (
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full px-4 py-2 rounded-lg text-right transition-all ${
                    selectedFolderId === null
                      ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                      : 'bg-dark-hover text-gray-300 border border-dark-border hover:bg-dark-border'
                  }`}
                >
                  ללא תיקייה
                </button>
                {archiveFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full px-4 py-2 rounded-lg text-right transition-all ${
                      selectedFolderId === folder.id
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400'
                        : 'bg-dark-hover text-gray-300 border border-dark-border hover:bg-dark-border'
                    }`}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setArchiveWorkoutIndex(null)}
                className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all"
              >
                ביטול
              </button>
              <button
                onClick={handleArchiveWorkout}
                className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
              >
                העבר לארכיון
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Viewer Modal */}
      {showArchiveViewer && (
        <AdminArchiveViewer
          user={user}
          onClose={() => setShowArchiveViewer(false)}
        />
      )}
    </div>
  )
}

export default AdminWorkoutEditor


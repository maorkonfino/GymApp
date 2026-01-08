import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Archive, ChevronDown, ChevronUp, Dumbbell, FolderOpen, ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

interface ArchivedPlan {
  id: number
  name: string
  plan: WorkoutPlan
  archivedAt: string
  folderId?: number
}

interface Folder {
  id: number
  name: string
  plans: ArchivedPlan[]
}

const WorkoutArchive: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [folders, setFolders] = useState<Folder[]>([])
  const [unorganizedPlans, setUnorganizedPlans] = useState<ArchivedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsedFolders, setCollapsedFolders] = useState<Set<number>>(new Set())
  const [collapsedPlans, setCollapsedPlans] = useState<Set<number>>(new Set())
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null)
  const [editFolderName, setEditFolderName] = useState('')

  useEffect(() => {
    fetchArchivedPlans()
  }, [user])

  const fetchArchivedPlans = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await api.get(`/workout-plans/archive/${user.email}`)
      
      // Parse plan_content for each plan
      const foldersWithParsedPlans = (response.data.folders || []).map((folder: any) => ({
        ...folder,
        plans: folder.plans.map((plan: any) => ({
          ...plan,
          plan: JSON.parse(plan.plan_content)
        }))
      }))
      
      const unorganizedWithParsedPlans = (response.data.unorganized || []).map((plan: any) => ({
        ...plan,
        plan: JSON.parse(plan.plan_content)
      }))
      
      setFolders(foldersWithParsedPlans)
      setUnorganizedPlans(unorganizedWithParsedPlans)
    } catch (error) {
      console.error('Error fetching archived plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFolderCollapse = (folderId: number) => {
    setCollapsedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const togglePlanCollapse = (planId: number) => {
    setCollapsedPlans(prev => {
      const newSet = new Set(prev)
      if (newSet.has(planId)) {
        newSet.delete(planId)
      } else {
        newSet.add(planId)
      }
      return newSet
    })
  }

  const createFolder = async () => {
    if (!newFolderName.trim() || !user) return
    
    try {
      await api.post('/workout-plans/folders', { name: newFolderName, userEmail: user.email })
      setNewFolderName('')
      setShowNewFolderInput(false)
      await fetchArchivedPlans()
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('שגיאה ביצירת תיקייה')
    }
  }

  const unarchivePlan = async (planId: number) => {
    if (!user) return
    
    try {
      await api.post(`/workout-plans/unarchive/${planId}`)
      await fetchArchivedPlans()
      alert('התוכנית הוחזרה לעמוד הראשי!')
    } catch (error) {
      console.error('Error unarchiving plan:', error)
      alert('שגיאה בהחזרה מהארכיון')
    }
  }

  const movePlanToFolder = async (planId: number, folderId: number) => {
    if (!user) return
    
    try {
      await api.post(`/workout-plans/move/${planId}`, { folderId })
      await fetchArchivedPlans()
    } catch (error) {
      console.error('Error moving plan:', error)
      alert('שגיאה בהעברת התוכנית')
    }
  }

  const deleteFolder = async (folderId: number) => {
    if (!user) return
    
    const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק את התיקייה? התוכניות בתוכה יועברו ל"ללא ארגון"')
    if (!confirmed) return
    
    try {
      await api.delete(`/workout-plans/folders/${folderId}`)
      await fetchArchivedPlans()
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('שגיאה במחיקת התיקייה')
    }
  }

  const startEditFolder = (folderId: number, currentName: string) => {
    setEditingFolderId(folderId)
    setEditFolderName(currentName)
  }

  const saveEditFolder = async (folderId: number) => {
    if (!user || !editFolderName.trim()) return
    
    try {
      await api.put(`/workout-plans/folders/${folderId}`, { name: editFolderName })
      setEditingFolderId(null)
      setEditFolderName('')
      await fetchArchivedPlans()
    } catch (error) {
      console.error('Error updating folder:', error)
      alert('שגיאה בעדכון שם התיקייה')
    }
  }

  const cancelEditFolder = () => {
    setEditingFolderId(null)
    setEditFolderName('')
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">טוען ארכיון...</p>
      </div>
    )
  }

  return (
    <div className="w-full p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => navigate('/workout-plan')}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center gap-2 font-semibold text-sm"
            title="חזור לתוכנית האימון"
          >
            <ArrowLeft className="w-5 h-5" />
            תוכנית האימון שלי
          </button>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Archive className="w-10 h-10 text-purple-400" />
            ארכיון תוכניות אימון
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          כאן תוכל לארגן ולצפות בתוכניות אימון קודמות
        </p>
      </div>

      {/* Create Folder Button */}
      <div className="flex justify-center mb-6">
        {!showNewFolderInput ? (
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2 font-semibold"
          >
            <FolderOpen className="w-5 h-5" />
            צור תיקייה חדשה
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              placeholder="שם התיקייה"
              className="px-4 py-2 bg-dark-hover border border-purple-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={createFolder}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all font-semibold"
            >
              צור
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false)
                setNewFolderName('')
              }}
              className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all"
            >
              ביטול
            </button>
          </div>
        )}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="space-y-4">
          {folders.map((folder) => {
            const isFolderCollapsed = collapsedFolders.has(folder.id)
            
            return (
              <div key={folder.id} className="bg-dark-card border border-purple-500/30 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-dark-hover/30 -m-2 p-2 rounded-lg transition-colors"
                    onClick={() => toggleFolderCollapse(folder.id)}
                  >
                    <FolderOpen className="w-8 h-8 text-purple-400" />
                    {editingFolderId === folder.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editFolderName}
                          onChange={(e) => setEditFolderName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEditFolder(folder.id)
                            if (e.key === 'Escape') cancelEditFolder()
                          }}
                          className="px-3 py-1 bg-dark-hover border border-purple-500/50 rounded text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditFolder(folder.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                        >
                          שמור
                        </button>
                        <button
                          onClick={cancelEditFolder}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                        >
                          ביטול
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-white">{folder.name}</h2>
                        <span className="text-sm text-gray-400">({folder.plans.length} תוכניות)</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingFolderId !== folder.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditFolder(folder.id, folder.name)
                          }}
                          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="ערוך שם תיקייה"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFolder(folder.id)
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="מחק תיקייה"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => toggleFolderCollapse(folder.id)}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {isFolderCollapsed ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {!isFolderCollapsed && (
                  <div className="space-y-3 mt-4">
                    {folder.plans.map((plan) => {
                      const isPlanCollapsed = collapsedPlans.has(plan.id)
                      
                      return (
                        <div key={plan.id} className="bg-dark-hover border border-dark-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => togglePlanCollapse(plan.id)}
                            >
                              <Dumbbell className="w-6 h-6 text-cyan-400" />
                              <div>
                                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                <p className="text-xs text-gray-400">נשמר ב: {new Date(plan.archivedAt).toLocaleDateString('he-IL')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => unarchivePlan(plan.id)}
                                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all text-sm"
                              >
                                החזר לעמוד ראשי
                              </button>
                              <button 
                                onClick={() => togglePlanCollapse(plan.id)}
                                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                {isPlanCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          
                          {!isPlanCollapsed && (
                            <div className="mt-4 space-y-4">
                              <div className="text-sm text-gray-400 mb-3">
                                מספר שבועות: {plan.plan.numberOfWeeks === 'flexible' ? 'גמיש' : plan.plan.numberOfWeeks}
                              </div>
                              {plan.plan.workouts.map((workout: any, wIdx: number) => (
                                <div key={wIdx} className="bg-dark-card border border-cyan-500/30 rounded-lg p-4">
                                  <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5" />
                                    {workout.name}
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-dark-border">
                                          <th className="text-right px-3 py-2 text-gray-400 font-semibold sticky right-0 bg-dark-card">תרגיל</th>
                                          <th className="text-center px-3 py-2 text-gray-400 font-semibold">סטים</th>
                                          <th className="text-center px-3 py-2 text-gray-400 font-semibold">חזרות</th>
                                          <th className="text-center px-3 py-2 text-gray-400 font-semibold">מנוחה</th>
                                          <th className="text-center px-3 py-2 text-gray-400 font-semibold">RIR</th>
                                          {/* Weekly data columns */}
                                          {Object.keys(workout.exercises[0]?.weeklyData || {}).sort((a, b) => parseInt(a) - parseInt(b)).map((week) => (
                                            <th key={week} className="text-center px-3 py-2 text-cyan-400 font-semibold border-r border-dark-border">
                                              שבוע {week}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {workout.exercises.map((exercise: any, eIdx: number) => (
                                          <tr key={eIdx} className="border-b border-dark-border/50 hover:bg-dark-hover/30 transition-colors">
                                            <td className="text-right px-3 py-2 text-white font-medium sticky right-0 bg-dark-card">{exercise.name}</td>
                                            <td className="text-center px-3 py-2 text-gray-300">{exercise.sets}</td>
                                            <td className="text-center px-3 py-2 text-gray-300">{exercise.repsRange}</td>
                                            <td className="text-center px-3 py-2 text-gray-300">{exercise.rest}</td>
                                            <td className="text-center px-3 py-2 text-gray-300">{exercise.rir}</td>
                                            {/* Weekly data */}
                                            {Object.keys(exercise.weeklyData || {}).sort((a, b) => parseInt(a) - parseInt(b)).map((week) => {
                                              const weekData = exercise.weeklyData[parseInt(week)]
                                              return (
                                                <td key={week} className="text-center px-3 py-2 border-r border-dark-border">
                                                  {weekData && weekData.length > 0 && (
                                                    <div className="text-xs space-y-1">
                                                      {weekData.map((set: any, setIdx: number) => (
                                                        <div key={setIdx} className="text-cyan-300">
                                                          {set.weight && set.reps ? `${set.weight}kg × ${set.reps}` : '-'}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </td>
                                              )
                                            })}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Unorganized Plans */}
      {unorganizedPlans.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">תוכניות ללא ארגון</h2>
          <div className="space-y-3">
            {unorganizedPlans.map((plan) => {
              const isPlanCollapsed = collapsedPlans.has(plan.id)
              
              return (
                <div key={plan.id} className="bg-dark-hover border border-dark-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => togglePlanCollapse(plan.id)}
                    >
                      <Dumbbell className="w-6 h-6 text-cyan-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="text-xs text-gray-400">נשמר ב: {new Date(plan.archivedAt).toLocaleDateString('he-IL')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => unarchivePlan(plan.id)}
                        className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all text-sm"
                      >
                        החזר לעמוד ראשי
                      </button>
                      {folders.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              movePlanToFolder(plan.id, parseInt(e.target.value))
                            }
                          }}
                          className="px-2 py-1 bg-dark-card border border-dark-border rounded text-white text-sm"
                        >
                          <option value="">העבר לתיקייה...</option>
                          {folders.map((folder) => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                          ))}
                        </select>
                      )}
                      <button 
                        onClick={() => togglePlanCollapse(plan.id)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {isPlanCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {!isPlanCollapsed && (
                    <div className="mt-4 space-y-4">
                      <div className="text-sm text-gray-400 mb-3">
                        מספר שבועות: {plan.plan.numberOfWeeks === 'flexible' ? 'גמיש' : plan.plan.numberOfWeeks}
                      </div>
                      {plan.plan.workouts.map((workout: any, wIdx: number) => (
                        <div key={wIdx} className="bg-dark-card border border-cyan-500/30 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                            <Dumbbell className="w-5 h-5" />
                            {workout.name}
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-dark-border">
                                  <th className="text-right px-3 py-2 text-gray-400 font-semibold sticky right-0 bg-dark-card">תרגיל</th>
                                  <th className="text-center px-3 py-2 text-gray-400 font-semibold">סטים</th>
                                  <th className="text-center px-3 py-2 text-gray-400 font-semibold">חזרות</th>
                                  <th className="text-center px-3 py-2 text-gray-400 font-semibold">מנוחה</th>
                                  <th className="text-center px-3 py-2 text-gray-400 font-semibold">RIR</th>
                                  {/* Weekly data columns */}
                                  {Object.keys(workout.exercises[0]?.weeklyData || {}).sort((a, b) => parseInt(a) - parseInt(b)).map((week) => (
                                    <th key={week} className="text-center px-3 py-2 text-cyan-400 font-semibold border-r border-dark-border">
                                      שבוע {week}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {workout.exercises.map((exercise: any, eIdx: number) => (
                                  <tr key={eIdx} className="border-b border-dark-border/50 hover:bg-dark-hover/30 transition-colors">
                                    <td className="text-right px-3 py-2 text-white font-medium sticky right-0 bg-dark-card">{exercise.name}</td>
                                    <td className="text-center px-3 py-2 text-gray-300">{exercise.sets}</td>
                                    <td className="text-center px-3 py-2 text-gray-300">{exercise.repsRange}</td>
                                    <td className="text-center px-3 py-2 text-gray-300">{exercise.rest}</td>
                                    <td className="text-center px-3 py-2 text-gray-300">{exercise.rir}</td>
                                    {/* Weekly data */}
                                    {Object.keys(exercise.weeklyData || {}).sort((a, b) => parseInt(a) - parseInt(b)).map((week) => {
                                      const weekData = exercise.weeklyData[parseInt(week)]
                                      return (
                                        <td key={week} className="text-center px-3 py-2 border-r border-dark-border">
                                          {weekData && weekData.length > 0 && (
                                            <div className="text-xs space-y-1">
                                              {weekData.map((set: any, setIdx: number) => (
                                                <div key={setIdx} className="text-cyan-300">
                                                  {set.weight && set.reps ? `${set.weight}kg × ${set.reps}` : '-'}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {folders.length === 0 && unorganizedPlans.length === 0 && (
        <div className="text-center py-12">
          <Archive className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">הארכיון ריק</h2>
          <p className="text-gray-400">
            כאשר תעביר תוכניות אימון לארכיון, הן יופיעו כאן
          </p>
        </div>
      )}
    </div>
  )
}

export default WorkoutArchive


import React, { useState, useEffect } from 'react'
import { X, Archive, ChevronDown, ChevronUp, Dumbbell, FolderOpen, Edit2, Trash2, Plus } from 'lucide-react'
import { User } from '../types'
import api from '../api'

interface AdminArchiveViewerProps {
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

const AdminArchiveViewer: React.FC<AdminArchiveViewerProps> = ({ user, onClose }) => {
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

  const startEditFolder = (folderId: number, currentName: string) => {
    setEditingFolderId(folderId)
    setEditFolderName(currentName)
  }

  const saveEditFolder = async () => {
    if (!editFolderName.trim() || editingFolderId === null) return
    
    try {
      await api.put(`/workout-plans/folders/${editingFolderId}`, { name: editFolderName })
      setEditingFolderId(null)
      setEditFolderName('')
      await fetchArchivedPlans()
    } catch (error) {
      console.error('Error updating folder:', error)
      alert('שגיאה בעדכון תיקייה')
    }
  }

  const cancelEditFolder = () => {
    setEditingFolderId(null)
    setEditFolderName('')
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
      alert('שגיאה במחיקת תיקייה')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Archive className="w-6 h-6 text-purple-400" />
              ארכיון תוכניות אימון
            </h2>
            <p className="text-gray-400 text-sm mt-1">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* New Folder Button */}
              <div className="flex gap-3">
                {showNewFolderInput ? (
                  <>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                      placeholder="שם התיקייה"
                      className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={createFolder}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all"
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
                  </>
                ) : (
                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    תיקייה חדשה
                  </button>
                )}
              </div>

              {/* Folders */}
              {folders.map(folder => {
                const isFolderCollapsed = collapsedFolders.has(folder.id)
                
                return (
                  <div key={folder.id} className="bg-dark-hover/50 border border-dark-border rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-purple-500/10 border-b border-dark-border">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleFolderCollapse(folder.id)}
                          className="p-1 hover:bg-dark-hover rounded transition-colors"
                        >
                          {isFolderCollapsed ? (
                            <ChevronDown className="w-5 h-5 text-purple-400" />
                          ) : (
                            <ChevronUp className="w-5 h-5 text-purple-400" />
                          )}
                        </button>
                        <FolderOpen className="w-5 h-5 text-purple-400" />
                        {editingFolderId === folder.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editFolderName}
                              onChange={(e) => setEditFolderName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveEditFolder()}
                              className="flex-1 bg-dark-card border border-dark-border rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              autoFocus
                            />
                            <button
                              onClick={saveEditFolder}
                              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-sm"
                            >
                              שמור
                            </button>
                            <button
                              onClick={cancelEditFolder}
                              className="px-3 py-1 bg-dark-hover hover:bg-dark-border text-gray-300 rounded text-sm"
                            >
                              ביטול
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-bold text-white">{folder.name}</h3>
                            <button
                              onClick={() => startEditFolder(folder.id, folder.name)}
                              className="p-1.5 hover:bg-dark-hover rounded transition-colors"
                              title="ערוך שם תיקייה"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                          </>
                        )}
                        <span className="text-sm text-gray-400">({folder.plans.length})</span>
                      </div>
                      <button
                        onClick={() => deleteFolder(folder.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                        title="מחק תיקייה"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {!isFolderCollapsed && folder.plans.length > 0 && (
                      <div className="p-4 space-y-4">
                        {folder.plans.map(plan => {
                          const isPlanCollapsed = collapsedPlans.has(plan.id)
                          return (
                            <div key={plan.id} className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                              <div className="p-3 flex items-center justify-between bg-dark-hover/50">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => togglePlanCollapse(plan.id)}
                                    className="p-1 hover:bg-dark-hover rounded transition-colors"
                                  >
                                    {isPlanCollapsed ? (
                                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                                    ) : (
                                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                                    )}
                                  </button>
                                  <Dumbbell className="w-4 h-4 text-cyan-400" />
                                  <span className="font-semibold text-white">{plan.name}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(plan.archivedAt).toLocaleDateString('he-IL')}
                                  </span>
                                </div>
                                <button
                                  onClick={() => unarchivePlan(plan.id)}
                                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-sm transition-all"
                                >
                                  החזר לתוכנית
                                </button>
                              </div>

                              {!isPlanCollapsed && (
                                <div className="p-4 space-y-4">
                                  {plan.plan.workouts.map((workout: any, wIdx: number) => (
                                    <div key={wIdx} className="bg-dark-hover/30 rounded-lg p-3">
                                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                        <Dumbbell className="w-5 h-5" />
                                        {workout.name}
                                      </h4>
                                      <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr className="bg-dark-card">
                                              <th className="text-right px-3 py-2 text-gray-300 font-semibold border border-dark-border sticky right-0 bg-dark-card">תרגיל</th>
                                              <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">סטים</th>
                                              <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">חזרות</th>
                                              <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">מנוחה</th>
                                              <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">RIR</th>
                                              {/* Weekly data columns */}
                                              {workout.exercises.some((ex: any) => ex.weeklyData && Object.keys(ex.weeklyData).length > 0) &&
                                                (Array.from(
                                                  new Set(
                                                    workout.exercises.flatMap((ex: any) =>
                                                      ex.weeklyData ? Object.keys(ex.weeklyData).map(Number) : []
                                                    )
                                                  )
                                                ) as number[])
                                                  .sort((a, b) => a - b)
                                                  .map((week) => (
                                                    <th key={week} className="text-center px-3 py-2 text-cyan-300 font-semibold border border-dark-border whitespace-nowrap">
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
                                                    <td key={week} className="text-center px-3 py-2 border border-dark-border">
                                                      <div className="flex flex-col gap-1">
                                                        {weekData?.map((set: any, setIdx: number) => (
                                                          <div key={setIdx} className="text-xs text-cyan-300">
                                                            {set.weight && set.reps ? `${set.weight} × ${set.reps}` : '-'}
                                                          </div>
                                                        ))}
                                                      </div>
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

                    {!isFolderCollapsed && folder.plans.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                        <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>אין תוכניות בתיקייה זו</p>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Unorganized Plans */}
              {unorganizedPlans.length > 0 && (
                <div className="bg-dark-hover/50 border border-dark-border rounded-xl overflow-hidden">
                  <div className="p-4 bg-gray-500/10 border-b border-dark-border">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Archive className="w-5 h-5 text-gray-400" />
                      ללא ארגון
                      <span className="text-sm text-gray-400">({unorganizedPlans.length})</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {unorganizedPlans.map(plan => {
                      const isPlanCollapsed = collapsedPlans.has(plan.id)
                      return (
                        <div key={plan.id} className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                          <div className="p-3 flex items-center justify-between bg-dark-hover/50">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => togglePlanCollapse(plan.id)}
                                className="p-1 hover:bg-dark-hover rounded transition-colors"
                              >
                                {isPlanCollapsed ? (
                                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <ChevronUp className="w-4 h-4 text-cyan-400" />
                                )}
                              </button>
                              <Dumbbell className="w-4 h-4 text-cyan-400" />
                              <span className="font-semibold text-white">{plan.name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(plan.archivedAt).toLocaleDateString('he-IL')}
                              </span>
                            </div>
                            <button
                              onClick={() => unarchivePlan(plan.id)}
                              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-sm transition-all"
                            >
                              החזר לתוכנית
                            </button>
                          </div>

                          {!isPlanCollapsed && (
                            <div className="p-4 space-y-4">
                              {plan.plan.workouts.map((workout: any, wIdx: number) => (
                                <div key={wIdx} className="bg-dark-hover/30 rounded-lg p-3">
                                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5" />
                                    {workout.name}
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                      <thead>
                                        <tr className="bg-dark-card">
                                          <th className="text-right px-3 py-2 text-gray-300 font-semibold border border-dark-border sticky right-0 bg-dark-card">תרגיל</th>
                                          <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">סטים</th>
                                          <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">חזרות</th>
                                          <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">מנוחה</th>
                                          <th className="text-center px-3 py-2 text-gray-300 font-semibold border border-dark-border">RIR</th>
                                          {workout.exercises.some((ex: any) => ex.weeklyData && Object.keys(ex.weeklyData).length > 0) &&
                                            (Array.from(
                                              new Set(
                                                workout.exercises.flatMap((ex: any) =>
                                                  ex.weeklyData ? Object.keys(ex.weeklyData).map(Number) : []
                                                )
                                              )
                                            ) as number[])
                                              .sort((a, b) => a - b)
                                              .map((week) => (
                                                <th key={week} className="text-center px-3 py-2 text-cyan-300 font-semibold border border-dark-border whitespace-nowrap">
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
                                            {Object.keys(exercise.weeklyData || {}).sort((a, b) => parseInt(a) - parseInt(b)).map((week) => {
                                              const weekData = exercise.weeklyData[parseInt(week)]
                                              return (
                                                <td key={week} className="text-center px-3 py-2 border border-dark-border">
                                                  <div className="flex flex-col gap-1">
                                                    {weekData?.map((set: any, setIdx: number) => (
                                                      <div key={setIdx} className="text-xs text-cyan-300">
                                                        {set.weight && set.reps ? `${set.weight} × ${set.reps}` : '-'}
                                                      </div>
                                                    ))}
                                                  </div>
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

              {folders.length === 0 && unorganizedPlans.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">אין תוכניות בארכיון</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminArchiveViewer


import React, { useState, useEffect } from 'react'
import { X, Trash2, LineChart, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { User } from '../types'
import { format, startOfWeek } from 'date-fns'
import { he } from 'date-fns/locale'
import WeightGraph from './WeightGraph'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

interface AdminNutritionEditorProps {
  user: User
  onClose: () => void
}

interface DailyEntry {
  date: string
  morningWeight: string
  calories: string
  protein: string
  fat: string
  carbs: string
  steps: string
  notes: string
}

const AdminNutritionEditor: React.FC<AdminNutritionEditorProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'graph'>('tracking')
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`admin-nutrition-collapsed-weeks-${user.id}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  useEffect(() => {
    loadEntries()
  }, [user])

  useEffect(() => {
    localStorage.setItem(`admin-nutrition-collapsed-weeks-${user.id}`, JSON.stringify(Array.from(collapsedWeeks)))
  }, [collapsedWeeks, user.id])

  const toggleWeekCollapse = (weekKey: string) => {
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

  const loadEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/daily-tracking/${user.email}`)
      const data = await response.json()

      let formattedEntries: DailyEntry[] = []

      if (data && Array.isArray(data) && data.length > 0) {
        formattedEntries = data.map((entry: any) => ({
          date: entry.date,
          morningWeight: entry.morning_weight?.toString() || '',
          calories: entry.total_calories?.toString() || '',
          protein: entry.protein?.toString() || '',
          fat: entry.fat?.toString() || '',
          carbs: entry.carbs?.toString() || '',
          steps: entry.steps?.toString() || '',
          notes: entry.notes || ''
        }))
      }

      formattedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setEntries(formattedEntries)
    } catch (error) {
      console.error('Error loading daily tracking:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRow = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    setEntries([...entries, {
      date: today,
      morningWeight: '',
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
      steps: '',
      notes: ''
    }])
  }

  const removeRow = (index: number) => {
    const entry = entries[index]
    
    setEntries(entries.filter((_, i) => i !== index))
    
    // Delete from server if it exists
    fetch(`${API_URL}/daily-tracking/${user.email}/${entry.date}`, {
      method: 'DELETE'
    }).catch(error => console.error('Error deleting entry:', error))
  }

  const updateEntry = (index: number, field: keyof DailyEntry, value: string) => {
    const newEntries = [...entries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    
    // Sort by date after updating
    newEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEntries(newEntries)
    
    // Save to backend with debounce
    if (saveTimeout) clearTimeout(saveTimeout)
    
    setIsSaving(true)
    const timeout = setTimeout(async () => {
      try {
        const entry = newEntries[index]
        await fetch(`${API_URL}/daily-tracking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            date: entry.date,
            morningWeight: parseFloat(entry.morningWeight) || null,
            totalCalories: parseFloat(entry.calories) || null,
            protein: parseFloat(entry.protein) || null,
            fat: parseFloat(entry.fat) || null,
            carbs: parseFloat(entry.carbs) || null,
            steps: parseInt(entry.steps) || null,
            notes: entry.notes
          })
        })
        console.log('✅ יומן מעקב נשמר אוטומטית')
      } catch (error) {
        console.error('Error saving entry:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000)
    
    setSaveTimeout(timeout)
  }

  // Get week number from date (Sunday = week start)
  const getWeekNumber = (date: string): string => {
    const d = new Date(date)
    const weekStart = startOfWeek(d, { weekStartsOn: 0 }) // 0 = Sunday
    return format(weekStart, 'yyyy-MM-dd')
  }

  // Calculate entries with weekly averages
  const getEntriesWithAverages = () => {
    const result: (DailyEntry & { isAverage?: boolean; weekKey?: string })[] = []
    const weeks = new Map<string, DailyEntry[]>()
    
    // Group by week
    entries.forEach(entry => {
      const weekKey = getWeekNumber(entry.date)
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, [])
      }
      weeks.get(weekKey)!.push(entry)
    })
    
    // Add entries with averages
    weeks.forEach((weekEntries, weekKey) => {
      // Calculate averages for this week
      const weights = weekEntries
        .map(e => parseFloat(e.morningWeight))
        .filter(w => !isNaN(w) && w > 0)

      const stepsArr = weekEntries
        .map(e => parseFloat(e.steps))
        .filter(s => !isNaN(s) && s > 0)

      const avgWeight = weights.length > 0
        ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
        : ''

      const avgSteps = stepsArr.length > 0
        ? (stepsArr.reduce((a, b) => a + b, 0) / stepsArr.length).toFixed(0)
        : ''
      
      // Add average row first
      const isWeekCollapsed = collapsedWeeks.has(weekKey)
      
      result.push({
        date: weekKey,
        morningWeight: avgWeight,
        calories: '',
        protein: '',
        fat: '',
        carbs: '',
        steps: avgSteps,
        notes: 'ממוצע שבועי',
        isAverage: true,
        weekKey
      })
      
      // Add week entries if not collapsed
      if (!isWeekCollapsed) {
        weekEntries.forEach(entry => {
          result.push({ ...entry, weekKey })
        })
      }
    })
    
    return result
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-card rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-dark-border shadow-2xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl p-4 sm:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-dark-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">מעקב תזונה - {user.name}</h2>
            {isSaving ? (
              <div className="text-cyan-400 flex items-center gap-2 text-sm mt-1">
                <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <span>שומר...</span>
              </div>
            ) : (
              <div className="text-green-400 text-sm mt-1">✓ נשמר אוטומטית</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Daily Tracking Table */}
        <div className="bg-dark-hover border border-dark-border rounded-xl p-6 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LineChart className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">יומן מעקב</h3>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={addRow}
                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                הוסף שורה
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[7px] sm:text-[9px]">
              <thead className="sticky top-0 z-20">
                <tr className="border-b border-dark-border bg-dark-hover">
                  <th className="text-right p-0.5 sm:p-1 text-gray-400 font-medium sticky right-0 bg-dark-hover z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] w-[45px] sm:w-[60px]">תאריך</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">משקל</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">צעדים</th>
                  <th className="w-6 sm:w-8"></th>
                </tr>
              </thead>
              <tbody>
                {getEntriesWithAverages().map((entry, displayIndex) => {
                  const isAverage = 'isAverage' in entry && entry.isAverage
                  const actualIndex = isAverage ? -1 : entries.findIndex(e => e.date === entry.date)
                  
                  const weekKey = 'weekKey' in entry && typeof entry.weekKey === 'string' ? entry.weekKey : '';
                  const isWeekCollapsed = collapsedWeeks.has(weekKey);

                  if (isWeekCollapsed && !isAverage) {
                    return null;
                  }

                  return (
                    <tr 
                      key={`${entry.date}-${displayIndex}`} 
                      className={`border-b border-dark-border/30 ${
                        isAverage 
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/20 font-bold' 
                          : 'hover:bg-dark-card/30'
                      }`}
                    >
                      <td className={`p-0.5 sticky right-0 shadow-[2px_0_5px_rgba(0,0,0,0.3)] ${isAverage ? 'bg-cyan-500/10' : 'bg-dark-hover'} flex items-center justify-between`}>
                        {isAverage ? (
                          <div className="text-cyan-300 text-[7px] sm:text-[9px] px-0.5 py-0.5 font-semibold">
                            {entry.notes}
                          </div>
                        ) : actualIndex >= 0 ? (
                          <div className="text-white text-[7px] sm:text-[9px] px-0.5 py-0.5 font-medium whitespace-nowrap">
                            {format(new Date(entry.date), "EEE d.M", { locale: he })}
                          </div>
                        ) : (
                          <div className="text-gray-600 text-[7px] sm:text-[9px] px-0.5 py-0.5">-</div>
                        )}
                        {isAverage && 'weekKey' in entry && typeof entry.weekKey === 'string' && (
                          <button
                            onClick={() => toggleWeekCollapse(entry.weekKey as string)}
                            className="p-0.5 hover:bg-cyan-500/20 rounded transition-colors text-cyan-400"
                            title={collapsedWeeks.has(entry.weekKey as string) ? "פתח שבוע" : "סגור שבוע"}
                          >
                            {collapsedWeeks.has(entry.weekKey as string) ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronUp className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </td>
                      {(['morningWeight', 'steps'] as const).map((field) => (
                        <td key={field} className="p-0.5 text-center">
                          {isAverage ? (
                            <div className="text-cyan-300 font-bold text-[8px] sm:text-[10px]">
                              {entry[field] || '-'}
                            </div>
                          ) : actualIndex >= 0 ? (
                            <input
                              type="number"
                              step="0.1"
                              value={entry[field]}
                              onChange={(e) => updateEntry(actualIndex, field, e.target.value)}
                              className="w-9 sm:w-11 bg-dark-card border border-dark-border rounded px-0.5 py-0.5 text-white text-center text-[7px] sm:text-[9px] font-bold focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="0"
                            />
                          ) : (
                            <div className="text-gray-600">-</div>
                          )}
                        </td>
                      ))}
                      <td className="p-0.5 text-center">
                        {!isAverage && actualIndex >= 0 && (
                          <button
                            onClick={() => removeRow(actualIndex)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graph View */}
        <div className="bg-dark-hover border border-dark-border rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">גרף התקדמות משקל</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  activeTab === 'tracking'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-dark-card text-gray-400 hover:bg-dark-border'
                }`}
              >
                יומן מעקב
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  activeTab === 'graph'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-dark-card text-gray-400 hover:bg-dark-border'
                }`}
              >
                גרף
              </button>
            </div>
          </div>
          {activeTab === 'graph' && (
            <WeightGraph 
              entries={entries
                .filter(e => e.morningWeight && parseFloat(e.morningWeight) > 0)
                .map(e => ({
                  date: e.date,
                  weight: parseFloat(e.morningWeight)
                }))
              }
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminNutritionEditor

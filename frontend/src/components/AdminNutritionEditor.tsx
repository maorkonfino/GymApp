import React, { useState, useEffect } from 'react'
import { X, Apple, Trash2, LineChart, ChevronDown, ChevronUp, MessageSquare, Plus } from 'lucide-react'
import { User } from '../types'
import { format, startOfWeek } from 'date-fns'
import { he } from 'date-fns/locale'
import api from '../api'
import WeightGraph from './WeightGraph'
import NotesModal from './NotesModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

interface AdminNutritionEditorProps {
  user: User
  onClose: () => void
}

interface NutritionGoals {
  regularDay: {
    protein: number
    fat: number
    carbs: number
    calories: number
  }
  loadingDay: {
    protein: number
    fat: number
    carbs: number
    calories: number
  }
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
  const [goals, setGoals] = useState<NutritionGoals>({
    regularDay: { protein: 0, fat: 0, carbs: 0, calories: 0 },
    loadingDay: { protein: 0, fat: 0, carbs: 0, calories: 0 },
  })
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Load collapse states from localStorage
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`admin-nutrition-collapsed-weeks-${user.id}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [goalsCollapsed, setGoalsCollapsed] = useState(() => {
    const saved = localStorage.getItem(`admin-nutrition-goals-collapsed-${user.id}`)
    return saved === 'true'
  })

  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [notesModalIndex, setNotesModalIndex] = useState<number>(-1)
  const [notesModalValue, setNotesModalValue] = useState('')

  useEffect(() => {
    loadGoals()
    loadEntries()
  }, [user])

  // Save collapse states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`admin-nutrition-collapsed-weeks-${user.id}`, JSON.stringify(Array.from(collapsedWeeks)))
  }, [collapsedWeeks, user.id])

  useEffect(() => {
    localStorage.setItem(`admin-nutrition-goals-collapsed-${user.id}`, goalsCollapsed.toString())
  }, [goalsCollapsed, user.id])

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

  const toggleGoalsCollapse = () => {
    setGoalsCollapsed(prev => !prev)
  }

  const openNotesModal = (index: number) => {
    setNotesModalIndex(index)
    setNotesModalValue(entries[index].notes)
    setNotesModalOpen(true)
  }

  const closeNotesModal = () => {
    setNotesModalOpen(false)
    setNotesModalIndex(-1)
    setNotesModalValue('')
  }

  const saveNotesModal = (newNotes: string) => {
    if (notesModalIndex !== -1) {
      updateEntry(notesModalIndex, 'notes', newNotes)
    }
    closeNotesModal()
  }

  const calculateCalories = (protein: number, fat: number, carbs: number): number => {
    return Math.round((protein * 4) + (fat * 9) + (carbs * 4))
  }

  const loadGoals = async () => {
    setLoadingGoals(true)
    try {
      const response = await api.get(`/nutrition-goals/user/${user.id}`)
      if (response.data && response.data.length > 0) {
        const data = response.data[0]
        const regularProtein = data.regular_day_protein || 0
        const regularFat = data.regular_day_fat || 0
        const regularCarbs = data.regular_day_carbs || 0
        const loadingProtein = data.loading_day_protein || 0
        const loadingFat = data.loading_day_fat || 0
        const loadingCarbs = data.loading_day_carbs || 0
        
        setGoals({
          regularDay: {
            protein: regularProtein,
            fat: regularFat,
            carbs: regularCarbs,
            calories: calculateCalories(regularProtein, regularFat, regularCarbs)
          },
          loadingDay: {
            protein: loadingProtein,
            fat: loadingFat,
            carbs: loadingCarbs,
            calories: calculateCalories(loadingProtein, loadingFat, loadingCarbs)
          }
        })
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error)
    } finally {
      setLoadingGoals(false)
    }
  }

  // Load daily tracking entries from server
  const loadEntries = async () => {
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
      
      // Sort by date (no auto-creation of days for admin)
      formattedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setEntries(formattedEntries)
      
    } catch (error) {
      console.error('Error loading daily tracking:', error)
      // First time - create current week's entries
      const today = new Date()
      const currentDayOfWeek = today.getDay()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - currentDayOfWeek)
      
      const weekEntries: DailyEntry[] = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        weekEntries.push({
          date: format(date, 'yyyy-MM-dd'),
          morningWeight: '',
          calories: '',
          protein: '',
          fat: '',
          carbs: '',
          steps: '',
          notes: ''
        })
      }
      
      setEntries(weekEntries)
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

  const updateGoals = (dayType: 'regularDay' | 'loadingDay', field: 'protein' | 'fat' | 'carbs', value: number) => {
    setGoals(prev => {
      const newGoals = { ...prev }
      newGoals[dayType][field] = value
      newGoals[dayType].calories = calculateCalories(
        newGoals[dayType].protein,
        newGoals[dayType].fat,
        newGoals[dayType].carbs
      )
      return newGoals
    })
    
    // Save to backend with debounce
    if (saveTimeout) clearTimeout(saveTimeout)
    
    setIsSaving(true)
    const timeout = setTimeout(async () => {
      try {
        await api.post('/nutrition-goals', {
          userId: user.id,
          normalProtein: goals.regularDay.protein,
          normalFat: goals.regularDay.fat,
          normalCarbs: goals.regularDay.carbs,
          loadingProtein: goals.loadingDay.protein,
          loadingFat: goals.loadingDay.fat,
          loadingCarbs: goals.loadingDay.carbs,
          updated_by: user.email
        })
        console.log('✅ יעדי תזונה נשמרו אוטומטית')
      } catch (error) {
        console.error('Error saving goals:', error)
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
      
      const calories = weekEntries
        .map(e => parseFloat(e.calories))
        .filter(c => !isNaN(c) && c > 0)
      
      const proteins = weekEntries
        .map(e => parseFloat(e.protein))
        .filter(p => !isNaN(p) && p > 0)
      
      const fats = weekEntries
        .map(e => parseFloat(e.fat))
        .filter(f => !isNaN(f) && f > 0)
      
      const carbs = weekEntries
        .map(e => parseFloat(e.carbs))
        .filter(c => !isNaN(c) && c > 0)
      
      const steps = weekEntries
        .map(e => parseFloat(e.steps))
        .filter(s => !isNaN(s) && s > 0)
      
      const avgWeight = weights.length > 0 
        ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
        : ''
      
      const avgCalories = calories.length > 0
        ? (calories.reduce((a, b) => a + b, 0) / calories.length).toFixed(0)
        : ''
      
      const avgProtein = proteins.length > 0
        ? (proteins.reduce((a, b) => a + b, 0) / proteins.length).toFixed(1)
        : ''
      
      const avgFat = fats.length > 0
        ? (fats.reduce((a, b) => a + b, 0) / fats.length).toFixed(1)
        : ''
      
      const avgCarbs = carbs.length > 0
        ? (carbs.reduce((a, b) => a + b, 0) / carbs.length).toFixed(1)
        : ''
      
      const avgSteps = steps.length > 0
        ? (steps.reduce((a, b) => a + b, 0) / steps.length).toFixed(0)
        : ''
      
      // Add average row first
      const isWeekCollapsed = collapsedWeeks.has(weekKey)
      
      result.push({
        date: weekKey,
        morningWeight: avgWeight,
        calories: avgCalories,
        protein: avgProtein,
        fat: avgFat,
        carbs: avgCarbs,
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

  if (loadingGoals) {
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

        {/* Nutrition Goals Table */}
        <div className="bg-dark-hover border border-dark-border rounded-xl p-6 shadow-xl mb-6">
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer hover:bg-dark-card/30 -m-2 p-2 rounded-lg transition-colors"
            onClick={toggleGoalsCollapse}
          >
            <div className="flex items-center gap-3">
              <Apple className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-white">יעדי תזונה</h3>
            </div>
            <button className="text-green-400 hover:text-green-300 transition-colors">
              {goalsCollapsed ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
            </button>
          </div>

          {!goalsCollapsed && (
            <div className="overflow-x-auto">
              <table className="w-full text-[7px] sm:text-sm">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-right p-1 sm:p-3 text-gray-400 font-medium">מדד</th>
                    <th className="text-center p-1 sm:p-3 text-gray-400 font-medium">יום רגיל</th>
                    <th className="text-center p-1 sm:p-3 text-gray-400 font-medium">יום העמסה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark-border/30">
                    <td className="p-1 sm:p-3 text-white font-medium">קלוריות</td>
                    <td className="p-1 sm:p-3 text-center">
                      <div className="text-green-400 font-bold text-[8px] sm:text-base">
                        {goals.regularDay.calories}
                      </div>
                      <div className="text-[6px] sm:text-xs text-gray-500 mt-1">מחושב אוטומטית</div>
                    </td>
                    <td className="p-1 sm:p-3 text-center">
                      <div className="text-green-400 font-bold text-[8px] sm:text-base">
                        {goals.loadingDay.calories}
                      </div>
                      <div className="text-[6px] sm:text-xs text-gray-500 mt-1">מחושב אוטומטית</div>
                    </td>
                  </tr>
                  {(['protein', 'fat', 'carbs'] as const).map((nutrient) => (
                    <tr key={nutrient} className="border-b border-dark-border/30">
                      <td className="p-1 sm:p-3 text-white">
                        {nutrient === 'protein' ? 'חלבון' : 
                         nutrient === 'fat' ? 'שומן' : 
                         'פחמימה'}
                      </td>
                      <td className="p-1 sm:p-3 text-center">
                        <input
                          type="number"
                          value={goals.regularDay[nutrient]}
                          onChange={(e) => updateGoals('regularDay', nutrient, parseFloat(e.target.value) || 0)}
                          className="w-16 sm:w-24 bg-dark-card border border-dark-border rounded px-1 sm:px-3 py-1 sm:py-2 text-white text-center text-[7px] sm:text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                      <td className="p-1 sm:p-3 text-center">
                        <input
                          type="number"
                          value={goals.loadingDay[nutrient]}
                          onChange={(e) => updateGoals('loadingDay', nutrient, parseFloat(e.target.value) || 0)}
                          className="w-16 sm:w-24 bg-dark-card border border-dark-border rounded px-1 sm:px-3 py-1 sm:py-2 text-white text-center text-[7px] sm:text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">משקל בוקר</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">קלוריות</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">חלבון</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">שומן</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">פחמימות</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">צעדים</th>
                  <th className="text-center p-0.5 sm:p-1 text-gray-400 font-medium w-10 sm:w-12">הערות</th>
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
                      {(['morningWeight', 'calories', 'protein', 'fat', 'carbs', 'steps'] as const).map((field) => (
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
                        {isAverage ? (
                          <div className="text-gray-600 text-[7px]">-</div>
                        ) : actualIndex >= 0 ? (
                          <button
                            onClick={() => openNotesModal(actualIndex)}
                            className="w-9 sm:w-11 h-6 sm:h-7 bg-dark-card border border-dark-border rounded text-white text-[7px] sm:text-[9px] flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors hover:bg-dark-border"
                            title={entry.notes || "הוסף הערות..."}
                          >
                            {entry.notes ? <MessageSquare className="w-3 h-3 text-green-400" /> : <Plus className="w-3 h-3 text-gray-400" />}
                          </button>
                        ) : (
                          <div className="text-gray-600 text-[7px]">-</div>
                        )}
                      </td>
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

        {/* Notes Modal */}
        {notesModalOpen && (
          <NotesModal
            isOpen={notesModalOpen}
            onClose={closeNotesModal}
            onSave={saveNotesModal}
            initialNotes={notesModalValue}
          />
        )}
      </div>
    </div>
  )
}

export default AdminNutritionEditor

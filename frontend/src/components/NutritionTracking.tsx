import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Apple, Trash2, LineChart, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import WeightGraph from './WeightGraph'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

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

const NutritionTracking: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'tracking' | 'graph'>('tracking')
  const [hasNutritionPlan, setHasNutritionPlan] = useState<boolean | null>(null)
  const [goals, setGoals] = useState<NutritionGoals | null>(null)
  const [goalsCollapsed, setGoalsCollapsed] = useState(() => {
    const saved = localStorage.getItem('nutrition-goals-collapsed')
    return saved === 'true'
  })

  const calculateCalories = (protein: number, fat: number, carbs: number): number => {
    return Math.round((protein * 4) + (fat * 9) + (carbs * 4))
  }

  useEffect(() => {
    localStorage.setItem('nutrition-goals-collapsed', goalsCollapsed.toString())
  }, [goalsCollapsed])

  useEffect(() => {
    const checkNutritionPlan = async () => {
      if (!user) {
        setHasNutritionPlan(false)
        return
      }

      if (isAdmin) {
        setHasNutritionPlan(true)
        return
      }

      try {
        const response = await fetch(`${API_URL}/nutrition-goals/${user.email}`)
        const data = await response.json()

        if (data && (
          data.regular_day_protein > 0 ||
          data.regular_day_fat > 0 ||
          data.regular_day_carbs > 0 ||
          data.loading_day_protein > 0 ||
          data.loading_day_fat > 0 ||
          data.loading_day_carbs > 0
        )) {
          setHasNutritionPlan(true)
          const rp = data.regular_day_protein || 0
          const rf = data.regular_day_fat || 0
          const rc = data.regular_day_carbs || 0
          const lp = data.loading_day_protein || 0
          const lf = data.loading_day_fat || 0
          const lc = data.loading_day_carbs || 0
          setGoals({
            regularDay: { protein: rp, fat: rf, carbs: rc, calories: calculateCalories(rp, rf, rc) },
            loadingDay: { protein: lp, fat: lf, carbs: lc, calories: calculateCalories(lp, lf, lc) }
          })
        } else {
          setHasNutritionPlan(false)
        }
      } catch (error) {
        console.error('Error checking nutrition plan:', error)
        setHasNutritionPlan(false)
      }
    }

    checkNutritionPlan()
  }, [user, isAdmin])

  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(() => {
    // Load collapsed weeks from localStorage
    const saved = localStorage.getItem('nutrition-collapsed-weeks')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  // Load daily tracking entries from server
  useEffect(() => {
    const loadEntries = async () => {
      if (!user) {
        setEntries([])
        return
      }

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
        
        // Add current week and last week's dates if they don't exist (only up to today)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time for comparison
        const currentDayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - currentDayOfWeek) // Go back to Sunday of current week
        
        // Go back one more week to include last week
        const startOfLastWeek = new Date(startOfWeek)
        startOfLastWeek.setDate(startOfWeek.getDate() - 7) // Go back to Sunday of last week
        
        // Create days for both last week and current week (only up to today)
        for (let i = 0; i < 14; i++) { // 14 days = 2 weeks
          const date = new Date(startOfLastWeek)
          date.setDate(startOfLastWeek.getDate() + i)
          date.setHours(0, 0, 0, 0) // Reset time for comparison
          
          // Skip future dates
          if (date > today) {
            continue
          }
          
          const dateStr = format(date, 'yyyy-MM-dd')
          
          // Check if this date already exists
          const exists = formattedEntries.some((entry: DailyEntry) => entry.date === dateStr)
          
          if (!exists) {
            formattedEntries.push({
              date: dateStr,
              morningWeight: '',
              calories: '',
              protein: '',
              fat: '',
              carbs: '',
              steps: '',
              notes: ''
            })
          }
        }
        
        // Sort by date
        formattedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setEntries(formattedEntries)
        
      } catch (error) {
        console.error('Error loading daily tracking:', error)
        // First time - create current week's entries (only up to today)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time for comparison
        const currentDayOfWeek = today.getDay()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - currentDayOfWeek)
        
        const weekEntries: DailyEntry[] = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + i)
          date.setHours(0, 0, 0, 0) // Reset time for comparison
          
          // Skip future dates
          if (date > today) {
            continue
          }
          
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

    loadEntries()
  }, [user])

  // Save collapsed weeks to localStorage
  useEffect(() => {
    localStorage.setItem('nutrition-collapsed-weeks', JSON.stringify(Array.from(collapsedWeeks)))
  }, [collapsedWeeks])



  const removeRow = (index: number) => {
    if (index < 0 || index >= entries.length) return
    
    const newEntries = [...entries]
    newEntries.splice(index, 1)
    setEntries(newEntries)
  }

  const updateEntry = (index: number, field: keyof DailyEntry, value: string) => {
    if (index < 0 || index >= entries.length) return
    
    const newEntries = [...entries]
    newEntries[index][field] = value
    
    // Sort by date after updating
    newEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEntries(newEntries)
  }


  // Get week number for a date (Sunday = start of week)
  const getWeekKey = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const day = date.getDay() // 0 = Sunday, 6 = Saturday
      const sunday = new Date(date)
      sunday.setDate(date.getDate() - day)
      return format(sunday, 'yyyy-MM-dd')
    } catch (error) {
      console.error('Error in getWeekKey:', error)
      return dateStr
    }
  }

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

  // Group entries by week and calculate weekly averages
  const getEntriesWithAverages = () => {
    if (!entries || entries.length === 0) return []

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Filter out future dates
      const pastAndTodayEntries = entries.filter(entry => entry.date <= today)
      
      // Group entries by week
      const weeks: { [key: string]: DailyEntry[] } = {}
      pastAndTodayEntries.forEach(entry => {
        if (!entry || !entry.date) return
        const weekKey = getWeekKey(entry.date)
        if (!weeks[weekKey]) {
          weeks[weekKey] = []
        }
        weeks[weekKey].push(entry)
      })

      // Create result array with entries and weekly averages
      const result: (DailyEntry & { isAverage?: boolean; weekKey?: string; isToday?: boolean })[] = []
      
      Object.keys(weeks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).forEach(weekKey => {
        const weekEntries = weeks[weekKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        // Calculate weekly averages for all fields
        const calculateAverage = (field: keyof DailyEntry) => {
          const validValues = weekEntries
            .filter(e => e && e[field] && parseFloat(e[field] as string) > 0)
            .map(e => parseFloat(e[field] as string))
          
          return validValues.length > 0
            ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1)
            : ''
        }

        const isCollapsed = collapsedWeeks.has(weekKey)

        // Add average row at the top of the week
        result.push({
          date: weekKey,
          morningWeight: calculateAverage('morningWeight'),
          calories: '',
          protein: '',
          fat: '',
          carbs: '',
          steps: calculateAverage('steps'),
          notes: `ממוצע שבועי`,
          isAverage: true,
          weekKey: weekKey
        })

        // Add week entries BELOW the average (if not collapsed)
        if (!isCollapsed) {
          const entriesWithToday = weekEntries.map(entry => ({
            ...entry,
            isToday: entry.date === today
          }))
          result.push(...entriesWithToday)
        }
      })

      return result
    } catch (error) {
      console.error('Error in getEntriesWithAverages:', error)
      return entries || []
    }
  }

  const saveData = async (entriesToSave: DailyEntry[]) => {
    if (!user) return

    setIsSaving(true)
    try {
      await fetch(`${API_URL}/daily-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          entries: entriesToSave.map(entry => ({
            date: entry.date,
            morning_weight: parseFloat(entry.morningWeight) || null,
            calories: parseFloat(entry.calories) || null,
            protein: parseFloat(entry.protein) || null,
            fat: parseFloat(entry.fat) || null,
            carbs: parseFloat(entry.carbs) || null,
            steps: parseInt(entry.steps) || null,
            notes: entry.notes
          }))
        })
      })
      
      console.log('✅ נתונים נשמרו אוטומטית')
    } catch (error) {
      console.error('Error saving daily tracking:', error)
    } finally {
      setTimeout(() => setIsSaving(false), 1000)
    }
  }


  // Auto-save when entries change (with debounce)
  useEffect(() => {
    if (!user || entries.length === 0) return

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Set new timeout for auto-save (2 seconds after last change)
    const timeout = setTimeout(() => {
      saveData(entries)
    }, 2000)

    setSaveTimeout(timeout)

    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [entries])

  // Loading state
  if (hasNutritionPlan === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">טוען...</p>
        </div>
      </div>
    )
  }

  // No nutrition plan - show message
  if (!hasNutritionPlan && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="max-w-md text-center space-y-6 animate-fade-in">
          <img src="/header-logo.svg" alt="BEAST Logo" className="w-64 sm:w-80 h-auto mx-auto" />
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">מעקב תזונה</h2>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 space-y-3">
            <p className="text-yellow-300 text-lg font-medium">
              ⚠️ אין לך תוכנית ליווי תזונה
            </p>
            <p className="text-gray-300">
              עדיין לא הוגדרה עבורך תוכנית מעקב תזונה מותאמת אישית.
            </p>
            <p className="text-gray-400 text-sm">
              💬 יש ליצור קשר עם המנהל להגדרת תוכנית ליווי תזונה
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">מעקב תזונה והתקדמות</h2>
              <p className="text-gray-400 text-sm">יומן מעקב יומי</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'tracking'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              }`}
            >
              טבלה
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'graph'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              }`}
            >
              <LineChart className="w-4 h-4" />
              גרף
            </button>
          </div>
        </div>
      </div>

      {/* Nutrition Goals */}
      {goals && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-dark-hover/30 -m-2 p-2 rounded-lg transition-colors"
            onClick={() => setGoalsCollapsed(prev => !prev)}
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
            <div className="overflow-x-auto mt-4">
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
                        {nutrient === 'protein' ? 'חלבון (ג׳)' :
                         nutrient === 'fat' ? 'שומן (ג׳)' :
                         'פחמימה (ג׳)'}
                      </td>
                      <td className="p-1 sm:p-3 text-center">
                        <div className="text-white font-bold text-[8px] sm:text-base">
                          {goals.regularDay[nutrient]}
                        </div>
                      </td>
                      <td className="p-1 sm:p-3 text-center">
                        <div className="text-white font-bold text-[8px] sm:text-base">
                          {goals.loadingDay[nutrient]}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tracking' ? (
        <>
          {/* Daily Tracking Table */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LineChart className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-green-400">יומן מעקב</h3>
              </div>
              <div className="flex gap-2 items-center">
                {isSaving ? (
                  <span className="text-xs text-cyan-400 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    שומר...
                  </span>
                ) : (
                  <span className="text-xs text-green-400">✓ נשמר אוטומטית</span>
                )}
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-[7px] sm:text-[9px]">
                <thead className="sticky top-0 z-20">
                  <tr className="border-b border-dark-border bg-dark-card">
                    <th className="text-right p-0.5 text-gray-400 font-medium sticky right-0 bg-dark-card z-30 shadow-[2px_0_5px_rgba(0,0,0,0.3)] w-[45px] sm:w-[60px]">תאריך</th>
                    <th className="text-center p-0.5 text-gray-400 font-medium w-10 sm:w-12">משקל</th>
                    <th className="text-center p-0.5 text-gray-400 font-medium w-10 sm:w-12">צעדים</th>
                    <th className="w-6 sm:w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {getEntriesWithAverages().map((entry, displayIndex) => {
                    const isAverage = 'isAverage' in entry && entry.isAverage
                    const isToday = 'isToday' in entry && entry.isToday
                    const today = format(new Date(), 'yyyy-MM-dd')
                    const isPast = !isAverage && entry.date < today
                    const actualIndex = isAverage ? -1 : entries.findIndex(e => e.date === entry.date)
                    
                    return (
                      <tr 
                        key={`${entry.date}-${displayIndex}`} 
                        className={`border-b border-dark-border/30 ${
                          isAverage 
                            ? 'bg-cyan-500/10 hover:bg-cyan-500/20 font-bold' 
                            : isToday
                            ? 'bg-green-500/10 hover:bg-green-500/20'
                            : isPast
                            ? 'bg-orange-500/10 hover:bg-orange-500/20'
                            : 'hover:bg-dark-hover/30'
                        }`}
                      >
                        <td className={`p-0.5 sticky right-0 shadow-[2px_0_5px_rgba(0,0,0,0.3)] ${
                          isAverage ? 'bg-cyan-500/10' : 
                          isToday ? 'bg-green-500/10' : 
                          isPast ? 'bg-orange-500/10' :
                          'bg-dark-card'
                        }`}>
                          {isAverage && 'weekKey' in entry && typeof entry.weekKey === 'string' ? (
                            <div className="flex items-center justify-between">
                              <div className="text-cyan-300 text-[7px] sm:text-[9px] px-0.5 py-0.5 font-semibold">
                                {entry.notes}
                              </div>
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
                            </div>
                          ) : actualIndex >= 0 ? (
                            <div className="text-white text-[7px] sm:text-[9px] px-0.5 py-0.5 font-medium whitespace-nowrap">
                              {format(new Date(entry.date), "EEE d.M", { locale: he })}
                            </div>
                          ) : (
                            <div className="text-gray-600 text-[7px]">-</div>
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
                                type="text"
                                value={entry[field]}
                                onChange={(e) => updateEntry(actualIndex, field, e.target.value)}
                                className="w-9 sm:w-11 bg-dark-hover border border-dark-border rounded px-0.5 py-0.5 text-white text-center text-[7px] sm:text-[9px] font-bold focus:outline-none focus:ring-1 focus:ring-green-500"
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
        </>
      ) : (
        /* Graph View */
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
  )
}

export default NutritionTracking


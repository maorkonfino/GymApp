import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Apple, Plus, Trash2, LineChart, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import WeightGraph from './WeightGraph'
import BeastLogo from './BeastLogo'

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
  const [editingGoals, setEditingGoals] = useState(false)
  const [hasNutritionPlan, setHasNutritionPlan] = useState<boolean | null>(null) // null = loading, true = has plan, false = no plan

  // Check if user has a nutrition plan
  useEffect(() => {
    const checkNutritionPlan = async () => {
      if (!user) {
        setHasNutritionPlan(false)
        return
      }

      if (isAdmin) {
        setHasNutritionPlan(true) // Admin always has access
        return
      }

      try {
        const response = await fetch(`${API_URL}/nutrition-goals/${user.email}`)
        const data = await response.json()
        
        // Check if there's actual nutrition goals (at least one value > 0)
        if (data && (
          data.regular_day_protein > 0 || 
          data.regular_day_fat > 0 || 
          data.regular_day_carbs > 0 ||
          data.loading_day_protein > 0 ||
          data.loading_day_fat > 0 ||
          data.loading_day_carbs > 0
        )) {
          setHasNutritionPlan(true)
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

  // חישוב קלוריות אוטומטי
  const calculateCalories = (protein: number, fat: number, carbs: number) => {
    return (protein * 4) + (fat * 9) + (carbs * 4)
  }

  const [goals, setGoals] = useState<NutritionGoals>({
    regularDay: { protein: 0, fat: 0, carbs: 0, calories: 0 },
    loadingDay: { protein: 0, fat: 0, carbs: 0, calories: 0 }
  })

  // Load nutrition goals from server
  useEffect(() => {
    const loadGoals = async () => {
      if (!user) return

      try {
        const response = await fetch(`${API_URL}/nutrition-goals/${user.email}`)
        const data = await response.json()
        
        if (data) {
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
      }
    }

    loadGoals()
  }, [user])

  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<string>>(new Set()) // Track collapsed weeks

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
        
        const today = format(new Date(), 'yyyy-MM-dd')
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
          
          // Check if today's entry exists, if not add it
          const hasToday = formattedEntries.some((entry: DailyEntry) => entry.date === today)
          
          if (!hasToday) {
            formattedEntries.push({
              date: today,
              morningWeight: '',
              calories: '',
              protein: '',
              fat: '',
              carbs: '',
              steps: '',
              notes: ''
            })
          }
        } else {
          // First time - create entry for today
          formattedEntries = [{
            date: today,
            morningWeight: '',
            calories: '',
            protein: '',
            fat: '',
            carbs: '',
            steps: '',
            notes: ''
          }]
        }
        
        // Sort by date
        formattedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setEntries(formattedEntries)
        
      } catch (error) {
        console.error('Error loading daily tracking:', error)
        // First time - create entry for today
        const today = format(new Date(), 'yyyy-MM-dd')
        setEntries([{
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
    }

    loadEntries()
  }, [user])

  const addRow = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const exists = entries.some(e => e.date === today)
    
    if (exists) {
      alert('כבר קיימת שורה לתאריך הנוכחי')
      return
    }
    
    const newEntries = [...entries, {
      date: today,
      morningWeight: '',
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
      steps: '',
      notes: ''
    }]
    
    newEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEntries(newEntries)
  }

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

  const updateGoals = (day: 'regularDay' | 'loadingDay', field: 'protein' | 'fat' | 'carbs', value: number) => {
    const newGoals = { ...goals }
    newGoals[day][field] = value
    newGoals[day].calories = calculateCalories(
      newGoals[day].protein,
      newGoals[day].fat,
      newGoals[day].carbs
    )
    setGoals(newGoals)
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
      // Group entries by week
      const weeks: { [key: string]: DailyEntry[] } = {}
      entries.forEach(entry => {
        if (!entry || !entry.date) return
        const weekKey = getWeekKey(entry.date)
        if (!weeks[weekKey]) {
          weeks[weekKey] = []
        }
        weeks[weekKey].push(entry)
      })

      // Create result array with entries and weekly averages
      const result: (DailyEntry & { isAverage?: boolean; weekKey?: string })[] = []
      
      Object.keys(weeks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).forEach(weekKey => {
        const weekEntries = weeks[weekKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        // Calculate weekly average
        const validWeights = weekEntries
          .filter(e => e && e.morningWeight && parseFloat(e.morningWeight) > 0)
          .map(e => parseFloat(e.morningWeight))
        
        const avgWeight = validWeights.length > 0
          ? (validWeights.reduce((a, b) => a + b, 0) / validWeights.length).toFixed(1)
          : ''

        const isCollapsed = collapsedWeeks.has(weekKey)

        // Add average row at the top of the week
        result.push({
          date: weekKey,
          morningWeight: avgWeight,
          calories: '',
          protein: '',
          fat: '',
          carbs: '',
          steps: '',
          notes: `ממוצע שבועי ${format(new Date(weekKey), 'dd/MM')} - ${format(new Date(new Date(weekKey).getTime() + 6 * 24 * 60 * 60 * 1000), 'dd/MM')}`,
          isAverage: true,
          weekKey: weekKey
        })

        // Add week entries only if not collapsed
        if (!isCollapsed) {
          result.push(...weekEntries)
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
          <BeastLogo size="large" />
          
          <div className="space-y-2">
            <p className="text-cyan-400 text-lg">בית לאימון מבוסס מדע</p>
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
              <h2 className="text-2xl font-bold text-white">מעקב התקדמות ותזונה</h2>
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

      {activeTab === 'tracking' ? (
        <>
          {/* Goals Table - All Users */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400">יעדי תזונה</h3>
              {isAdmin && (
                <button
                  onClick={() => setEditingGoals(!editingGoals)}
                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-all"
                >
                  {editingGoals ? 'שמור יעדים' : 'ערוך יעדים'}
                </button>
              )}
            </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-right p-3 text-gray-400 font-medium">מדד</th>
                      <th className="text-center p-3 text-gray-400 font-medium">יום רגיל</th>
                      <th className="text-center p-3 text-gray-400 font-medium">יום העמסה</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-dark-border/30">
                      <td className="p-3 text-white font-medium">קלוריות</td>
                      <td className="p-3 text-center">
                        <div className="text-green-400 font-bold text-lg">
                          {goals.regularDay.calories}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">מחושב אוטומטית</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="text-green-400 font-bold text-lg">
                          {goals.loadingDay.calories}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">מחושב אוטומטית</div>
                      </td>
                    </tr>
                    {(['protein', 'fat', 'carbs'] as const).map((nutrient) => (
                      <tr key={nutrient} className="border-b border-dark-border/30">
                        <td className="p-3 text-white">
                          {nutrient === 'protein' ? 'חלבון (גרם)' : 
                           nutrient === 'fat' ? 'שומן (גרם)' : 
                           'פחממה (גרם)'}
                        </td>
                        <td className="p-3 text-center">
                          {isAdmin && editingGoals ? (
                            <input
                              type="number"
                              value={goals.regularDay[nutrient]}
                              onChange={(e) => updateGoals('regularDay', nutrient, parseFloat(e.target.value) || 0)}
                              className="w-24 bg-dark-hover border border-dark-border rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="text-white font-semibold">{goals.regularDay[nutrient]}</div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isAdmin && editingGoals ? (
                            <input
                              type="number"
                              value={goals.loadingDay[nutrient]}
                              onChange={(e) => updateGoals('loadingDay', nutrient, parseFloat(e.target.value) || 0)}
                              className="w-24 bg-dark-hover border border-dark-border rounded px-3 py-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="text-white font-semibold">{goals.loadingDay[nutrient]}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          {/* Daily Tracking Table */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400">יומן מעקב</h3>
              <div className="flex gap-2 items-center">
                <button
                  onClick={addRow}
                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  הוסף שורה
                </button>
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

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-right p-2 text-gray-400 font-medium sticky right-0 bg-dark-card">תאריך</th>
                    <th className="text-center p-2 text-gray-400 font-medium">משקל בוקר</th>
                    <th className="text-center p-2 text-gray-400 font-medium">סה"כ קלוריות</th>
                    <th className="text-center p-2 text-gray-400 font-medium">חלבון</th>
                    <th className="text-center p-2 text-gray-400 font-medium">שומן</th>
                    <th className="text-center p-2 text-gray-400 font-medium">פחממה</th>
                    <th className="text-center p-2 text-gray-400 font-medium">צעדים</th>
                    <th className="text-right p-2 text-gray-400 font-medium min-w-[200px]">הערות ובקשות</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {getEntriesWithAverages().map((entry, displayIndex) => {
                    const isAverage = 'isAverage' in entry && entry.isAverage
                    const actualIndex = isAverage ? -1 : entries.findIndex(e => e.date === entry.date)
                    
                    return (
                      <tr 
                        key={`${entry.date}-${displayIndex}`} 
                        className={`border-b border-dark-border/30 ${
                          isAverage 
                            ? 'bg-cyan-500/10 hover:bg-cyan-500/20 font-bold' 
                            : 'hover:bg-dark-hover/30'
                        }`}
                      >
                        <td className={`p-2 sticky right-0 ${isAverage ? 'bg-cyan-500/10' : 'bg-dark-card'}`}>
                          {isAverage ? (
                            <div className="text-cyan-300 text-xs px-2 py-1 font-semibold">
                              {entry.notes}
                            </div>
                            ) : actualIndex >= 0 ? (
                              <input
                                type="date"
                                value={entry.date}
                                onChange={(e) => updateEntry(actualIndex, 'date', e.target.value)}
                                className="w-32 bg-dark-hover border border-dark-border rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                              />
                            ) : (
                            <div className="text-gray-600 text-xs px-2 py-1">-</div>
                          )}
                        </td>
                        {(['morningWeight', 'calories', 'protein', 'fat', 'carbs', 'steps'] as const).map((field) => (
                          <td key={field} className="p-2 text-center">
                            {isAverage && field === 'morningWeight' ? (
                              <div className="text-cyan-300 font-bold text-sm">
                                {entry[field]}
                              </div>
                            ) : isAverage ? (
                              <div className="text-gray-600">-</div>
                            ) : actualIndex >= 0 ? (
                              <input
                                type="number"
                                step="0.1"
                                value={entry[field]}
                                onChange={(e) => updateEntry(actualIndex, field, e.target.value)}
                                className="w-20 bg-dark-hover border border-dark-border rounded px-2 py-1 text-white text-center text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                              />
                            ) : (
                              <div className="text-gray-600">-</div>
                            )}
                          </td>
                        ))}
                        <td className="p-2">
                          {isAverage ? (
                            <div className="text-gray-600 text-xs">-</div>
                          ) : actualIndex >= 0 ? (
                            <input
                              type="text"
                              value={entry.notes}
                              onChange={(e) => updateEntry(actualIndex, 'notes', e.target.value)}
                              className="w-full bg-dark-hover border border-dark-border rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="הערות..."
                            />
                          ) : (
                            <div className="text-gray-600 text-xs">-</div>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {isAverage && 'weekKey' in entry && typeof entry.weekKey === 'string' ? (
                            <button
                              onClick={() => toggleWeekCollapse(entry.weekKey as string)}
                              className="p-1.5 hover:bg-cyan-500/20 rounded-lg transition-colors text-cyan-400"
                              title={collapsedWeeks.has(entry.weekKey as string) ? "פתח שבוע" : "סגור שבוע"}
                            >
                              {collapsedWeeks.has(entry.weekKey as string) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          ) : !isAverage && actualIndex >= 0 && (
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


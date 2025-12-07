import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { User } from '../types'
import api from '../api'

interface AdminNutritionEditorProps {
  user: User
  onClose: () => void
}

interface NutritionGoals {
  normalDay: {
    calories: string
    protein: string
    fat: string
    carbs: string
  }
  loadingDay: {
    calories: string
    protein: string
    fat: string
    carbs: string
  }
}

const AdminNutritionEditor: React.FC<AdminNutritionEditorProps> = ({ user, onClose }) => {
  const [goals, setGoals] = useState<NutritionGoals>({
    normalDay: { calories: '', protein: '', fat: '', carbs: '' },
    loadingDay: { calories: '', protein: '', fat: '', carbs: '' }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchNutritionGoals()
  }, [user.id])

  const fetchNutritionGoals = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/nutrition-goals/user/${user.id}`)
      if (response.data && response.data.length > 0) {
        const data = response.data[0]
        setGoals({
          normalDay: {
            calories: data.normal_calories?.toString() || '',
            protein: data.regular_day_protein?.toString() || '',
            fat: data.regular_day_fat?.toString() || '',
            carbs: data.regular_day_carbs?.toString() || ''
          },
          loadingDay: {
            calories: data.loading_calories?.toString() || '',
            protein: data.loading_day_protein?.toString() || '',
            fat: data.loading_day_fat?.toString() || '',
            carbs: data.loading_day_carbs?.toString() || ''
          }
        })
      }
    } catch (error) {
      console.error('Error fetching nutrition goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveData = async () => {
    setSaving(true)
    try {
      await api.post('/nutrition-goals', {
        userId: user.id,
        normalProtein: parseFloat(goals.normalDay.protein) || 0,
        normalFat: parseFloat(goals.normalDay.fat) || 0,
        normalCarbs: parseFloat(goals.normalDay.carbs) || 0,
        loadingProtein: parseFloat(goals.loadingDay.protein) || 0,
        loadingFat: parseFloat(goals.loadingDay.fat) || 0,
        loadingCarbs: parseFloat(goals.loadingDay.carbs) || 0,
        updated_by: user.email
      })
      console.log('✅ יעדי תזונה נשמרו אוטומטית')
    } catch (error) {
      console.error('Error saving nutrition goals:', error)
    } finally {
      setTimeout(() => setSaving(false), 1000)
    }
  }

  const handleSave = async () => {
    await saveData()
    alert('יעדי התזונה נשמרו בהצלחה!')
    onClose()
  }

  // Auto-save when goals change (with debounce)
  useEffect(() => {
    if (!user) return
    if (!goals.normalDay.protein && !goals.normalDay.fat && !goals.normalDay.carbs &&
        !goals.loadingDay.protein && !goals.loadingDay.fat && !goals.loadingDay.carbs) {
      return // Don't save empty goals
    }

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
  }, [goals])

  const updateGoal = (dayType: 'normalDay' | 'loadingDay', field: keyof NutritionGoals['normalDay'], value: string) => {
    setGoals({
      ...goals,
      [dayType]: {
        ...goals[dayType],
        [field]: value
      }
    })
  }

  const calculateCalories = (dayType: 'normalDay' | 'loadingDay') => {
    const protein = parseFloat(goals[dayType].protein) || 0
    const fat = parseFloat(goals[dayType].fat) || 0
    const carbs = parseFloat(goals[dayType].carbs) || 0
    return (protein * 4 + fat * 9 + carbs * 4).toFixed(0)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">עריכת יעדי תזונה</h2>
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
              <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">טוען יעדים...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Normal Day */}
              <div className="bg-dark-hover border border-dark-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4">יום רגיל</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">חלבון (גרם)</label>
                    <input
                      type="number"
                      value={goals.normalDay.protein}
                      onChange={(e) => updateGoal('normalDay', 'protein', e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">שומן (גרם)</label>
                    <input
                      type="number"
                      value={goals.normalDay.fat}
                      onChange={(e) => updateGoal('normalDay', 'fat', e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">פחמימות (גרם)</label>
                    <input
                      type="number"
                      value={goals.normalDay.carbs}
                      onChange={(e) => updateGoal('normalDay', 'carbs', e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">קלוריות (אוטומטי)</label>
                    <div className="w-full bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-300 text-center text-lg font-bold">
                      {calculateCalories('normalDay')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading Day */}
              <div className="bg-dark-hover border border-dark-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">יום טעינה</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">חלבון (גרם)</label>
                    <input
                      type="number"
                      value={goals.loadingDay.protein}
                      onChange={(e) => updateGoal('loadingDay', 'protein', e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">שומן (גרם)</label>
                    <input
                      type="number"
                      value={goals.loadingDay.fat}
                      onChange={(e) => updateGoal('loadingDay', 'fat', e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">פחמימות (גרם)</label>
                    <input
                      type="number"
                      value={goals.loadingDay.carbs}
                      onChange={(e) => updateGoal('loadingDay', 'carbs', e.target.value)}
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">קלוריות (אוטומטי)</label>
                    <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 text-blue-300 text-center text-lg font-bold">
                      {calculateCalories('loadingDay')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-cyan-300 text-sm">
                  💡 <strong>חישוב קלוריות:</strong> חלבון ופחמימות = 4 קלוריות לגרם, שומן = 9 קלוריות לגרם
                </p>
              </div>
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

export default AdminNutritionEditor


import React, { useState, useEffect } from 'react'
import { X, Users, Edit2, Dumbbell, Apple, Search, Settings, Bell } from 'lucide-react'
import { User } from '../types'
import api from '../api'
import AdminWorkoutEditor from './AdminWorkoutEditor'
import AdminNutritionEditor from './AdminNutritionEditor'

interface ManageUsersProps {
  isOpen: boolean
  onClose: () => void
}

interface ReminderSettings {
  enabled: number
  message_24h: string
  message_4h: string
}

const ManageUsers: React.FC<ManageUsersProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editMode, setEditMode] = useState<'role' | 'workout' | 'nutrition' | 'name' | 'settings' | null>(null)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'vip' | 'kibbutz' | 'teenbeast' | 'onlinebeast'>('kibbutz')
  const [editedName, setEditedName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: 1,
    message_24h: 'תזכורת: יש לך אימון מחר ב-{time}',
    message_4h: 'תזכורת: יש לך אימון בעוד 4 שעות'
  })

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchReminderSettings()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReminderSettings = async () => {
    try {
      const response = await api.get('/reminder-settings')
      setReminderSettings(response.data)
    } catch (error) {
      console.error('Error fetching reminder settings:', error)
    }
  }

  const handleSaveReminderSettings = async () => {
    try {
      await api.put('/reminder-settings', reminderSettings)
      alert('הגדרות התזכורות עודכנו בהצלחה!')
      setEditMode(null)
    } catch (error) {
      console.error('Error saving reminder settings:', error)
      alert('שגיאה בשמירת הגדרות התזכורות')
    }
  }

  const handleEditRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole })
      alert('תפקיד המשתמש עודכן בהצלחה!')
      await fetchUsers() // Refresh the list
      setEditMode(null)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating role:', error)
      alert('שגיאה בעדכון תפקיד המשתמש')
    }
  }

  const handleEditName = async (userId: number, newName: string) => {
    if (!newName.trim()) {
      alert('שם המשתמש לא יכול להיות ריק')
      return
    }
    try {
      await api.put(`/users/${userId}`, { name: newName })
      alert('שם המשתמש עודכן בהצלחה!')
      await fetchUsers() // Refresh the list
      setEditMode(null)
      setSelectedUser(null)
      setEditedName('')
    } catch (error) {
      console.error('Error updating name:', error)
      alert('שגיאה בעדכון שם המשתמש')
    }
  }

  const handleEditWorkout = (user: User) => {
    setSelectedUser(user)
    setEditMode('workout')
  }

  const handleEditNutrition = (user: User) => {
    setSelectedUser(user)
    setEditMode('nutrition')
  }

  const closeEditModal = () => {
    setEditMode(null)
    setSelectedUser(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">רשימת מנויים</h2>
              <p className="text-gray-400 text-sm">ניהול משתמשים ותוכניות</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode('settings')}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2"
              title="הגדרות כלליות"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">הגדרות</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש לפי שם..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-dark-hover border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
              }`}
            >
              כולם
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === 'admin'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
              }`}
            >
              מנהל
            </button>
            <button
              onClick={() => setRoleFilter('vip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === 'vip'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
              }`}
            >
              BEAST
            </button>
            <button
              onClick={() => setRoleFilter('teenbeast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === 'teenbeast'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
              }`}
            >
              TeenBEAST
            </button>
            <button
              onClick={() => setRoleFilter('onlinebeast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === 'onlinebeast'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
              }`}
            >
              OnlineBEAST
            </button>
            <button
              onClick={() => setRoleFilter('kibbutz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === 'kibbutz'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-dark-hover text-gray-400 hover:bg-dark-border'
              }`}
            >
              קיבוץ
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">טוען משתמשים...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-dark-hover sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-right border border-dark-border text-gray-300 font-semibold min-w-[200px]">שם</th>
                    <th className="p-3 text-center border border-dark-border text-gray-300 font-semibold min-w-[150px]">תפקיד</th>
                    <th className="p-3 text-center border border-dark-border text-gray-300 font-semibold min-w-[120px]">תכנית אימון</th>
                    <th className="p-3 text-center border border-dark-border text-gray-300 font-semibold min-w-[120px]">תכנית תזונה</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user => {
                      // Filter by search query
                      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
                      // Filter by role
                      const matchesRole = roleFilter === 'all' || user.role === roleFilter
                      return matchesSearch && matchesRole
                    })
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-dark-hover/50 transition-colors">
                        {/* Name and Info with Edit Icon */}
                        <td className="p-3 border border-dark-border">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="text-white font-semibold">{user.name}</div>
                              <div className="text-xs text-gray-400 mt-1">📧 {user.email}</div>
                              <div className="text-xs text-gray-400">📱 {user.phone}</div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setEditedName(user.name)
                                setEditMode('name')
                              }}
                              className="p-1.5 hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 rounded transition-colors flex-shrink-0"
                              title="ערוך שם"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Role Badge with Edit Icon */}
                        <td className="p-3 border border-dark-border text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`inline-block text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${
                              user.role === 'admin' 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : user.role === 'vip'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : user.role === 'teenbeast'
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                : user.role === 'onlinebeast'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            }`}>
                              {user.role === 'admin' ? 'מנהל' 
                                : user.role === 'vip' ? 'BEAST' 
                                : user.role === 'teenbeast' ? 'TeenBEAST' 
                                : user.role === 'onlinebeast' ? 'OnlineBEAST'
                                : 'קיבוץ'}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setSelectedRole(user.role)
                                setEditMode('role')
                              }}
                              className="p-1.5 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded transition-colors"
                              title="ערוך תפקיד"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* Edit Workout Button */}
                        <td className="p-3 border border-dark-border text-center">
                          <button
                            onClick={() => handleEditWorkout(user)}
                            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5"
                            title="ערוך תכנית אימון"
                          >
                            <Dumbbell className="w-3 h-3" />
                            <span>ערוך</span>
                          </button>
                        </td>

                        {/* Edit Nutrition Button */}
                        <td className="p-3 border border-dark-border text-center">
                          <button
                            onClick={() => handleEditNutrition(user)}
                            className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5"
                            title="ערוך תכנית תזונה"
                          >
                            <Apple className="w-3 h-3" />
                            <span>ערוך</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {users.filter(user => {
                const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesRole = roleFilter === 'all' || user.role === roleFilter
                return matchesSearch && matchesRole
              }).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>לא נמצאו משתמשים</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Name Modal */}
        {editMode === 'name' && selectedUser && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">ערוך שם משתמש</h3>
              <p className="text-gray-400 mb-4 text-sm">📧 {selectedUser.email}</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">שם מלא</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="הכנס שם מלא"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditMode(null)
                    setSelectedUser(null)
                    setEditedName('')
                  }}
                  className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleEditName(Number(selectedUser.id!), editedName)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg transition-all font-semibold"
                >
                  שמור שינויים
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {editMode === 'role' && selectedUser && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">ערוך תפקיד משתמש</h3>
              <p className="text-gray-400 mb-4">{selectedUser.name}</p>
              
              <div className="space-y-3 mb-6">
                {[
                  { value: 'kibbutz', label: 'קיבוץ', desc: 'גישה לכל הכפתורים (לפי תוכנית)', gradient: 'from-green-500 to-emerald-600' },
                  { value: 'vip', label: 'BEAST', desc: 'גישה לכל הכפתורים (לפי תוכנית)', gradient: 'from-cyan-500 to-blue-600' },
                  { value: 'teenbeast', label: 'TeenBEAST', desc: 'גישה מוגבלת לשעות נוער בלבד', gradient: 'from-orange-500 to-red-600' },
                  { value: 'onlinebeast', label: 'OnlineBEAST', desc: 'גישה מקוונת בלבד (ללא הרשמה לתורים)', gradient: 'from-indigo-500 to-purple-600' },
                  { value: 'admin', label: 'מנהל', desc: 'גישת ניהול מלאה', gradient: 'from-cyan-500 to-blue-600' }
                ].map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value as any)}
                    className={`w-full p-4 rounded-lg text-right transition-all ${
                      selectedRole === role.value
                        ? `bg-gradient-to-r ${role.gradient} text-white border-2 border-white/50 shadow-lg`
                        : 'bg-dark-hover text-gray-300 border-2 border-dark-border hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="font-semibold">{role.label}</div>
                    <div className="text-xs opacity-70 mt-1">{role.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditMode(null)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleEditRole(Number(selectedUser.id!), selectedRole)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all"
                >
                  שמור שינויים
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workout Editor */}
      {editMode === 'workout' && selectedUser && (
        <AdminWorkoutEditor
          user={selectedUser}
          onClose={closeEditModal}
        />
      )}

      {/* Nutrition Editor */}
      {editMode === 'nutrition' && selectedUser && (
        <AdminNutritionEditor
          user={selectedUser}
          onClose={closeEditModal}
        />
      )}

      {/* General Settings Modal */}
      {editMode === 'settings' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border rounded-2xl max-w-2xl w-full p-6 animate-fade-in max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">הגדרות כלליות</h3>
              </div>
              <button
                onClick={() => setEditMode(null)}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Reminder Settings */}
            <div className="space-y-6">
              <div className="p-4 bg-dark-hover border border-dark-border rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  הגדרות תזכורות
                </h4>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between mb-4 p-3 bg-dark-card rounded-lg">
                  <span className="text-gray-300">הפעל תזכורות</span>
                  <button
                    onClick={() => setReminderSettings({ ...reminderSettings, enabled: reminderSettings.enabled ? 0 : 1 })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      reminderSettings.enabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                        reminderSettings.enabled ? 'right-0.5' : 'right-7'
                      }`}
                    />
                  </button>
                </div>

                {/* 24h Message */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    תזכורת 24 שעות לפני אימון
                  </label>
                  <textarea
                    value={reminderSettings.message_24h}
                    onChange={(e) => setReminderSettings({ ...reminderSettings, message_24h: e.target.value })}
                    className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                    placeholder='תזכורת: יש לך אימון מחר ב-{time}'
                  />
                  <p className="text-xs text-gray-500 mt-1">השתמש ב-{'{time}'} להצגת שעת האימון</p>
                </div>

                {/* 4h Message */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    תזכורת 4 שעות לפני אימון
                  </label>
                  <textarea
                    value={reminderSettings.message_4h}
                    onChange={(e) => setReminderSettings({ ...reminderSettings, message_4h: e.target.value })}
                    className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                    placeholder="תזכורת: יש לך אימון בעוד 4 שעות"
                  />
                  <p className="text-xs text-gray-500 mt-1">השתמש ב-{'{time}'} להצגת שעת האימון</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(null)}
                  className="flex-1 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveReminderSettings}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all font-semibold"
                >
                  שמור הגדרות
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers


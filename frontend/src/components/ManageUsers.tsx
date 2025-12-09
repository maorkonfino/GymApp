import React, { useState, useEffect } from 'react'
import { X, Users, Edit2, Dumbbell, Apple, Search } from 'lucide-react'
import { User } from '../types'
import api from '../api'
import AdminWorkoutEditor from './AdminWorkoutEditor'
import AdminNutritionEditor from './AdminNutritionEditor'

interface ManageUsersProps {
  isOpen: boolean
  onClose: () => void
}

const ManageUsers: React.FC<ManageUsersProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editMode, setEditMode] = useState<'role' | 'workout' | 'nutrition' | null>(null)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'vip' | 'kibbutz' | 'teenbeast' | 'onlinebeast'>('kibbutz')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
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
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">רשימת מנויים</h2>
              <p className="text-gray-400 text-sm">ניהול משתמשים ותוכניות</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
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
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
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
            <div className="space-y-3">
              {users
                .filter(user => {
                  // Filter by search query
                  const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
                  // Filter by role
                  const matchesRole = roleFilter === 'all' || user.role === roleFilter
                  return matchesSearch && matchesRole
                })
                .map((user) => (
                <div
                  key={user.id}
                  className="bg-dark-hover border border-dark-border rounded-xl p-4 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
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
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>📧 {user.email}</p>
                        <p>📱 {user.phone}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* Edit Role */}
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setSelectedRole(user.role)
                          setEditMode('role')
                        }}
                        className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        title="ערוך תפקיד"
                      >
                        <Edit2 className="w-3 h-3" />
                        תפקיד
                      </button>

                      {/* Edit Workout Plan */}
                      <button
                        onClick={() => handleEditWorkout(user)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        title="ערוך תכנית אימון"
                      >
                        <Dumbbell className="w-3 h-3" />
                        אימון
                      </button>

                      {/* Edit Nutrition Plan */}
                      <button
                        onClick={() => handleEditNutrition(user)}
                        className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        title="ערוך תכנית תזונה"
                      >
                        <Apple className="w-3 h-3" />
                        תזונה
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>אין משתמשים במערכת</p>
                </div>
              )}
            </div>
          )}
        </div>

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
                  { value: 'admin', label: 'מנהל', desc: 'גישת ניהול מלאה', gradient: 'from-purple-500 to-pink-600' }
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
    </div>
  )
}

export default ManageUsers


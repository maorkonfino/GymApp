import React, { useState } from 'react'
import { X, User as UserIcon, Mail, Phone, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await updateProfile(name, email, phone)
      setSuccess(true)
      
      // Show success message and close
      setTimeout(() => {
        setSuccess(false)
        onClose()
        // Page will auto-refresh with new name
      }, 1000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('נכשל עדכון הפרופיל')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">הפרופיל שלי</h2>
          <p className="text-gray-400 text-sm">ערוך את הפרטים האישיים שלך</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm text-center">
              ✅ הפרטים עודכנו בהצלחה!
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              שם מלא
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="הזן שם מלא"
              dir="auto"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              אימייל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your@email.com"
              dir="ltr"
              style={{ textAlign: 'left' }}
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              טלפון
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="050-1234567"
              dir="ltr"
              style={{ textAlign: 'left' }}
              required
            />
          </div>

          {/* Info */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm">
            <p className="text-purple-300 text-xs">
              💡 הפרטים שתעדכן כאן ימולאו אוטומטית בכל הטפסים
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
          >
            {loading ? (
              <span>שומר...</span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>שמור שינויים</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal


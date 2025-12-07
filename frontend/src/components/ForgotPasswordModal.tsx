import React, { useState } from 'react'
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'שגיאה בשליחת המייל')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail className="w-6 h-6 text-cyan-400" />
            שכחתי סיסמה
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">המייל נשלח בהצלחה!</h3>
            <p className="text-gray-400">
              בדוק את תיבת המייל שלך לקישור לאיפוס הסיסמה
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-gray-400 mb-4">
                הכנס את כתובת המייל שלך ונשלח אליך קישור לאיפוס הסיסמה
              </p>

              <label className="block text-sm font-medium text-gray-300 mb-2">
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-hover border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-dark-hover text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'שולח...' : 'שלח קישור'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal


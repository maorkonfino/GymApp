import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import api from '../api'
import BeastLogo from './BeastLogo'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('טוקן לא תקף')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }

    if (newPassword.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'שגיאה באיפוס הסיסמה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-8 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <BeastLogo size="large" />
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">הסיסמה שונתה בהצלחה!</h2>
            <p className="text-gray-400">מעביר אותך לדף ההתחברות...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Lock className="w-8 h-8 text-cyan-400" />
                איפוס סיסמה
              </h1>
              <p className="text-gray-400">הכנס סיסמה חדשה לחשבון שלך</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  סיסמה חדשה
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-hover border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12"
                    placeholder="הכנס סיסמה חדשה"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  אימות סיסמה
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-hover border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12"
                    placeholder="הכנס סיסמה שוב"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? 'מאפס סיסמה...' : 'אפס סיסמה'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-dark-hover text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                חזרה לדף הראשי
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage


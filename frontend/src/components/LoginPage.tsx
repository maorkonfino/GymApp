import React, { useState } from 'react'
import { Mail, Lock, User, UserPlus, LogIn, Phone } from 'lucide-react'

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  onRegister: (name: string, lastName: string, phone: string, email: string, password: string) => Promise<void>
  onForgotPassword?: (email: string) => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onForgotPassword }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome')
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (!formData.name || !formData.lastName || !formData.phone || !formData.email || !formData.password) {
          setError('כל השדות נדרשים')
          setLoading(false)
          return
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('הססמאות אינן תואמות')
          setLoading(false)
          return
        }
        
        if (formData.password.length < 6) {
          setError('הסיסמה חייבת להיות לפחות 6 תווים')
          setLoading(false)
          return
        }
        
        console.log('📝 Registering user:', { name: formData.name, lastName: formData.lastName, phone: formData.phone, email: formData.email })
        await onRegister(formData.name, formData.lastName, formData.phone, formData.email, formData.password)
        console.log('✅ Registration successful!')
      } else {
        if (!formData.email || !formData.password) {
          setError('אימייל וסיסמה נדרשים')
          setLoading(false)
          return
        }
        console.log('🔑 Logging in user:', formData.email, 'Remember Me:', rememberMe)
        await onLogin(formData.email, formData.password, rememberMe)
        console.log('✅ Login successful!')
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message || 'שגיאה בהתחברות/הרשמה')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' })
    setError('')
  }

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo & Brand */}
          <div className="text-center mb-12 animate-fade-in flex justify-center">
            <img 
              src="/header-logo.svg" 
              alt="BEAST Logo" 
              className="h-48 sm:h-56 w-auto"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => {
                setMode('register')
                resetForm()
              }}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <UserPlus className="w-6 h-6" />
              הרשמה
            </button>

            <button
              onClick={() => {
                setMode('login')
                resetForm()
              }}
              className="w-full py-4 bg-dark-hover hover:bg-dark-border text-white rounded-xl font-bold text-lg transition-all border border-cyan-500/30 hover:border-cyan-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <LogIn className="w-6 h-6" />
              התחבר
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p>© 2024 BEAST Gym. All rights reserved.</p>
          </div>
        </div>
      </div>
    )
  }

  // Login/Register Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => {
            setMode('welcome')
            resetForm()
          }}
          className="mb-6 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
        >
          ← חזרה
        </button>

        {/* Form Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/header-logo.svg" 
                alt="BEAST Logo" 
                className="h-24 sm:h-28 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {mode === 'register' ? 'הרשמה למערכת' : 'התחברות'}
            </h2>
            <p className="text-gray-400">
              {mode === 'register' ? 'צור חשבון חדש' : 'התחבר לחשבון שלך'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Hidden fields to confuse password managers */}
            <input type="text" name="fakeUsername" style={{ display: 'none' }} tabIndex={-1} />
            <input type="password" name="fakePassword" style={{ display: 'none' }} tabIndex={-1} />
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    שם פרטי
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="first-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="הכנס שם פרטי"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    שם משפחה
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="last-name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="הכנס שם משפחה"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    מספר נייד
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="הכנס מספר נייד"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right"
                  placeholder="example@email.com"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                  required
                  minLength={6}
                />
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-400 mt-1">לפחות 6 תווים</p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  אימות סיסמה
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="••••••••"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">הזן את הסיסמה שוב לאימות</p>
              </div>
            )}

            {/* Remember Me & Forgot Password - Only on login */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 bg-dark-hover border-dark-border rounded focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-300">זכור אותי</span>
                </label>
                <button
                  type="button"
                  onClick={() => onForgotPassword && onForgotPassword(formData.email)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  שכחתי סיסמה
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/30 mt-6"
            >
              {loading ? 'מעבד...' : mode === 'register' ? 'הרשם' : 'התחבר'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {mode === 'register' ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}
              {' '}
              <button
                onClick={() => {
                  setMode(mode === 'register' ? 'login' : 'register')
                  resetForm()
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                {mode === 'register' ? 'התחבר' : 'הרשם'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


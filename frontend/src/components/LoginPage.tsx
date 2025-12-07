import React, { useState } from 'react'
import { Mail, Lock, User, UserPlus, LogIn, Phone } from 'lucide-react'

// Wolf SVG Icon Component - Side profile
const WolfIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 100" 
    className={className}
    fill="currentColor"
  >
    {/* Wolf head - side profile */}
    {/* Back of head and neck */}
    <path d="M 20 40 Q 25 20 35 15 Q 40 12 45 12 Q 50 13 52 18 L 50 25 Q 48 35 45 42 L 40 50 L 35 58 L 30 62 L 25 60 L 22 55 Z" />
    
    {/* Pointed ear */}
    <path d="M 35 15 L 38 5 L 42 8 L 40 18 Z" />
    
    {/* Snout/muzzle */}
    <path d="M 45 42 L 55 40 L 65 38 L 72 36 L 75 38 L 75 42 L 72 45 L 65 46 L 55 47 L 48 48 Z" />
    
    {/* Lower jaw */}
    <path d="M 48 48 L 60 50 L 68 51 L 70 52 L 68 55 L 60 56 L 50 56 L 42 54 Z" />
    
    {/* Nose/tip */}
    <circle cx="75" cy="40" r="3" fill="rgba(0,0,0,0.5)" />
    
    {/* Eye - fierce */}
    <ellipse cx="52" cy="30" rx="4" ry="3" fill="white" />
    <circle cx="53" cy="30" r="2" fill="rgba(0,0,0,0.8)" />
    
    {/* Fur detail lines */}
    <path d="M 30 35 L 28 38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
    <path d="M 32 32 L 30 35" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
    <path d="M 28 45 L 26 48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
    
    {/* Teeth hint */}
    <path d="M 60 52 L 60 54 M 64 52 L 64 54 M 68 52 L 68 53.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
  </svg>
)

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  onRegister: (name: string, lastName: string, phone: string, email: string, password: string) => Promise<void>
  onForgotPassword?: () => void
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
          setError('הססמה חייבת להיות לפחות 6 תווים')
          setLoading(false)
          return
        }
        
        console.log('📝 Registering user:', { name: formData.name, lastName: formData.lastName, phone: formData.phone, email: formData.email })
        await onRegister(formData.name, formData.lastName, formData.phone, formData.email, formData.password)
        console.log('✅ Registration successful!')
      } else {
        if (!formData.email || !formData.password) {
          setError('אימייל וססמה נדרשים')
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
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <WolfIcon className="w-24 h-24 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-3 relative">
              <span className="text-white">BE</span>
              <span className="text-cyan-400 relative inline-block">
                A
                {/* Scratch marks on A */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <line x1="20" y1="10" x2="40" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <line x1="40" y1="10" x2="60" y2="90" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <line x1="60" y1="10" x2="80" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                </svg>
              </span>
              <span className="text-white">ST</span>
            </h1>
            
            <p className="text-xl text-cyan-400 font-medium">
              בית לאימון מבוסס מדע
            </p>
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
            <div className="flex items-center justify-center mb-4">
              <WolfIcon className="w-12 h-12 text-cyan-400" />
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
                      name="search"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      readOnly
                      className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="הכנס שם פרטי"
                      autoComplete="none"
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
                      name="query"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      readOnly
                      className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="הכנס שם משפחה"
                      autoComplete="none"
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
                      type="text"
                      name="mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      readOnly
                      className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="הכנס מספר נייד"
                      autoComplete="none"
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
                  type="text"
                  name="usertext"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  readOnly
                  className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right"
                  placeholder="example@email.com"
                  autoComplete="none"
                  data-lpignore="true"
                  data-form-type="other"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                ססמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="secret"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  readOnly
                  className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="••••••••"
                  autoComplete="none"
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
                  אימות ססמה
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="verify"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    readOnly
                    className="w-full bg-dark-hover border border-dark-border rounded-lg pl-4 pr-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="••••••••"
                    autoComplete="none"
                    data-lpignore="true"
                    data-form-type="other"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">הזן את הססמה שוב לאימות</p>
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
                  onClick={onForgotPassword}
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


import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, UserCircle2, UserPlus, Users, Download } from 'lucide-react'
import BeastLogo from './BeastLogo'

interface HeaderProps {
  onLoginClick: () => void
  onProfileClick: () => void
  onManageUsersClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onProfileClick, onManageUsersClick }) => {
  const { user, logout, isAdmin } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = () => {
    setShowInstallModal(true)
  }

  const confirmInstall = async () => {
    setShowInstallModal(false)
    
    if (!deferredPrompt) {
      // For iOS Safari - show instructions
      alert('📱 להתקנת האפליקציה:\n\n1. לחץ על כפתור השיתוף (⬆️)\n2. בחר "הוסף למסך הבית"\n3. לחץ "הוסף"')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
    
    setDeferredPrompt(null)
  }

  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Right side - User Info and Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            {user ? (
              <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
                {/* PWA Install Button - Always visible */}
                {showInstallButton ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-green-500/50 flex-shrink-0 mt-0.5"
                    title="הוסף לדף הבית"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                ) : (
                  <UserCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-right min-w-0 flex-1">
                  <p className="text-white font-medium text-xs sm:text-base flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                    <span className="truncate">שלום, {user.name}</span>
                    {isAdmin ? (
                      <span className="text-[10px] sm:text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold flex-shrink-0">
                        מנהל
                      </span>
                    ) : user.role === 'vip' ? (
                      <span className="text-[10px] sm:text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold flex-shrink-0">
                        BEAST
                      </span>
                    ) : user.role === 'teenbeast' ? (
                      <span className="text-[10px] sm:text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold flex-shrink-0">
                        TeenBEAST
                      </span>
                    ) : user.role === 'onlinebeast' ? (
                      <span className="text-[10px] sm:text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold flex-shrink-0">
                        OnlineBEAST
                      </span>
                    ) : user.role === 'kibbutz' ? (
                      <span className="text-[10px] sm:text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold flex-shrink-0">
                        קיבוץ
                      </span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-[10px] sm:text-xs">
                    <button
                      onClick={onProfileClick}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap"
                    >
                      ערוך פרופיל
                    </button>
                    {isAdmin && onManageUsersClick && (
                      <>
                        <span className="text-gray-600 text-[8px] sm:text-xs">|</span>
                        <button
                          onClick={onManageUsersClick}
                          className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                          title="רשימת מנויים"
                        >
                          <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">רשימת מנויים</span>
                          <span className="sm:hidden">מנויים</span>
                        </button>
                      </>
                    )}
                    <span className="text-gray-600 text-[8px] sm:text-xs">|</span>
                    <button 
                      onClick={logout}
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                      title="התנתק"
                    >
                      <LogOut className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>התנתק</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-2 sm:px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-cyan-500 hover:to-blue-600 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-1 sm:gap-2"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">התחבר / צור משתמש</span>
                <span className="sm:hidden">התחבר</span>
              </button>
            )}
          </div>
          
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <BeastLogo size="small" showScratch={true} showWolf={true} showSlogan={true} layout="horizontal" />
          </div>
        </div>
      </div>

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-dark-card border-2 border-cyan-500/50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50">
                <Download className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">הוסף BEAST לדף הבית</h3>
              <p className="text-gray-300 text-sm">התקן את האפליקציה לגישה מהירה ונוחה</p>
            </div>

            <div className="space-y-3 mb-6 text-right">
              <div className="flex items-start gap-3 bg-dark-hover p-3 rounded-lg">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-400 font-bold text-sm">1</span>
                </div>
                <p className="text-gray-300 text-sm">גישה מהירה ישירות מהמסך הראשי</p>
              </div>
              
              <div className="flex items-start gap-3 bg-dark-hover p-3 rounded-lg">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-400 font-bold text-sm">2</span>
                </div>
                <p className="text-gray-300 text-sm">עובד גם ללא אינטרנט</p>
              </div>
              
              <div className="flex items-start gap-3 bg-dark-hover p-3 rounded-lg">
                <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-400 font-bold text-sm">3</span>
                </div>
                <p className="text-gray-300 text-sm">חוויית שימוש כמו אפליקציה רגילה</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInstallModal(false)}
                className="flex-1 px-4 py-3 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg font-medium transition-all"
              >
                ביטול
              </button>
              <button
                onClick={confirmInstall}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                התקן עכשיו
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header


import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserCircle2, UserPlus, Download } from 'lucide-react'

interface HeaderProps {
  onLoginClick: () => void
  onProfileClick: () => void
  onManageUsersClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onProfileClick, onManageUsersClick }) => {
  const { user, logout, isAdmin } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Show button if:
  // 1. User is logged in
  // 2. NOT already installed (not in standalone mode)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches
  const shouldShowInstallButton = Boolean(user && !isInstalled)

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // No prompt available - show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)
      
      if (isIOS) {
        alert('📱 להוספה למסך הבית:\n\n1. לחץ על כפתור השיתוף ⬆️\n2. גלול למטה ובחר "הוסף למסך הבית"\n3. לחץ "הוסף"')
      } else if (isAndroid) {
        alert('📱 להתקנת האפליקציה:\n\n1. לחץ על תפריט ⋮ בדפדפן\n2. בחר "התקן אפליקציה" או "הוסף למסך הבית"\n3. לחץ "התקן"')
      } else {
        alert('📱 להתקנת האפליקציה:\n\nבתפריט הדפדפן, בחר באפשרות "התקן אפליקציה" או "הוסף למסך הבית"')
      }
      return
    }

    try {
      // Trigger install prompt immediately
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installed successfully')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Right side - User Info and Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            {user ? (
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                {/* PWA Install Button - Show when logged in and not installed */}
                {shouldShowInstallButton && (
                  <button
                    onClick={handleInstallClick}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-green-500/50 flex-shrink-0"
                    title="הוסף לדף הבית"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                  </button>
                )}
                <div className="text-right min-w-0 flex-1">
                  <p className="text-white font-medium text-xs sm:text-base flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                    <span className="truncate">שלום, {user.name}</span>
                    {isAdmin ? (
                      <span className="text-[10px] sm:text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-1.5 sm:px-2 py-0.5 rounded font-bold flex-shrink-0">
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
                      className="text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap flex items-center gap-1"
                      title="ערוך פרופיל"
                    >
                      <UserCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span className="flex-shrink-0">ערוך פרופיל</span>
                    </button>
                    <span className="text-gray-600">|</span>
                    <button 
                      onClick={logout}
                      className="text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap"
                      title="התנתק"
                    >
                      התנתק
                    </button>
                    {isAdmin && onManageUsersClick && (
                      <>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={onManageUsersClick}
                          className="text-green-400 hover:text-green-300 transition-colors whitespace-nowrap"
                          title="רשימת מנויים"
                        >
                          מנויים
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-2 sm:px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-cyan-500 hover:to-blue-600 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline flex-shrink-0">התחבר / צור משתמש</span>
                <span className="sm:hidden flex-shrink-0">התחבר</span>
              </button>
            )}
          </div>
          
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/header-logo.svg" 
              alt="BEAST Logo" 
              className="h-20 sm:h-24 w-auto"
            />
          </div>
        </div>
      </div>

    </header>
  )
}

export default Header


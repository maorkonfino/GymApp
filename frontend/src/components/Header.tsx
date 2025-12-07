import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, UserCircle2, UserPlus, Users } from 'lucide-react'

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

interface HeaderProps {
  onLoginClick: () => void
  onProfileClick: () => void
  onManageUsersClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onProfileClick, onManageUsersClick }) => {
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Right side - User Info and Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-start gap-2">
                <UserCircle2 className="w-8 h-8 text-cyan-400 mt-0.5" />
                <div className="text-right">
                  <p className="text-white font-medium text-sm sm:text-base flex items-center gap-2 mb-1">
                    שלום, {user.name}
                    {isAdmin ? (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        מנהל
                      </span>
                    ) : user.role === 'vip' ? (
                      <span className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 py-0.5 rounded font-bold">
                        BEAST
                      </span>
                    ) : user.role === 'kibbutz' ? (
                      <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded">
                        קיבוץ
                      </span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={onProfileClick}
                      className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                    >
                      ערוך פרופיל
                    </button>
                    {isAdmin && onManageUsersClick && (
                      <>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={onManageUsersClick}
                          className="text-purple-400 text-xs hover:text-purple-300 transition-colors flex items-center gap-1"
                          title="רשימת מנויים"
                        >
                          <Users className="w-3 h-3" />
                          רשימת מנויים
                        </button>
                      </>
                    )}
                    <span className="text-gray-600">|</span>
                    <button 
                      onClick={logout}
                      className="text-red-400 text-xs hover:text-red-300 transition-colors flex items-center gap-1"
                      title="התנתק"
                    >
                      <LogOut className="w-3 h-3" />
                      התנתק
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-cyan-500 hover:to-blue-600 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>התחבר / צור משתמש</span>
              </button>
            )}
          </div>
          
          {/* Left side - Logo and Slogan */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <WolfIcon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="text-xl sm:text-2xl font-bold tracking-tight relative">
                <span className="text-white">BE</span>
                <span className="text-cyan-400 relative inline-block">
                  A
                  {/* Scratch marks on A */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
                    <line x1="20" y1="10" x2="40" y2="90" stroke="white" strokeWidth="3" />
                    <line x1="40" y1="10" x2="60" y2="90" stroke="white" strokeWidth="3" />
                    <line x1="60" y1="10" x2="80" y2="90" stroke="white" strokeWidth="3" />
                  </svg>
                </span>
                <span className="text-white">ST</span>
              </div>
              <p className="text-cyan-400 text-[10px] sm:text-xs font-medium">בית לאימון מבוסס מדע</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


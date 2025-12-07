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
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Right side - User Info and Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            {user ? (
              <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
                <UserCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mt-0.5 flex-shrink-0" />
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
          
          {/* Left side - Logo and Slogan */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <WolfIcon className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="text-base sm:text-2xl font-bold tracking-tight relative">
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
              <p className="text-cyan-400 text-[8px] sm:text-xs font-medium whitespace-nowrap">בית לאימון מבוסס מדע</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


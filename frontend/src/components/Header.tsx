import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, UserCircle2, UserPlus, Users } from 'lucide-react'
import BeastLogo from './BeastLogo'

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
    </header>
  )
}

export default Header


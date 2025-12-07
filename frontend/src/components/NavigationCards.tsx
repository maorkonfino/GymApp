import React from 'react'
import { Calendar, FileText, TrendingUp } from 'lucide-react'

interface NavCard {
  title: string
  subtitle?: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  view?: 'day' | 'week' | 'workout' | 'tracking'
}

import { useAuth } from '../contexts/AuthContext'

type ViewMode = 'day' | 'week' | 'workout' | 'tracking' | 'myworkouts';

interface NavigationCardsProps {
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
}

const NavigationCards: React.FC<NavigationCardsProps> = ({ activeView, onViewChange }) => {
  const { user, isAdmin } = useAuth()
  // Filter cards based on user type
  const allCards: NavCard[] = [
    {
      title: 'הרשמה לאימון',
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      view: 'day'
    },
    {
      title: 'תוכנית האימון שלי',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      view: 'workout'
    },
    {
      title: 'מעקב התקדמות',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      view: 'tracking'
    }
  ];

  // Filter based on user role
  const cards = allCards.filter(card => {
    if (!user) return card.view === 'day'; // Guest can see registration only
    if (isAdmin) return true; // Admin sees all
    if (user.role === 'vip') return true; // VIP sees all
    if (user.role === 'kibbutz') return true; // Kibbutz sees all buttons (access controlled within pages)
    return true;
  })

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => card.view && onViewChange(card.view)}
          className={`
            bg-gradient-to-br ${card.bgGradient}
            border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6
            cursor-pointer transition-all duration-300
            hover:scale-105 hover:shadow-xl active:scale-95
            ${card.view === activeView ? 'ring-2 ring-cyan-400/50' : ''}
          `}
        >
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
            <div className={`${card.color} bg-dark-card rounded-full p-2.5 sm:p-3 shadow-lg`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg leading-tight">{card.title}</h3>
              {card.subtitle && (
                <p className="text-cyan-400 text-xs sm:text-sm mt-1">{card.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NavigationCards


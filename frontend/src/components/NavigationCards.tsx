import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, FileText, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavCard {
  title: string
  subtitle?: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  path: string
}

const NavigationCards: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin } = useAuth()
  
  // Define all navigation cards
  const allCards: NavCard[] = [
    {
      title: 'הרשמה לאימון',
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      path: '/'
    },
    {
      title: 'תוכנית האימון שלי',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/20 to-red-500/20',
      path: '/workout-plan'
    },
    {
      title: 'מעקב התקדמות',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      path: '/nutrition-tracking'
    }
  ];

  // Filter based on user role and hide current page button
  const cards = allCards.filter(card => {
    // Hide the button for the current page
    if (card.path === location.pathname) {
      return false;
    }
    
    if (!user) return card.path === '/'; // Guest can see registration only
    if (isAdmin) return true; // Admin sees all
    
    // OnlineBEAST users cannot see registration page
    if (user.role === 'onlinebeast' && card.path === '/') {
      return false;
    }
    
    if (user.role === 'vip') return true; // VIP sees all
    if (user.role === 'kibbutz') return true; // Kibbutz sees all buttons (access controlled within pages)
    if (user.role === 'teenbeast') return true; // TeenBEAST sees all
    if (user.role === 'onlinebeast') return true; // OnlineBEAST sees workout and nutrition (filtered above)
    
    return true;
  })

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => navigate(card.path)}
          className={`
            bg-gradient-to-br ${card.bgGradient}
            border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6
            cursor-pointer transition-all duration-300
            hover:scale-105 hover:shadow-xl active:scale-95
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


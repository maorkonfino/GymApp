import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { format, addDays, startOfWeek, getDay } from 'date-fns'
import { he } from 'date-fns/locale'

interface DateSelectorProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onViewAllWeek: (weekOffset: number) => void
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateSelect, onViewAllWeek }) => {
  const [weekOffset, setWeekOffset] = useState(0)
  
  // Get the current week dates
  const getWeekDates = () => {
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 0 })
    const baseDate = addDays(start, weekOffset * 7)
    
    return Array.from({ length: 7 }, (_, i) => addDays(baseDate, i))
  }

  const weekDates = getWeekDates()
  
  // Get Hebrew day names
  const getDayName = (date: Date) => {
    const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
    return days[getDay(date)]
  }

  // Get month names in Hebrew  
  const getMonthRange = () => {
    const firstDate = weekDates[0]
    const lastDate = weekDates[6]
    const firstMonth = format(firstDate, 'LLLL', { locale: he })
    const lastMonth = format(lastDate, 'LLLL', { locale: he })
    
    if (firstMonth === lastMonth) {
      return firstMonth
    }
    return `${firstMonth} - ${lastMonth}`
  }

  const isSelected = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 hover:bg-dark-hover rounded-lg transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
        
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          {getMonthRange()}
        </h2>
        
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 hover:bg-dark-hover rounded-lg transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Week dates */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
        {weekDates.map((date, index) => {
          const selected = isSelected(date)
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl
                transition-all duration-300
                ${selected 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 scale-105' 
                  : 'bg-dark-hover hover:bg-dark-border active:scale-95'
                }
              `}
            >
              <span className={`text-[10px] sm:text-xs mb-0.5 sm:mb-1 ${selected ? 'text-white' : 'text-gray-400'}`}>
                {getDayName(date)}'
              </span>
              <span className={`text-base sm:text-lg font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>
                {format(date, 'd.M')}
              </span>
              <span className={`text-[10px] sm:text-xs ${selected ? 'text-cyan-100' : 'text-gray-500'}`}>
                {getDayName(date)}
              </span>
            </button>
          )
        })}
      </div>

      {/* View all week button */}
      <button 
        onClick={() => onViewAllWeek(weekOffset)}
        className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-cyan-400 font-medium text-sm sm:text-base"
      >
        <Eye className="w-4 h-4" />
        <span>צפה בטבלה השבועית המלאה</span>
      </button>
    </div>
  )
}

export default DateSelector


import React, { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface WeightEntry {
  date: string
  weight: number
}

interface WeightGraphProps {
  entries: WeightEntry[]
}

const WeightGraph: React.FC<WeightGraphProps> = ({ entries }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Filter valid weights
  const validEntries = entries.filter(e => e.weight > 0)
  
  if (validEntries.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 text-center">
        <p className="text-gray-400">אין מספיק נתונים להצגת גרף</p>
      </div>
    )
  }

  // Calculate statistics
  const firstWeight = validEntries[0].weight
  const currentWeight = validEntries[validEntries.length - 1].weight
  const weightChange = currentWeight - firstWeight
  const percentChange = ((weightChange / firstWeight) * 100).toFixed(1)

  // Calculate averages
  const getAverages = () => {
    if (viewMode === 'daily') {
      // Sort oldest to newest (left to right)
      return [...validEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (viewMode === 'weekly') {
      // Group by weeks and sort oldest to newest
      const weeks: { [key: number]: number[] } = {}
      const sortedEntries = [...validEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      sortedEntries.forEach((entry, idx) => {
        const weekNum = Math.floor(idx / 7)
        if (!weeks[weekNum]) weeks[weekNum] = []
        weeks[weekNum].push(entry.weight)
      })
      
      // Sort by week number (oldest first)
      return Object.keys(weeks).sort((a, b) => Number(a) - Number(b)).map((weekNum) => ({
        date: `שבוע ${Number(weekNum) + 1}`,
        weight: weeks[Number(weekNum)].reduce((a, b) => a + b, 0) / weeks[Number(weekNum)].length
      }))
    } else {
      // Monthly average - sort oldest to newest
      const months: { [key: string]: number[] } = {}
      validEntries.forEach(entry => {
        const month = entry.date.substring(0, 7)
        if (!months[month]) months[month] = []
        months[month].push(entry.weight)
      })
      
      // Sort chronologically (oldest first)
      return Object.keys(months).sort().map((month) => ({
        date: month,
        weight: months[month].reduce((a, b) => a + b, 0) / months[month].length
      }))
    }
  }

  const displayData = getAverages()
  const maxWeight = Math.max(...displayData.map(e => e.weight))
  const minWeight = Math.min(...displayData.map(e => e.weight))
  
  // Add padding of 10 to min and max
  const yMin = minWeight - 10
  const yMax = maxWeight + 10
  const range = yMax - yMin

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
          <p className="text-blue-400 text-sm mb-1">משקל התחלתי</p>
          <p className="text-2xl font-bold text-white">{firstWeight.toFixed(1)}</p>
          <p className="text-xs text-gray-500">KG</p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <p className="text-green-400 text-sm mb-1">משקל נוכחי</p>
          <p className="text-2xl font-bold text-white">{currentWeight.toFixed(1)}</p>
          <p className="text-xs text-gray-500">KG</p>
        </div>
        
        <div className={`${weightChange < 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-4 text-center`}>
          <p className={`${weightChange < 0 ? 'text-green-400' : 'text-red-400'} text-sm mb-1 flex items-center justify-center gap-1`}>
            {weightChange < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            שינוי
          </p>
          <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {Math.abs(weightChange).toFixed(1)}
          </p>
          <p className={`text-sm ${weightChange < 0 ? 'text-green-300' : 'text-red-300'}`}>
            {percentChange}%
          </p>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('daily')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            viewMode === 'daily'
              ? 'bg-green-500 text-white'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
          }`}
        >
          יומי
        </button>
        <button
          onClick={() => setViewMode('weekly')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            viewMode === 'weekly'
              ? 'bg-green-500 text-white'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
          }`}
        >
          ממוצע שבועי
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            viewMode === 'monthly'
              ? 'bg-green-500 text-white'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
          }`}
        >
          ממוצע חודשי
        </button>
      </div>

      {/* Graph with X and Y axes */}
      <div className="relative h-80 bg-dark-hover rounded-lg p-8">
        {/* Y Axis Label - LEFT SIDE */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-cyan-400 whitespace-nowrap">
          משקל (KG)
        </div>
        
        {/* Y Axis - LEFT SIDE */}
        <div className="absolute left-16 top-8 bottom-16 w-0.5 bg-gray-600"></div>
        
        {/* Y Axis Ticks - LEFT SIDE */}
        <div className="absolute left-16 top-8 bottom-16 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => {
            const value = yMax - (range * i / 4)
            return (
              <div key={i} className="relative">
                <div className="absolute left-0 top-0 w-2 h-0.5 bg-gray-600"></div>
                <div className="absolute left-4 top-0 -translate-y-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                  {value.toFixed(1)}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* X Axis */}
        <div className="absolute left-16 right-8 bottom-16 h-0.5 bg-gray-600"></div>
        
        {/* Graph Area - Data Points with Lines */}
        <div className="absolute left-16 right-8 top-8 bottom-16">
          {/* SVG overlay for lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {displayData.map((entry, idx) => {
              if (idx === 0) return null
              const prevEntry = displayData[idx - 1]
              
              const totalPoints = displayData.length
              const padding = 0
              const availableWidth = 100 - (2 * padding)
              const x1 = totalPoints === 1 ? 50 : padding + ((idx - 1) / (totalPoints - 1)) * availableWidth
              const x2 = totalPoints === 1 ? 50 : padding + (idx / (totalPoints - 1)) * availableWidth
              const y1 = 100 - ((prevEntry.weight - yMin) / range) * 100
              const y2 = 100 - ((entry.weight - yMin) / range) * 100
              
              return (
                <line
                  key={idx}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#10b981"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
          
          {/* Data Points */}
          <div className="absolute inset-0">
            {displayData.map((entry, idx) => {
              const totalPoints = displayData.length
              // Add padding so points don't sit on axes (5% to 95% range)
              const padding = 0
              const availableWidth = 100 - (2 * padding)
              const xPercent = totalPoints === 1 
                ? 50 
                : padding + (idx / (totalPoints - 1)) * availableWidth
              const yPercent = ((entry.weight - yMin) / range) * 100
              
              return (
                <div 
                  key={idx}
                  className="absolute flex flex-col items-center z-10"
                  style={{ 
                    left: `${xPercent}%`,
                    bottom: `${yPercent}%`,
                    transform: 'translate(-50%, 0)'
                  }}
                >
                  {/* Weight Label */}
                  <div className="text-[9px] text-green-400 font-semibold mb-1 bg-dark-hover px-1 rounded">
                    {entry.weight.toFixed(1)}
                  </div>
                  {/* Point Dot - Smaller */}
                  <div className="w-2 h-2 bg-green-500 rounded-full border border-white shadow-lg hover:scale-150 transition-transform"></div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* X Axis Labels */}
        <div className="absolute left-16 right-8 bottom-10">
          {displayData.map((entry, idx) => {
            const totalPoints = displayData.length
            const padding = 0
            const availableWidth = 100 - (2 * padding)
            const xPercent = totalPoints === 1 
              ? 50 
              : padding + (idx / (totalPoints - 1)) * availableWidth
            
            // Format date label based on view mode
            let label = ''
            if (viewMode === 'daily') {
              label = entry.date.substring(8, 10) + '/' + entry.date.substring(5, 7)
            } else if (viewMode === 'weekly') {
              label = entry.date // Already formatted as "שבוע X"
            } else {
              // Monthly: show month/year
              const [year, month] = entry.date.split('-')
              label = `${month}/${year.substring(2)}`
            }
            
            return (
              <div 
                key={idx} 
                className="absolute"
                style={{
                  left: `${xPercent}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                  {label}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* X Axis Label */}
        <div className="absolute left-16 right-8 bottom-2 text-center text-xs font-bold text-cyan-400">
          תאריך
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-center text-sm text-gray-400">
        {viewMode === 'daily' && 'תצוגה יומית'}
        {viewMode === 'weekly' && 'ממוצע שבועי'}
        {viewMode === 'monthly' && 'ממוצע חודשי'}
      </div>
    </div>
  )
}

export default WeightGraph


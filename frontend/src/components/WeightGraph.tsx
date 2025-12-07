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
      return validEntries
    } else if (viewMode === 'weekly') {
      // Group by weeks
      const weeks: { [key: number]: number[] } = {}
      validEntries.forEach((entry, idx) => {
        const weekNum = Math.floor(idx / 7)
        if (!weeks[weekNum]) weeks[weekNum] = []
        weeks[weekNum].push(entry.weight)
      })
      return Object.values(weeks).map((weights, idx) => ({
        date: `שבוע ${idx + 1}`,
        weight: weights.reduce((a, b) => a + b, 0) / weights.length
      }))
    } else {
      // Monthly average
      const months: { [key: string]: number[] } = {}
      validEntries.forEach(entry => {
        const month = entry.date.substring(0, 7)
        if (!months[month]) months[month] = []
        months[month].push(entry.weight)
      })
      return Object.entries(months).map(([month, weights]) => ({
        date: month,
        weight: weights.reduce((a, b) => a + b, 0) / weights.length
      }))
    }
  }

  const displayData = getAverages()
  const maxWeight = Math.max(...displayData.map(e => e.weight))
  const minWeight = Math.min(...displayData.map(e => e.weight))
  const range = maxWeight - minWeight || 1

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

      {/* Simple Graph */}
      <div className="relative h-64 bg-dark-hover rounded-lg p-4">
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {displayData.map((entry, idx) => {
            const height = ((entry.weight - minWeight) / range) * 100
            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-xs text-green-400 font-semibold">
                  {entry.weight.toFixed(1)}
                </div>
                <div 
                  className="w-full max-w-[40px] bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-400 hover:to-green-300"
                  style={{ height: `${Math.max(height, 10)}%` }}
                ></div>
                <div className="text-[10px] text-gray-500 text-center">
                  {typeof entry.date === 'string' && entry.date.includes('שבוע') 
                    ? entry.date 
                    : entry.date.substring(8, 10) + '/' + entry.date.substring(5, 7)}
                </div>
              </div>
            )
          })}
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


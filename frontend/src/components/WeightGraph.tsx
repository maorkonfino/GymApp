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

  const validEntries = entries.filter(e => e.weight > 0)

  if (validEntries.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 text-center">
        <p className="text-gray-400">אין מספיק נתונים להצגת גרף</p>
      </div>
    )
  }

  const sortedValid = [...validEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstWeight = sortedValid[0].weight
  const currentWeight = sortedValid[sortedValid.length - 1].weight
  const weightChange = currentWeight - firstWeight
  const percentChange = ((weightChange / firstWeight) * 100).toFixed(1)

  const getDisplayData = () => {
    if (viewMode === 'daily') {
      return sortedValid
    } else if (viewMode === 'weekly') {
      const weeks: { [key: string]: { weights: number[]; startDate: string } } = {}
      sortedValid.forEach(entry => {
        const d = new Date(entry.date)
        const dayOfWeek = d.getDay()
        const sunday = new Date(d)
        sunday.setDate(d.getDate() - dayOfWeek)
        const weekKey = sunday.toISOString().substring(0, 10)
        if (!weeks[weekKey]) weeks[weekKey] = { weights: [], startDate: weekKey }
        weeks[weekKey].weights.push(entry.weight)
      })
      return Object.keys(weeks).sort().map((key, idx) => ({
        date: `שבוע ${idx + 1}`,
        weight: weeks[key].weights.reduce((a, b) => a + b, 0) / weeks[key].weights.length
      }))
    } else {
      const months: { [key: string]: number[] } = {}
      sortedValid.forEach(entry => {
        const month = entry.date.substring(0, 7)
        if (!months[month]) months[month] = []
        months[month].push(entry.weight)
      })
      return Object.keys(months).sort().map(month => ({
        date: month,
        weight: months[month].reduce((a, b) => a + b, 0) / months[month].length
      }))
    }
  }

  const displayData = getDisplayData()
  const maxWeight = Math.max(...displayData.map(e => e.weight))
  const minWeight = Math.min(...displayData.map(e => e.weight))
  const yMin = minWeight - 2
  const yMax = maxWeight + 2
  const range = yMax - yMin || 1

  const getLabel = (entry: { date: string }) => {
    if (viewMode === 'daily') {
      return entry.date.substring(8, 10) + '/' + entry.date.substring(5, 7)
    } else if (viewMode === 'weekly') {
      return entry.date
    } else {
      const [year, month] = entry.date.split('-')
      return `${month}/${year.substring(2)}`
    }
  }

  const maxLabels = viewMode === 'daily' ? 12 : viewMode === 'weekly' ? 15 : 12
  const labelStep = displayData.length <= maxLabels ? 1 : Math.ceil(displayData.length / maxLabels)
  const shouldShowLabel = (idx: number) => {
    if (displayData.length <= maxLabels) return true
    if (idx === 0 || idx === displayData.length - 1) return true
    return idx % labelStep === 0
  }

  const graphWidth = Math.max(100, displayData.length * (viewMode === 'daily' ? 40 : 60))

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

      {/* Graph */}
      <div className="relative h-80 bg-dark-hover rounded-lg p-8 overflow-x-auto">
        {/* Y Axis Label */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-cyan-400 whitespace-nowrap z-20">
          משקל (KG)
        </div>

        {/* Y Axis Line */}
        <div className="absolute left-16 top-8 bottom-16 w-0.5 bg-gray-600 z-20"></div>

        {/* Y Axis Ticks */}
        <div className="absolute left-16 top-8 bottom-16 flex flex-col justify-between z-20">
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

        {/* Scrollable graph content */}
        <div className="absolute left-16 right-4 top-8 bottom-4 overflow-x-auto overflow-y-hidden">
          <div style={{ width: `${graphWidth}px`, minWidth: '100%' }} className="relative h-full pb-8">
            {/* X Axis */}
            <div className="absolute left-0 right-0 bottom-8 h-0.5 bg-gray-600"></div>

            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full pointer-events-none" style={{ height: 'calc(100% - 32px)' }}>
              {displayData.map((entry, idx) => {
                if (idx === 0) return null
                const prevEntry = displayData[idx - 1]
                const total = displayData.length
                const x1 = total === 1 ? 50 : ((idx - 1) / (total - 1)) * 100
                const x2 = total === 1 ? 50 : (idx / (total - 1)) * 100
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
            <div className="absolute inset-0" style={{ height: 'calc(100% - 32px)' }}>
              {displayData.map((entry, idx) => {
                const total = displayData.length
                const xPercent = total === 1 ? 50 : (idx / (total - 1)) * 100
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
                    <div className="text-[9px] text-green-400 font-semibold mb-1 bg-dark-hover px-1 rounded">
                      {entry.weight.toFixed(1)}
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full border border-white shadow-lg hover:scale-150 transition-transform"></div>
                  </div>
                )
              })}
            </div>

            {/* X Axis Labels */}
            <div className="absolute left-0 right-0 bottom-0 h-6">
              {displayData.map((entry, idx) => {
                if (!shouldShowLabel(idx)) return null
                const total = displayData.length
                const xPercent = total === 1 ? 50 : (idx / (total - 1)) * 100
                return (
                  <div
                    key={idx}
                    className="absolute"
                    style={{ left: `${xPercent}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="text-[8px] text-gray-400 font-medium whitespace-nowrap">
                      {getLabel(entry)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-center text-sm text-gray-400">
        {viewMode === 'daily' && `תצוגה יומית (${displayData.length} נתונים)`}
        {viewMode === 'weekly' && `ממוצע שבועי (${displayData.length} שבועות)`}
        {viewMode === 'monthly' && `ממוצע חודשי (${displayData.length} חודשים)`}
      </div>
    </div>
  )
}

export default WeightGraph

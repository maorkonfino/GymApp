import React, { useState, useRef, useCallback } from 'react'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [scrollStartX, setScrollStartX] = useState(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el) return
    setIsDragging(true)
    setDragStartX(e.clientX)
    setScrollStartX(el.scrollLeft)
    el.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !scrollRef.current) return
    const dx = e.clientX - dragStartX
    scrollRef.current.scrollLeft = scrollStartX - dx
  }, [isDragging, dragStartX, scrollStartX])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false)
    scrollRef.current?.releasePointerCapture(e.pointerId)
  }, [])

  const validEntries = entries.filter(e => e.weight > 0)

  if (validEntries.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
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

  const pointSpacing = viewMode === 'daily' ? 50 : 70
  const graphWidth = Math.max(300, displayData.length * pointSpacing)

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 sm:p-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 sm:p-4 text-center">
          <p className="text-blue-400 text-[10px] sm:text-sm mb-0.5 sm:mb-1">משקל התחלתי</p>
          <p className="text-lg sm:text-2xl font-bold text-white">{firstWeight.toFixed(1)}</p>
          <p className="text-[9px] sm:text-xs text-gray-500">KG</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 sm:p-4 text-center">
          <p className="text-green-400 text-[10px] sm:text-sm mb-0.5 sm:mb-1">משקל נוכחי</p>
          <p className="text-lg sm:text-2xl font-bold text-white">{currentWeight.toFixed(1)}</p>
          <p className="text-[9px] sm:text-xs text-gray-500">KG</p>
        </div>

        <div className={`${weightChange < 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-2 sm:p-4 text-center`}>
          <p className={`${weightChange < 0 ? 'text-green-400' : 'text-red-400'} text-[10px] sm:text-sm mb-0.5 sm:mb-1 flex items-center justify-center gap-1`}>
            {weightChange < 0 ? <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
            שינוי
          </p>
          <p className={`text-lg sm:text-2xl font-bold ${weightChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {Math.abs(weightChange).toFixed(1)}
          </p>
          <p className={`text-[10px] sm:text-sm ${weightChange < 0 ? 'text-green-300' : 'text-red-300'}`}>
            {percentChange}%
          </p>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {(['daily', 'weekly', 'monthly'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
              viewMode === mode
                ? 'bg-green-500 text-white'
                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            }`}
          >
            {mode === 'daily' ? 'יומי' : mode === 'weekly' ? 'שבועי' : 'חודשי'}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="relative bg-dark-hover rounded-lg select-none">
        {/* Y Axis (fixed left side) */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-14 z-20 bg-dark-hover rounded-l-lg">
          {/* Y Axis Label */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] sm:text-[10px] font-bold text-cyan-400 whitespace-nowrap">
            KG
          </div>
          {/* Y Axis Line */}
          <div className="absolute right-0 top-4 bottom-10 w-0.5 bg-gray-600"></div>
          {/* Y Axis Ticks */}
          <div className="absolute right-0 top-4 bottom-10 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => {
              const value = yMax - (range * i / 4)
              return (
                <div key={i} className="relative">
                  <div className="absolute right-0 top-0 w-1.5 h-0.5 bg-gray-600"></div>
                  <div className="absolute right-2.5 top-0 -translate-y-1/2 text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">
                    {value.toFixed(1)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scrollable graph area with drag support */}
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden pr-2"
          style={{
            marginLeft: '40px',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'pan-y',
            scrollbarWidth: 'thin',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            style={{ width: `${graphWidth}px`, minWidth: '100%' }}
            className="relative"
          >
            {/* Chart area */}
            <div className="relative" style={{ height: '240px', paddingTop: '16px', paddingBottom: '40px' }}>
              {/* X Axis */}
              <div className="absolute left-0 right-0 bottom-[40px] h-0.5 bg-gray-600"></div>

              {/* Horizontal grid lines */}
              {[...Array(5)].map((_, i) => {
                const yPct = (i / 4) * 100
                return (
                  <div
                    key={i}
                    className="absolute left-0 right-0 h-px bg-gray-700/40"
                    style={{ top: `${16 + (yPct / 100) * (240 - 56)}px` }}
                  />
                )
              })}

              {/* SVG Lines */}
              <svg
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: '16px', height: `${240 - 56}px`, width: '100%' }}
                preserveAspectRatio="none"
              >
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
              <div className="absolute left-0 right-0" style={{ top: '16px', height: `${240 - 56}px` }}>
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
                      <div className="text-[8px] sm:text-[9px] text-green-400 font-semibold mb-0.5 bg-dark-hover/80 px-0.5 rounded">
                        {entry.weight.toFixed(1)}
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full border border-white shadow-lg"></div>
                    </div>
                  )
                })}
              </div>

              {/* X Axis Labels */}
              <div className="absolute left-0 right-0 bottom-1 h-8">
                {displayData.map((entry, idx) => {
                  const total = displayData.length
                  const xPercent = total === 1 ? 50 : (idx / (total - 1)) * 100
                  return (
                    <div
                      key={idx}
                      className="absolute"
                      style={{ left: `${xPercent}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="text-[7px] sm:text-[9px] text-gray-400 font-medium whitespace-nowrap">
                        {getLabel(entry)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        {graphWidth > 300 && (
          <div className="text-center py-1.5 text-[9px] sm:text-xs text-gray-500">
            ← גרור לצפייה בכל הנתונים →
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 text-center text-xs sm:text-sm text-gray-400">
        {viewMode === 'daily' && `תצוגה יומית (${displayData.length} נתונים)`}
        {viewMode === 'weekly' && `ממוצע שבועי (${displayData.length} שבועות)`}
        {viewMode === 'monthly' && `ממוצע חודשי (${displayData.length} חודשים)`}
      </div>
    </div>
  )
}

export default WeightGraph

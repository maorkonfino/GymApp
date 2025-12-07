
// Wolf SVG Icon Component - Side profile
export const WolfIcon = ({ className }: { className?: string }) => (
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

// Scratch marks component for the A letter
export const ScratchMarks = ({ className = "" }: { className?: string }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} viewBox="0 0 100 100">
    <line x1="20" y1="10" x2="40" y2="90" stroke="currentColor" strokeWidth="2" className="opacity-30" />
    <line x1="40" y1="10" x2="60" y2="90" stroke="currentColor" strokeWidth="2" className="opacity-40" />
    <line x1="60" y1="10" x2="80" y2="90" stroke="currentColor" strokeWidth="2" className="opacity-30" />
  </svg>
)

// Full BEAST logo with wolf and scratches
export const BeastLogo = ({ 
  size = 'medium',
  showWolf = true,
  showScratch = true
}: { 
  size?: 'small' | 'medium' | 'large'
  showWolf?: boolean
  showScratch?: boolean
}) => {
  const sizeClasses = {
    small: {
      text: 'text-2xl',
      wolf: 'w-8 h-8'
    },
    medium: {
      text: 'text-4xl sm:text-5xl',
      wolf: 'w-16 h-16 sm:w-20 sm:h-20'
    },
    large: {
      text: 'text-6xl sm:text-7xl',
      wolf: 'w-24 h-24 sm:w-32 sm:h-32'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className="flex flex-col items-center gap-4">
      {showWolf && (
        <div className="relative">
          <WolfIcon className={`${classes.wolf} text-cyan-400`} />
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
        </div>
      )}
      
      <h1 className={`${classes.text} font-bold relative`}>
        <span className="text-white">BE</span>
        <span className="text-cyan-400 relative inline-block">
          A
          {showScratch && <ScratchMarks className="text-white" />}
        </span>
        <span className="text-white">ST</span>
      </h1>
    </div>
  )
}

export default BeastLogo


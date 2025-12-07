// Wolf Icon - realistic wolf head design with red eyes
export const WolfIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 120" 
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Wolf head - front facing */}
    <g>
      {/* Head shape */}
      <path d="M 50 20 Q 35 20 28 30 Q 22 40 22 55 Q 22 70 30 82 L 35 90 L 42 95 L 50 98 L 58 95 L 65 90 L 70 82 Q 78 70 78 55 Q 78 40 72 30 Q 65 20 50 20 Z" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="1"
      />
      
      {/* Left ear */}
      <path d="M 28 30 L 22 15 L 30 25 Z" fill="currentColor" />
      
      {/* Right ear */}
      <path d="M 72 30 L 78 15 L 70 25 Z" fill="currentColor" />
      
      {/* Snout/muzzle */}
      <ellipse cx="50" cy="75" rx="18" ry="15" fill="currentColor" />
      <ellipse cx="50" cy="75" rx="14" ry="11" fill="#1a1a1a" opacity="0.3" />
      
      {/* Nose */}
      <path d="M 50 82 L 46 86 L 50 88 L 54 86 Z" fill="#333" />
      
      {/* Eyes - RED with glow */}
      <g>
        {/* Left eye */}
        <ellipse cx="38" cy="50" rx="6" ry="8" fill="#ff0000" />
        <ellipse cx="38" cy="48" rx="3" ry="4" fill="#ff6666" />
        <circle cx="37" cy="47" r="1.5" fill="white" opacity="0.8" />
        
        {/* Right eye */}
        <ellipse cx="62" cy="50" rx="6" ry="8" fill="#ff0000" />
        <ellipse cx="62" cy="48" rx="3" ry="4" fill="#ff6666" />
        <circle cx="63" cy="47" r="1.5" fill="white" opacity="0.8" />
      </g>
      
      {/* Facial features - cheek fur */}
      <path d="M 25 60 L 20 65" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M 27 63 L 22 68" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M 75 60 L 80 65" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M 73 63 L 78 68" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      
      {/* Mouth/fangs hint */}
      <path d="M 45 90 L 45 93 M 50 90 L 50 94 M 55 90 L 55 93" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.6"
      />
    </g>
  </svg>
)

// Scratch marks for BEAST logo - RED colored
export const ScratchMarks = ({ className = "" }: { className?: string }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} viewBox="0 0 100 120">
    {/* Three diagonal scratches across the B - RED */}
    <line x1="15" y1="15" x2="35" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <line x1="35" y1="10" x2="55" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    <line x1="55" y1="15" x2="75" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
  </svg>
)

// Full BEAST logo matching the original design
export const BeastLogo = ({ 
  size = 'medium',
  showWolf = true,
  showScratch = true,
  showSlogan = true
}: { 
  size?: 'small' | 'medium' | 'large'
  showWolf?: boolean
  showScratch?: boolean
  showSlogan?: boolean
}) => {
  const sizeClasses = {
    small: {
      container: 'gap-2',
      logo: 'gap-2',
      text: 'text-2xl',
      wolf: 'w-8 h-8',
      slogan: 'text-xs',
      sloganWidth: 'w-28'
    },
    medium: {
      container: 'gap-3',
      logo: 'gap-4',
      text: 'text-5xl sm:text-6xl',
      wolf: 'w-16 h-16 sm:w-20 sm:h-20',
      slogan: 'text-sm sm:text-base',
      sloganWidth: 'w-48 sm:w-56'
    },
    large: {
      container: 'gap-4',
      logo: 'gap-6',
      text: 'text-7xl sm:text-8xl',
      wolf: 'w-24 h-24 sm:w-32 sm:h-32',
      slogan: 'text-lg sm:text-xl',
      sloganWidth: 'w-64 sm:w-80'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className={`flex items-center justify-center ${classes.logo}`}>
      {/* BEAST text with scratches */}
      <div className="flex flex-col items-start">
        <h1 
          dir="ltr" 
          className={`${classes.text} font-black tracking-tight relative leading-none`} 
          style={{ fontFamily: 'Arial Black, sans-serif' }}
        >
          {/* B with RED scratches */}
          <span className="text-white relative inline-block">
            B
            {showScratch && <ScratchMarks className="text-red-500" />}
          </span>
          <span className="text-white">EAST</span>
          <span className="text-white">.</span>
        </h1>
        
        {/* Slogan directly under BEAST */}
        {showSlogan && (
          <div className={`${classes.slogan} text-cyan-400 font-medium mt-1 ${classes.sloganWidth}`}>
            בית לאימון מבוסס מדע
          </div>
        )}
      </div>
      
      {/* Wolf icon with RED eyes */}
      {showWolf && (
        <div className="relative flex-shrink-0">
          <WolfIcon className={`${classes.wolf} text-white drop-shadow-lg`} />
        </div>
      )}
    </div>
  )
}

export default BeastLogo

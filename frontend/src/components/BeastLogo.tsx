// Wolf Icon - modernized version matching the design
export const WolfIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Wolf head outline */}
    <path 
      d="M32 8 L36 4 L38 6 L36 10 L38 14 L42 12 L44 14 L42 18 L44 22 L40 24 L42 28 L38 32 L34 36 L30 38 L26 36 L24 32 L20 28 L18 24 L16 20 L18 16 L20 12 L24 14 L26 10 L28 6 L30 4 Z" 
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    />
    
    {/* Ears */}
    <path d="M26 10 L24 4 L28 8 Z" fill="currentColor" />
    <path d="M38 10 L40 4 L36 8 Z" fill="currentColor" />
    
    {/* Face details */}
    <path d="M32 38 L30 42 L34 42 Z" fill="currentColor" />
    
    {/* Eyes - cyan colored */}
    <circle cx="26" cy="22" r="2.5" className="fill-cyan-400" />
    <circle cx="38" cy="22" r="2.5" className="fill-cyan-400" />
    
    {/* Inner eye glow */}
    <circle cx="26" cy="22" r="1" fill="white" opacity="0.8" />
    <circle cx="38" cy="22" r="1" fill="white" opacity="0.8" />
    
    {/* Nose */}
    <path d="M32 30 L30 32 L34 32 Z" fill="currentColor" />
    
    {/* Teeth/fangs */}
    <path d="M28 34 L28 36 M32 34 L32 37 M36 34 L36 36" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

// Scratch marks for BEAST logo - cyan colored
export const ScratchMarks = ({ className = "" }: { className?: string }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} viewBox="0 0 100 120">
    {/* Three diagonal scratches across the B */}
    <line x1="15" y1="15" x2="35" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <line x1="35" y1="10" x2="55" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    <line x1="55" y1="15" x2="75" y2="105" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
  </svg>
)

// Full BEAST logo matching the provided design
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
      text: 'text-3xl',
      wolf: 'w-10 h-10',
      slogan: 'text-xs',
      sloganWidth: 'w-32'
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
        <h1 className={`${classes.text} font-black tracking-tight relative leading-none`} style={{ fontFamily: 'Arial Black, sans-serif' }}>
          {/* B with scratches */}
          <span className="text-white relative inline-block">
            B
            {showScratch && <ScratchMarks className="text-cyan-400" />}
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
      
      {/* Wolf icon */}
      {showWolf && (
        <div className="relative flex-shrink-0">
          <WolfIcon className={`${classes.wolf} text-white drop-shadow-lg`} />
        </div>
      )}
    </div>
  )
}

export default BeastLogo

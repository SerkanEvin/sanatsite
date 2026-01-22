export function CornerFrame({ position = 'top-left', className = '' }: { position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; className?: string }) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180'
  };

  return (
    <svg
      className={`absolute ${positionClasses[position]} ${className} pointer-events-none`}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 2 L40 2 M2 2 L2 40" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="15" cy="15" r="2" fill="url(#gradient)" opacity="0.6" />
      <path d="M50 2 L60 2 M2 50 L2 60" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AbstractBrush({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none opacity-20`}
      width="200"
      height="80"
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 40 Q50 10, 100 35 T190 45"
        stroke="url(#brushGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.6"
        filter="url(#blur)"
      />
      <path
        d="M15 45 Q55 20, 105 38 T195 48"
        stroke="url(#brushGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />
      <defs>
        <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
    </svg>
  );
}

export function CirclePattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none opacity-10`}
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="150" cy="150" r="120" stroke="url(#circleGrad)" strokeWidth="2" />
      <circle cx="150" cy="150" r="90" stroke="url(#circleGrad)" strokeWidth="2" opacity="0.6" />
      <circle cx="150" cy="150" r="60" stroke="url(#circleGrad)" strokeWidth="2" opacity="0.4" />
      <circle cx="150" cy="150" r="30" stroke="url(#circleGrad)" strokeWidth="2" opacity="0.2" />
      <defs>
        <linearGradient id="circleGrad">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SketchLine({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`${className} pointer-events-none`}
      width="100%"
      height="6"
      viewBox="0 0 1000 6"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 3 Q250 1, 500 3 T1000 3"
        stroke="url(#lineGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Sparkle({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none animate-pulse`}
      style={{ animationDelay: `${delay}ms` }}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z"
        fill="url(#sparkleGrad)"
        opacity="0.6"
      />
      <defs>
        <linearGradient id="sparkleGrad">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WavyDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-full ${className}`}
      height="40"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 20 Q300 5, 600 20 T1200 20"
        stroke="url(#wavyGrad)"
        strokeWidth="3"
        fill="none"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="wavyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DottedCircle({ className = '', size = 100 }: { className?: string; size?: number }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none opacity-20`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" stroke="url(#dottedGrad)" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="50" cy="50" r="30" stroke="url(#dottedGrad)" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
      <defs>
        <linearGradient id="dottedGrad">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ScribbleUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`${className} pointer-events-none`}
      width="100%"
      height="12"
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6 Q50 3, 100 6 T198 6 M2 9 Q50 7, 100 9 T198 9"
        stroke="url(#scribbleGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="scribbleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PaintSplatter({ className = '', size = 80 }: { className?: string; size?: number }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none opacity-20`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="25" fill="url(#splatterGrad)" opacity="0.8" />
      <circle cx="65" cy="40" r="12" fill="url(#splatterGrad)" opacity="0.6" />
      <circle cx="40" cy="35" r="8" fill="url(#splatterGrad)" opacity="0.7" />
      <circle cx="58" cy="65" r="10" fill="url(#splatterGrad)" opacity="0.5" />
      <circle cx="35" cy="62" r="7" fill="url(#splatterGrad)" opacity="0.6" />
      <defs>
        <radialGradient id="splatterGrad">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function HandDrawnArrow({ className = '', direction = 'right' }: { className?: string; direction?: 'right' | 'left' | 'up' | 'down' }) {
  const rotations = {
    right: 'rotate-0',
    left: 'rotate-180',
    up: '-rotate-90',
    down: 'rotate-90'
  };

  return (
    <svg
      className={`${className} ${rotations[direction]} pointer-events-none opacity-30`}
      width="80"
      height="40"
      viewBox="0 0 80 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 20 Q25 18, 50 20 T70 20 M65 15 L75 20 L65 25"
        stroke="url(#arrowGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ArtFrame({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-4 opacity-40">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="url(#frameGrad)" strokeWidth="2" />
          <line x1="6" y1="6" x2="94" y2="6" stroke="url(#frameGrad)" strokeWidth="1" opacity="0.5" />
          <line x1="6" y1="94" x2="94" y2="94" stroke="url(#frameGrad)" strokeWidth="1" opacity="0.5" />
          <line x1="6" y1="6" x2="6" y2="94" stroke="url(#frameGrad)" strokeWidth="1" opacity="0.5" />
          <line x1="94" y1="6" x2="94" y2="94" stroke="url(#frameGrad)" strokeWidth="1" opacity="0.5" />
          <defs>
            <linearGradient id="frameGrad">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {children}
    </div>
  );
}

export function FloatingShapes({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute ${className} pointer-events-none`}>
      <div className="absolute top-0 left-0 w-8 h-8 border-2 border-orange-400/30 rounded-full animate-float" />
      <div className="absolute top-12 left-16 w-6 h-6 border-2 border-yellow-400/30 rotate-45 animate-float delay-200" />
      <div className="absolute top-6 left-32 w-4 h-4 bg-red-400/20 rounded-full animate-float delay-400" />
      <div className="absolute top-20 left-8 w-5 h-5 border-2 border-orange-400/30 animate-float delay-100" style={{ borderRadius: '30%' }} />
    </div>
  );
}

export function HandDrawnStar({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none animate-pulse opacity-40`}
      style={{ animationDelay: `${delay}ms` }}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2 L18 14 L30 16 L18 18 L16 30 L14 18 L2 16 L14 14 Z"
        stroke="url(#starGrad)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="starGrad">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ScribbleCircle({ className = '', size = 60 }: { className?: string; size?: number }) {
  return (
    <svg
      className={`absolute ${className} pointer-events-none opacity-20 animate-pulse`}
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="30" cy="30" r="25" stroke="url(#scribbleCircleGrad)" strokeWidth="2" strokeDasharray="2 3" />
      <circle cx="30" cy="30" r="20" stroke="url(#scribbleCircleGrad)" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      <defs>
        <linearGradient id="scribbleCircleGrad">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Doodle({ className = '', type = 'swirl' }: { className?: string; type?: 'swirl' | 'zigzag' | 'wave' }) {
  const paths = {
    swirl: "M10 10 Q20 5, 30 10 T50 10 Q60 15, 50 25 T30 40 Q20 45, 10 40",
    zigzag: "M10 30 L20 10 L30 30 L40 10 L50 30 L60 10",
    wave: "M5 25 Q15 10, 25 25 T45 25 T65 25"
  };

  return (
    <svg
      className={`absolute ${className} pointer-events-none opacity-20`}
      width="70"
      height="50"
      viewBox="0 0 70 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={paths[type]}
        stroke="url(#doodleGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient id="doodleGrad">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

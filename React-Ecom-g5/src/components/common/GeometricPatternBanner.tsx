import React from 'react';

export interface GeometricPatternProps {
  className?: string;
}

/**
 * GeometricPatternBanner
 * Morphing Assembly Animation:
 * 16 single-colored solid squares.
 * They fly in to form a Large Square, break apart, 
 * then fly in to form a Large Triangle, break apart, and loop.
 */
export const GeometricPatternBanner: React.FC<GeometricPatternProps> = ({
  className = '',
}) => {
  const pureWhite = '#FFFFFF';

  const S = 28; // Size of each small square
  const h = S / 2;

  // 16 Solid Squares Configuration
  // sq: [x, y] offsets for forming the 4x4 Square
  // tr: [x, y] offsets for forming the Triangle
  const tiles = [
    // --- Top area of Triangle / Row 1 of Square ---
    { sq: [-1.5, -1.5], tr: [0, -1.5],  color: '#38BDF8', dx1: -120, dy1: -100, r1: -360, dx2: 0,   dy2: -150, r2: 360,  delay: 0.1 },
    { sq: [-0.5, -1.5], tr: [-1, -0.5], color: '#FBBF24', dx1: -40,  dy1: -140, r1: 540,  dx2: -80, dy2: -100, r2: -360, delay: 0.2 },
    { sq: [0.5, -1.5],  tr: [0, -0.5],  color: '#F472B6', dx1: 60,   dy1: -110, r1: -540, dx2: 0,   dy2: -100, r2: 720,  delay: 0.1 },
    { sq: [1.5, -1.5],  tr: [1, -0.5],  color: '#34D399', dx1: 130,  dy1: -90,  r1: 360,  dx2: 80,  dy2: -100, r2: -540, delay: 0.3 },

    // --- Middle area of Triangle / Row 2 of Square ---
    { sq: [-1.5, -0.5], tr: [-2, 0.5],  color: '#A78BFA', dx1: -150, dy1: -30,  r1: -720, dx2: -140, dy2: 0,   r2: 540,  delay: 0.2 },
    { sq: [-0.5, -0.5], tr: [-1, 0.5],  color: '#0A39A6', dx1: -50,  dy1: -50,  r1: 360,  dx2: -60,  dy2: 20,  r2: -360, delay: 0 },
    { sq: [0.5, -0.5],  tr: [0, 0.5],   color: '#F43F5E', dx1: 80,   dy1: -40,  r1: -360, dx2: 0,   dy2: 20,  r2: 720,  delay: 0.1 },
    { sq: [1.5, -0.5],  tr: [1, 0.5],   color: '#10B981', dx1: 140,  dy1: -20,  r1: 720,  dx2: 60,  dy2: 20,  r2: -720, delay: 0.3 },

    // --- Lower area of Triangle / Row 3 of Square ---
    { sq: [-1.5, 0.5],  tr: [2, 0.5],   color: '#8B5CF6', dx1: -130, dy1: 60,   r1: 540,  dx2: 140,  dy2: 0,   r2: -360, delay: 0.4 },
    { sq: [-0.5, 0.5],  tr: [-3, 1.5],  color: '#F59E0B', dx1: -60,  dy1: 40,   r1: -540, dx2: -160, dy2: 100, r2: 540,  delay: 0.2 },
    { sq: [0.5, 0.5],   tr: [-2, 1.5],  color: '#0EA5E9', dx1: 50,   dy1: 50,   r1: 360,  dx2: -80,  dy2: 100, r2: -360, delay: 0.1 },
    { sq: [1.5, 0.5],   tr: [-1, 1.5],  color: '#E879F9', dx1: 130,  dy1: 80,   r1: -360, dx2: -40,  dy2: 100, r2: 720,  delay: 0.3 },

    // --- Base of Triangle / Row 4 of Square ---
    { sq: [-1.5, 1.5],  tr: [0, 1.5],   color: '#F472B6', dx1: -110, dy1: 140,  r1: 720,  dx2: 0,   dy2: 150, r2: -720, delay: 0.2 },
    { sq: [-0.5, 1.5],  tr: [1, 1.5],   color: '#38BDF8', dx1: -30,  dy1: 120,  r1: -720, dx2: 40,  dy2: 100, r2: 540,  delay: 0.1 },
    { sq: [0.5, 1.5],   tr: [2, 1.5],   color: '#34D399', dx1: 40,   dy1: 150,  r1: 360,  dx2: 80,  dy2: 100, r2: -540, delay: 0.2 },
    { sq: [1.5, 1.5],   tr: [3, 1.5],   color: '#FBBF24', dx1: 120,  dy1: 110,  r1: -540, dx2: 160,  dy2: 100, r2: 360,  delay: 0.4 }
  ];

  return (
    <div className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}>
      
      <style>{`
        /* 
          Morphing Assembly Animation:
          0%   -> Scattered State 1 (Invisible)
          20%  -> Assemble into Square (Hold till 35%)
          50%  -> Break apart into Scattered State 2 (Invisible)
          70%  -> Assemble into Triangle (Hold till 85%)
          100% -> Break apart back to Scattered State 1
        */
        @keyframes morph-assemble {
          0% {
            transform: translate(calc(var(--sqX) + var(--dx1)), calc(var(--sqY) + var(--dy1))) rotate(var(--r1)) scale(0.2);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          20%, 35% {
            transform: translate(var(--sqX), var(--sqY)) rotate(0deg) scale(1);
            opacity: 1;
          }
          45% {
            transform: translate(calc(var(--trX) + var(--dx2)), calc(var(--trY) + var(--dy2))) rotate(var(--r2)) scale(0.2);
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          70%, 85% {
            transform: translate(var(--trX), var(--trY)) rotate(0deg) scale(1);
            opacity: 1;
          }
          95%, 100% {
            transform: translate(calc(var(--sqX) + var(--dx1)), calc(var(--sqY) + var(--dy1))) rotate(var(--r1)) scale(0.2);
            opacity: 0;
          }
        }
        
        .anim-morph-tile {
          animation: morph-assemble 14s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          animation-fill-mode: both;
        }
      `}</style>

      <svg
        viewBox="0 0 370 230"
        className="w-full h-full object-contain"
        shapeRendering="crispEdges" /* Prevents gaps when blocks are grouped */
      >
        {/* Faint Background Rings */}
        <g stroke={pureWhite} fill="none">
          <circle cx="185" cy="115" r="140" strokeOpacity="0.15" strokeWidth="2" />
          <circle cx="185" cy="115" r="95" strokeOpacity="0.15" strokeWidth="2" />
          <circle cx="185" cy="115" r="50" strokeOpacity="0.10" strokeWidth="1.5" />
        </g>

        {/* Center everything in the SVG (185, 115) */}
        <g transform="translate(185, 115)">
          {tiles.map((tile, index) => (
            
            <g 
              key={index}
              className="anim-morph-tile"
              style={{
                '--sqX': `${tile.sq[0] * S}px`,
                '--sqY': `${tile.sq[1] * S}px`,
                '--trX': `${tile.tr[0] * S}px`,
                '--trY': `${tile.tr[1] * S}px`,
                '--dx1': `${tile.dx1}px`,
                '--dy1': `${tile.dy1}px`,
                '--r1': `${tile.r1}deg`,
                '--dx2': `${tile.dx2}px`,
                '--dy2': `${tile.dy2}px`,
                '--r2': `${tile.r2}deg`,
                animationDelay: `${tile.delay}s`,
              } as React.CSSProperties}
            >
              {/* Solid Single-Colored Square (Width and Height + 0.5 to remove gaps) */}
              <rect 
                x={-h} 
                y={-h} 
                width={S + 0.5} 
                height={S + 0.5} 
                fill={tile.color} 
                opacity="0.95"
              />
            </g>

          ))}
        </g>
      </svg>
    </div>
  );
};
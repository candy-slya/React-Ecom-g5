import React from 'react';

export interface GeometricPatternProps {
  className?: string;
}

/**
 * GeometricPatternBanner
 * Recreates the exact Bauhaus modular geometric pattern from the user's mockup:
 * - 4 columns x 3 rows of geometric tiles (Arch/Dome, Quarter Circles, Full Circles)
 * - Faint concentric outline rings in the background
 * - Seamless integration without any card border
 * - Exact color matching: Pure White (#FFFFFF), Sky Blue (#38BDF8), Ice Blue (#BAE6FD), Light Cyan (#7DD3FC), and Royal Blue (#0A39A6)
 */
export const GeometricPatternBanner: React.FC<GeometricPatternProps> = ({
  className = '',
}) => {
  const S = 66; // Tile size
  const startX = 46;
  const startY = 16;

  // Colors matching the mockup
  const white = '#FFFFFF';
  const cyan = '#38BDF8';
  const lightBlue = '#7DD3FC';
  const iceBlue = '#BAE6FD';
  const oceanBlue = '#0284C7';
  const royalBlue = '#0A39A6';

  const x0 = startX + 0 * S;
  const x1 = startX + 1 * S;
  const x2 = startX + 2 * S;
  const x3 = startX + 3 * S;

  const y0 = startY + 0 * S;
  const y1 = startY + 1 * S;
  const y2 = startY + 2 * S;

  return (
    <div className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 370 230"
        className="w-full h-full object-contain"
        shapeRendering="geometricPrecision"
      >
        {/* Background Concentric Outline Rings */}
        <g stroke="white" fill="none">
          <circle cx="255" cy="180" r="150" strokeOpacity="0.14" strokeWidth="2.5" />
          <circle cx="255" cy="180" r="100" strokeOpacity="0.14" strokeWidth="2.5" />
          <circle cx="255" cy="180" r="50" strokeOpacity="0.10" strokeWidth="2" />
        </g>

        {/* 4x3 Bauhaus Geometric Tiles */}
        <g>
          {/* ----------------- ROW 0 ----------------- */}
          {/* [0, 0] Arch / Dome shape in White */}
          <path
            d={`M ${x0} ${y0 + S} L ${x0} ${y0 + S / 2} A ${S / 2} ${S / 2} 0 0 1 ${x0 + S} ${y0 + S / 2} L ${x0 + S} ${y0 + S} Z`}
            fill={white}
          />

          {/* [1, 0] Quarter circle in Sky Blue (corner at bottom-left) */}
          <path
            d={`M ${x1} ${y0 + S} L ${x1 + S} ${y0 + S} A ${S} ${S} 0 0 0 ${x1} ${y0} Z`}
            fill={cyan}
          />

          {/* [2, 0] Full solid White circle */}
          <circle cx={x2 + S / 2} cy={y0 + S / 2} r={S / 2} fill={white} />

          {/* [3, 0] Quarter circle in Ocean Blue (corner at top-left) */}
          <path
            d={`M ${x3} ${y0} L ${x3 + S} ${y0} A ${S} ${S} 0 0 1 ${x3} ${y0 + S} Z`}
            fill={oceanBlue}
          />

          {/* ----------------- ROW 1 ----------------- */}
          {/* [0, 1] Full solid Cyan circle */}
          <circle cx={x0 + S / 2} cy={y1 + S / 2} r={S / 2} fill={cyan} />

          {/* [1, 1] Quarter circle in White (corner at top-left) */}
          <path
            d={`M ${x1} ${y1} L ${x1 + S} ${y1} A ${S} ${S} 0 0 1 ${x1} ${y1 + S} Z`}
            fill={white}
          />

          {/* [2, 1] Quarter circle in Royal Blue (corner at bottom-left) */}
          <path
            d={`M ${x2} ${y1 + S} L ${x2 + S} ${y1 + S} A ${S} ${S} 0 0 0 ${x2} ${y1} Z`}
            fill={royalBlue}
          />

          {/* [3, 1] Quarter circle in White (corner at top-right) */}
          <path
            d={`M ${x3 + S} ${y1} L ${x3} ${y1} A ${S} ${S} 0 0 0 ${x3 + S} ${y1 + S} Z`}
            fill={white}
          />

          {/* ----------------- ROW 2 ----------------- */}
          {/* [0, 2] Quarter circle in Ice Blue (corner at bottom-left) */}
          <path
            d={`M ${x0} ${y2 + S} L ${x0 + S} ${y2 + S} A ${S} ${S} 0 0 0 ${x0} ${y2} Z`}
            fill={iceBlue}
          />

          {/* [1, 2] Quarter circle in Cyan (corner at top-left) */}
          <path
            d={`M ${x1} ${y2} L ${x1 + S} ${y2} A ${S} ${S} 0 0 1 ${x1} ${y2 + S} Z`}
            fill={cyan}
          />

          {/* [2, 2] Full solid Light Blue circle */}
          <circle cx={x2 + S / 2} cy={y2 + S / 2} r={S / 2} fill={lightBlue} />

          {/* [3, 2] Quarter circle in White (corner at bottom-right) */}
          <path
            d={`M ${x3 + S} ${y2 + S} L ${x3} ${y2 + S} A ${S} ${S} 0 0 1 ${x3 + S} ${y2} Z`}
            fill={white}
          />
        </g>
      </svg>
    </div>
  );
};

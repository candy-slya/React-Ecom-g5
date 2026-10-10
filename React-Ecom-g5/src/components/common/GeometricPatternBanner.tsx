import React from "react";

export interface GeometricPatternProps {
  className?: string;
}

/**
 * GeometricPatternBanner
 * HTML hero slider ရဲ့ ညာဘက်အခြမ်းက
 * "6 + Cart" animated logo mark + floating particles + soft glow.
 */
export const GeometricPatternBanner: React.FC<GeometricPatternProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
    >
      {/* ===================== LOCAL KEYFRAMES ===================== */}
      <style>{`
        /* ---- Stroke draw-in for the "6" ---- */
        @keyframes draw-six {
          0%   { stroke-dashoffset: var(--len); opacity: 0; }
          5%   { opacity: 1; }
          45%  { stroke-dashoffset: 0; opacity: 1; }
          75%  { stroke-dashoffset: 0; opacity: 1; }
          95%  { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
          100% { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
        }

        /* ---- Stroke draw-in for the cart basket ---- */
        @keyframes draw-cart {
          0%, 25%  { stroke-dashoffset: var(--len); opacity: 0; }
          30%      { opacity: 1; }
          55%      { stroke-dashoffset: 0; opacity: 1; }
          75%      { stroke-dashoffset: 0; opacity: 1; }
          95%      { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
          100%     { stroke-dashoffset: calc(var(--len) * -1); opacity: 0; }
        }

        /* ---- Wheel pop ---- */
        @keyframes pop-wheel {
          0%, 50%  { transform: scale(0); opacity: 0; }
          60%      { transform: scale(1.3); opacity: 1; }
          68%      { transform: scale(1); opacity: 1; }
          75%      { transform: scale(1); opacity: 1; }
          85%      { transform: scale(1); opacity: 1; }
          95%,100% { transform: scale(0); opacity: 0; }
        }

        /* ---- Soft glow pulse behind the logo ---- */
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50%      { opacity: 0.7; transform: scale(1.1); }
        }

        /* ---- Floating particles ---- */
        @keyframes float-particle {
          0% {
            transform: translate(0, 0) scale(0.6);
            opacity: 0;
          }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% {
            transform: translate(var(--p-tx, 20px), var(--p-ty, -40px)) scale(1.2);
            opacity: 0;
          }
        }

        .gp-path-six {
          stroke-dasharray: var(--len);
          stroke-dashoffset: var(--len);
          animation: draw-six 6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        .gp-path-cart {
          stroke-dasharray: var(--len);
          stroke-dashoffset: var(--len);
          animation: draw-cart 6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        .gp-wheel {
          transform-origin: center;
          transform-box: fill-box;
          animation: pop-wheel 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
        .gp-logo-hover:hover .gp-path-six,
        .gp-logo-hover:hover .gp-path-cart,
        .gp-logo-hover:hover .gp-wheel {
          animation-play-state: paused;
        }
        .gp-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .gp-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: float-particle var(--p-dur, 3s) ease-in-out infinite;
          animation-delay: var(--p-delay, 0s);
          box-shadow: 0 0 8px currentColor;
        }
      `}</style>

      {/* ===================== PARTICLES LAYER ===================== */}
      <div
        className="gp-particle bg-[#EC4899] text-[#EC4899] w-2 h-2 -top-4 -left-4"
        style={
          {
            "--p-tx": "-25px",
            "--p-ty": "-35px",
            "--p-dur": "3.2s",
            "--p-delay": "0s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#8B5CF6] text-[#8B5CF6] w-2.5 h-2.5 top-2 -right-6"
        style={
          {
            "--p-tx": "30px",
            "--p-ty": "-20px",
            "--p-dur": "2.8s",
            "--p-delay": "0.4s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#38BDF8] text-[#38BDF8] w-1.5 h-1.5 -bottom-2 -left-6"
        style={
          {
            "--p-tx": "-30px",
            "--p-ty": "25px",
            "--p-dur": "3.5s",
            "--p-delay": "0.8s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#F472B6] text-[#F472B6] w-2 h-2 bottom-0 -right-8"
        style={
          {
            "--p-tx": "35px",
            "--p-ty": "30px",
            "--p-dur": "2.5s",
            "--p-delay": "0.2s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#A78BFA] text-[#A78BFA] w-3 h-3 -top-8 left-12"
        style={
          {
            "--p-tx": "10px",
            "--p-ty": "-45px",
            "--p-dur": "3.8s",
            "--p-delay": "1.1s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#EC4899] text-[#EC4899] w-1.5 h-1.5 -bottom-8 left-8"
        style={
          {
            "--p-tx": "-15px",
            "--p-ty": "40px",
            "--p-dur": "3.1s",
            "--p-delay": "0.6s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#6366F1] text-[#6366F1] w-2 h-2 top-12 -left-10"
        style={
          {
            "--p-tx": "-40px",
            "--p-ty": "-10px",
            "--p-dur": "2.9s",
            "--p-delay": "1.4s",
          } as React.CSSProperties
        }
      />
      <div
        className="gp-particle bg-[#C084FC] text-[#C084FC] w-2.5 h-2.5 top-16 -right-10"
        style={
          {
            "--p-tx": "40px",
            "--p-ty": "15px",
            "--p-dur": "3.4s",
            "--p-delay": "0.9s",
          } as React.CSSProperties
        }
      />

      {/* ===================== LOGO CONTAINER ===================== */}
      <div
        className="gp-logo-hover inline-flex p-[3px] rounded-full relative z-10"
        style={{
          background:
            "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)",
          boxShadow:
            "0 0 50px rgba(139, 92, 246, 0.45), 0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div className="relative flex items-center justify-center p-8 rounded-full bg-[#0F172A]">
          {/* Soft glow behind */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none gp-glow"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",
            }}
          />

          {/* Animated Logo SVG */}
          <svg viewBox="0 0 28 28" fill="none" className="relative w-24 h-24">
            <defs>
              <linearGradient
                id="cartGradientAnim"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Number 6 Curve */}
            <path
              className="gp-path-six"
              style={{ "--len": 60 } as React.CSSProperties}
              d="M17 5 C 10 5, 6 10, 6 17 C 6 20.5, 8.5 23, 12 23 C 15.5 23, 18 20.5, 18 17 C 18 13.5, 15.5 11, 12 11 C 9.5 11, 7.5 12.5, 6.5 15"
              stroke="url(#cartGradientAnim)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Cart Basket */}
            <path
              className="gp-path-cart"
              style={{ "--len": 20 } as React.CSSProperties}
              d="M16 11 L 24 11 L 21.5 18 L 13.5 18"
              stroke="url(#cartGradientAnim)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Wheels */}
            <circle
              className="gp-wheel"
              style={{ animationDelay: "0s" }}
              cx="12"
              cy="25"
              r="2"
              fill="#ec4899"
            />
            <circle
              className="gp-wheel"
              style={{ animationDelay: "0.08s" }}
              cx="20"
              cy="25"
              r="2"
              fill="#ec4899"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface FlawsomeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

export const FlawsomeLogo: React.FC<FlawsomeLogoProps> = ({
  className = '',
  size = 'lg',
  variant = 'light',
}) => {
  const sizeClasses = {
    sm: 'w-28 h-auto',
    md: 'w-44 h-auto',
    lg: 'w-60 sm:w-72 h-auto',
    xl: 'w-80 sm:w-96 h-auto',
  }[size];

  const textColor = variant === 'light' ? 'text-white' : 'text-zinc-900';
  const subtitleColor = variant === 'light' ? 'text-purple-200' : 'text-purple-900';

  return (
    <div className={`flex flex-col items-center text-center select-none ${sizeClasses} ${className}`}>
      {/* 1. Vector Emblem: Exact Crescent Moon & Silhouette Dancer */}
      <div className="w-full aspect-[1/1.12] relative flex items-center justify-center">
        <svg
          viewBox="0 0 340 380"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Silver-Lavender Moon Gradient */}
            <linearGradient id="flawsomeMoonGradient" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#EADFF4" />
              <stop offset="50%" stopColor="#D3C3E3" />
              <stop offset="100%" stopColor="#BBA7CE" />
            </linearGradient>

            {/* Deep Violet Plum Dancer Gradient */}
            <linearGradient id="flawsomeDancerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6A2773" />
              <stop offset="50%" stopColor="#4A1853" />
              <stop offset="100%" stopColor="#2E0B36" />
            </linearGradient>

            {/* Secondary Plume Shading Gradient */}
            <linearGradient id="flawsomePlumeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B3386" />
              <stop offset="100%" stopColor="#3B1244" />
            </linearGradient>
          </defs>

          {/* CRESCENT MOON */}
          <path
            d="M 162,12 
               C 80,50 32,135 68,220 
               C 92,275 155,310 238,272 
               C 172,298 102,268 82,212 
               C 52,132 98,62 162,12 Z"
            fill="url(#flawsomeMoonGradient)"
          />

          {/* DANCER SILHOUETTE */}
          <g fill="url(#flawsomeDancerGradient)">
            {/* Right Arm touching Crescent Moon top tip */}
            <path
              d="M 162,12 
                 C 158,28 150,58 143,84 
                 C 152,75 165,68 180,63 
                 C 205,55 232,68 242,72 
                 C 234,80 208,86 186,94 
                 C 168,100 155,90 145,80 
                 C 138,68 132,50 138,30 
                 C 145,18 156,12 162,12 Z"
            />

            {/* Head Profile & Back arch */}
            <path
              d="M 152,62 
                 C 158,50 172,45 182,48 
                 C 192,52 195,64 188,70 
                 C 180,75 164,72 152,62 Z"
            />

            {/* Torso & Bust */}
            <path
              d="M 138,80 
                 C 124,102 118,128 122,154 
                 C 128,138 140,122 150,106 
                 C 156,95 152,84 138,80 Z"
            />

            {/* 4 Layered Dress Feather Plumes */}
            {/* Outer Plume 1 */}
            <path
              d="M 122,145 
                 C 142,175 178,218 230,248 
                 C 210,228 178,190 148,155 Z"
              fill="url(#flawsomePlumeGradient)"
            />

            {/* Plume 2 */}
            <path
              d="M 122,150 
                 C 138,190 172,245 225,290 
                 C 202,258 168,205 140,162 Z"
            />

            {/* Plume 3 */}
            <path
              d="M 120,156 
                 C 132,200 160,262 210,312 
                 C 190,272 158,215 132,168 Z"
              fill="url(#flawsomePlumeGradient)"
            />

            {/* Tail Plume 4 (Bottom-most trailing feather) */}
            <path
              d="M 118,162 
                 C 126,208 148,280 188,335 
                 C 174,292 148,228 125,172 Z"
            />
          </g>
        </svg>
      </div>

      {/* 2. Primary Title: FLAWSOME */}
      <h1
        className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.24em] uppercase ${textColor} mt-1`}
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        FLAWSOME
      </h1>

      {/* 3. Subtitle: Flawlessly Awesome */}
      <p
        className={`text-xl sm:text-2xl md:text-3xl font-normal ${subtitleColor} mt-0.5`}
        style={{ fontFamily: "'Great Vibes', 'Playfair Display', cursive, serif" }}
      >
        Flawlessly Awesome
      </p>
    </div>
  );
};


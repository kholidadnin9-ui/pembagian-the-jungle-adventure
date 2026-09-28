import React from 'react';

// Leaf decorative SVG for wooden board corners & accents
export const JungleLeaf: React.FC<{
  className?: string;
  variant?: 'left' | 'right' | 'top';
  size?: number;
}> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 34C10 20 22 10 36 6C36 20 26 32 12 36C8 37 6 34 6 34Z"
        fill="#22c55e"
      />
      <path
        d="M10 32C13 22 23 14 34 8C33 19 24 28 14 32C11 33 10 32 10 32Z"
        fill="#4ade80"
      />
      <path
        d="M6 34C18 24 28 15 36 6"
        stroke="#15803d"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 26C20 24 24 21 26 19"
        stroke="#16a34a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Tropical Flower icon
export const JungleFlower: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Petals */}
      <circle cx="16" cy="9" r="6" fill="#fbbf24" />
      <circle cx="23" cy="16" r="6" fill="#f59e0b" />
      <circle cx="16" cy="23" r="6" fill="#fbbf24" />
      <circle cx="9" cy="16" r="6" fill="#f59e0b" />
      {/* Center */}
      <circle cx="16" cy="16" r="4.5" fill="#ef4444" />
      <circle cx="16" cy="16" r="2.5" fill="#fef08a" />
    </svg>
  );
};

// Wooden Board Frame Component
export const WoodenFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  hasLeaves?: boolean;
  innerClassName?: string;
}> = ({ children, className = '', hasLeaves = true, innerClassName = '' }) => {
  return (
    <div
      className={`relative rounded-3xl p-3 md:p-4 bg-gradient-to-b from-[#8B4513] via-[#6a340b] to-[#4a2305] shadow-[0_12px_28px_rgba(0,0,0,0.5),inset_0_4px_6px_rgba(255,255,255,0.25)] border-4 border-[#3c1c04] ${className}`}
    >
      {/* Decorative leaf accents on corners */}
      {hasLeaves && (
        <>
          <div className="absolute -top-3 -left-3 pointer-events-none drop-shadow-md z-10 rotate-[-20deg]">
            <JungleLeaf size={38} />
          </div>
          <div className="absolute -top-3 -right-3 pointer-events-none drop-shadow-md z-10 rotate-[70deg]">
            <JungleLeaf size={38} />
          </div>
          <div className="absolute -bottom-3 -left-3 pointer-events-none drop-shadow-md z-10 rotate-[-110deg]">
            <JungleLeaf size={36} />
          </div>
          <div className="absolute -bottom-3 -right-3 pointer-events-none drop-shadow-md z-10 rotate-[160deg]">
            <JungleLeaf size={36} />
          </div>
        </>
      )}

      {/* Inner parchment/plank surface */}
      <div
        className={`relative rounded-2xl bg-gradient-to-b from-[#fff3dc] via-[#fce4be] to-[#ebd0a3] p-5 md:p-7 border-2 border-[#d4a373] shadow-[inset_0_3px_8px_rgba(100,50,0,0.2)] ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

// Wooden Ribbon Header for Modals and Titles
export const WoodRibbon: React.FC<{
  title: string;
  subtitle?: string;
  className?: string;
}> = ({ title, className = '' }) => {
  return (
    <div className={`relative inline-block mx-auto ${className}`}>
      {/* Ribbon Banner */}
      <div className="px-6 py-2 md:px-8 md:py-2.5 rounded-2xl bg-gradient-to-b from-[#a0522d] via-[#853f1a] to-[#5c2b0e] border-3 border-[#fef08a] shadow-[0_6px_12px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.3)]">
        <h2 className="text-xl md:text-2xl font-black text-amber-100 tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] text-center font-display">
          {title}
        </h2>
      </div>
    </div>
  );
};

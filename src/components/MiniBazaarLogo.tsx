import React from 'react';
import { useStore } from '../context/StoreContext';

interface MiniBazaarLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'monogram';
  textColor?: string;
  showTagline?: boolean;
  inverted?: boolean;
}

export const MiniBazaarLogo: React.FC<MiniBazaarLogoProps> = ({
  className = 'h-11',
  variant = 'compact',
  textColor = '#2F2B28',
  showTagline = false,
  inverted = false,
}) => {
  // Try to access storeSettings for custom uploaded logo
  let customLogoUrl: string | undefined;
  try {
    const store = useStore();
    customLogoUrl = store.storeSettings.custom_logo_url;
  } catch (e) {
    customLogoUrl = undefined;
  }

  // Render Emblem / Icon
  const renderEmblem = (sizeClass = 'w-10 h-10') => {
    if (customLogoUrl) {
      return (
        <div className={`relative ${sizeClass} shrink-0 rounded-full overflow-hidden border border-[#C6A36A] p-0.5 bg-white shadow-2xs`}>
          <img
            src={customLogoUrl}
            alt="شعار ميني بازار"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      );
    }

    return (
      <div className={`relative ${sizeClass} shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="45" stroke="#C6A36A" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="41" stroke="#E7D4BC" strokeWidth="0.8" strokeDasharray="2 3" />
          <path d="M36 68L40 45C40 43 42 41 44 41H56C58 41 60 43 60 45L64 68C64 70 62 72 60 72H40C38 72 36 70 36 68Z" fill="#F5E9D8" stroke="#AE8951" strokeWidth="1.8" />
          <path d="M43 41V35C43 31 46 28 50 28C54 28 57 31 57 35V41" stroke="#C6A36A" strokeWidth="2" strokeLinecap="round" />
          <rect x="47.5" y="47" width="5" height="7" rx="1" fill="#C6A36A" stroke="#8A7465" strokeWidth="0.8" />
          <path d="M68 34C73 37 77 44 76 52C72 49 70 42 68 34Z" fill="#C6A36A" opacity="0.9" />
        </svg>
      </div>
    );
  };

  if (variant === 'monogram') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem('w-12 h-12')}
      </div>
    );
  }

  // Compact Header / Main Nav Logo: Emblem + "ميني بازار" on one clean line with no tagline wrap
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap ${className}`}>
        {renderEmblem('w-10 h-10')}
        <div className="flex items-center gap-2 text-right">
          <span
            className={`text-xl sm:text-2xl font-bold font-heading tracking-tight leading-none ${
              inverted ? 'text-[#F5E9D8]' : 'text-[#6F584A]'
            }`}
          >
            ميني بازار
          </span>
          <span className="hidden sm:inline text-[11px] font-semibold tracking-wider text-[#C6A36A] font-sans uppercase">
            Mini Bazaar
          </span>
        </div>
      </div>
    );
  }

  // Full Footer or Splash Brand Logo
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {renderEmblem('w-12 h-12')}
      <div className="flex flex-col text-right">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold font-heading tracking-tight ${
              inverted ? 'text-[#F5E9D8]' : 'text-[#6F584A]'
            }`}
          >
            ميني بازار
          </span>
          <span className="text-xs font-semibold tracking-wider text-[#C6A36A] font-sans uppercase">
            Mini Bazaar
          </span>
        </div>
      </div>
    </div>
  );
};

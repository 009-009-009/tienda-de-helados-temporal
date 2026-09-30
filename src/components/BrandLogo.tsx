import { useState, useEffect } from 'react';
import { getCustomLogo, OFFICIAL_LOGO_KEY } from '../utils/imageStore';
import { removeWhiteBackground } from '../utils/removeBackground';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function BrandLogo({ className = '', size = 'md', showSubtitle = false }: BrandLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCustomLogo().then(async (src) => {
      if (!isMounted || !src) {
        if (isMounted) setLogoSrc(null);
        return;
      }
      const transparentSrc = await removeWhiteBackground(src);
      if (isMounted) setLogoSrc(transparentSrc);
    });

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.fileName === OFFICIAL_LOGO_KEY) {
        getCustomLogo().then(async (src) => {
          if (!isMounted || !src) {
            if (isMounted) setLogoSrc(null);
            return;
          }
          const transparentSrc = await removeWhiteBackground(src);
          if (isMounted) setLogoSrc(transparentSrc);
        });
      }
    };

    window.addEventListener('catalog-image-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('catalog-image-updated', handleUpdate);
    };
  }, []);

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl sm:text-5xl',
  };

  if (logoSrc) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={logoSrc}
          alt="Helados JOLY"
          className={`${sizeClasses[size]} w-auto object-contain max-w-[200px] select-none`}
        />
        {showSubtitle && (
          <span className="hidden sm:inline-block text-xs font-bold text-slate-700 pl-2 border-l border-slate-300">
            Tienda para negocios · <span className="text-slate-900 font-extrabold">HELADOS PANDA</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-baseline select-none">
        <span className={`font-heading font-black tracking-tighter text-[#28AEE4] ${textSizes[size]}`}>
          JO
        </span>
        <span className={`font-heading font-black tracking-tighter text-[#E31B23] ${textSizes[size]}`}>
          LY
        </span>
      </div>
      {showSubtitle && (
        <span className="hidden sm:inline-block text-xs font-bold text-slate-700 pl-1.5 border-l border-slate-300">
          Tienda para negocios · <span className="text-slate-900 font-extrabold">HELADOS PANDA</span>
        </span>
      )}
    </div>
  );
}

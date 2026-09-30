import { useState, useEffect } from 'react';
import { Product } from '../types';
import { getCustomImage } from '../utils/imageStore';
import { removeWhiteBackground } from '../utils/removeBackground';

interface ProductImageProps {
  product: Product;
  className?: string;
}

export function ProductImage({ product, className = '' }: ProductImageProps) {
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);

  const rawFileName = product.imageFileName || '';

  // Check for custom stored image first
  useEffect(() => {
    let isMounted = true;
    if (rawFileName) {
      getCustomImage(rawFileName).then((src) => {
        if (isMounted && src) {
          setCustomSrc(src);
          setHasError(false);
        }
      });
    }

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.fileName === rawFileName) {
        getCustomImage(rawFileName).then((src) => {
          if (isMounted) {
            setCustomSrc(src);
            setHasError(false);
          }
        });
      }
    };

    window.addEventListener('catalog-image-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('catalog-image-updated', handleUpdate);
    };
  }, [rawFileName]);

  const currentSrc = customSrc || (!attemptedFallback && rawFileName.includes('ñ')
    ? `/imagenes/${rawFileName}`
    : `/imagenes/${rawFileName.replace('ñ', 'n')}`);

  // Automatically remove white background so the product stamps cleanly onto the blue card
  useEffect(() => {
    let isMounted = true;
    if (!currentSrc || hasError) {
      setDisplaySrc(null);
      return;
    }

    setDisplaySrc(currentSrc);
    removeWhiteBackground(currentSrc).then((cleaned) => {
      if (isMounted && cleaned) {
        setDisplaySrc(cleaned);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSrc, hasError]);

  const handleError = () => {
    if (customSrc) {
      setHasError(true);
      return;
    }
    if (!attemptedFallback && rawFileName.includes('ñ')) {
      setAttemptedFallback(true);
    } else {
      setHasError(true);
    }
  };

  // Category specific color palette for the placeholder fallback
  const getCategoryStyles = () => {
    switch (product.categoryId) {
      case 'cassatas-1l':
        return {
          bg: 'from-sky-50 to-blue-100',
          accent: '#28AEE4',
          label: '1 Litro',
        };
      case 'cassatas-1-8l':
        return {
          bg: 'from-amber-50 to-orange-100',
          accent: '#0284c7',
          label: '1,8 Litros',
        };
      case 'helados-individuales':
        return {
          bg: 'from-rose-50 to-red-100',
          accent: '#E31B23',
          label: 'Paleta Individual',
        };
      case 'postres-especiales':
        return {
          bg: 'from-emerald-50 to-teal-100',
          accent: '#0d9488',
          label: 'Postre Especial',
        };
      case 'chocante-copas':
        return {
          bg: 'from-purple-50 to-indigo-100',
          accent: '#7c3aed',
          label: 'Chocante / Copas',
        };
      default:
        return {
          bg: 'from-slate-50 to-slate-100',
          accent: '#28AEE4',
          label: 'Helado',
        };
    }
  };

  const catStyle = getCategoryStyles();

  const isPaletaCrema =
    product.id === 'ind-paleta-crema' ||
    product.name.toLowerCase().includes('paleta crema') ||
    product.imageFileName?.toLowerCase().includes('paleta-crema');

  if (rawFileName && !hasError) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#38bdf8] via-[#1aa4e3] to-[#0284c7] ${className}`}>
        <img
          src={displaySrc || currentSrc}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={handleError}
          className={`max-h-full max-w-full object-contain p-1.5 sm:p-2 transition-transform duration-200 hover:scale-105 ${
            isPaletaCrema
              ? '[filter:drop-shadow(0_0_2px_rgba(0,0,0,0.95))_drop-shadow(0_0_5px_rgba(0,0,0,0.7))_drop-shadow(0_6px_12px_rgba(0,0,0,0.35))]'
              : '[filter:drop-shadow(0_0_1.5px_rgba(0,0,0,0.85))_drop-shadow(0_4px_10px_rgba(0,0,0,0.22))]'
          }`}
          loading="lazy"
        />
      </div>
    );
  }

  // Visual fallback for products pending image upload
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#38bdf8] via-[#1aa4e3] to-[#0284c7] overflow-hidden select-none ${className}`}
      title={`${product.name} - Imagen oficial en preparación`}
    >
      {/* Background soft geometric pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`pattern-${product.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#pattern-${product.id})`} />
        </svg>
      </div>

      {/* Styled Ice Cream Box Icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-xs shadow-xs border border-white/40 flex items-center justify-center mb-1.5 text-slate-700">
          {product.categoryId.startsWith('cassatas') ? (
            // Tub / Container SVG
            <svg className="w-7 h-7 text-[#0284c7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.8H7.5A2 2 0 0 1 5.5 19L4 8z" />
              <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V6z" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          ) : product.categoryId === 'chocante-copas' ? (
            // Cup / Cone SVG
            <svg className="w-7 h-7 text-[#E31B23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3h10a4 4 0 0 1 4 4v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V7a4 4 0 0 1 4-4z" />
              <line x1="12" y1="14" x2="12" y2="21" />
              <line x1="8" y1="21" x2="16" y2="21" />
            </svg>
          ) : (
            // Popsicle SVG
            <svg className="w-7 h-7 text-[#E31B23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C9 2 7 4 7 7v6c0 1.5 1 3 2.5 3.7V20a1.5 1.5 0 0 0 3 0v-3.3C14 16 15 14.5 15 13V7c0-3-2-5-3-5z" />
            </svg>
          )}
        </div>

        <span className="text-[11px] font-bold tracking-wide text-white uppercase drop-shadow-xs">
          {catStyle.label}
        </span>
      </div>

      <span className="mt-1 text-[10px] text-sky-100 font-medium drop-shadow-xs">
        JOLY Oficial
      </span>
    </div>
  );
}

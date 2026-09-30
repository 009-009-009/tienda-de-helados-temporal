import { useState } from 'react';
import { ShoppingBag, ArrowLeft, Camera, Share2, Check } from 'lucide-react';
import { CheckoutStep } from '../types';
import { formatCLP } from '../utils/format';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentStep: CheckoutStep;
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onNavigateToCatalog: () => void;
  onOpenImageManager?: () => void;
}

export function Header({
  currentStep,
  cartItemCount,
  cartTotal,
  onOpenCart,
  onNavigateToCatalog,
  onOpenImageManager,
}: HeaderProps) {
  const isCatalog = currentStep === 'catalog';
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Catálogo Helados JOLY & PANDA',
          text: '¡Haz tu pedido mayorista antes de las 11:00 AM para despacho hoy!',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-900/10 shadow-xs">
      {/* 11:00 AM Dispatch Alert Top Ticker */}
      <div className="bg-slate-950 text-white text-[11px] sm:text-xs py-1 px-3 font-medium text-center tracking-tight flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#EEFF00] shrink-0 animate-pulse" />
        <span className="truncate">
          ⏰ <strong className="text-[#EEFF00] font-bold">¡Haga su pedido antes de las 11:00 AM</strong> para despacho tempranito el mismo día! · <strong>HELADOS PANDA & JOLY</strong>
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          {!isCatalog && (
            <button
              type="button"
              onClick={onNavigateToCatalog}
              aria-label="Volver al catálogo"
              className="min-h-[40px] min-w-[40px] -ml-1 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="flex items-center text-left group cursor-pointer"
          >
            <BrandLogo size="sm" showSubtitle={true} />
          </button>
        </div>

        {/* Zone 2: Step Indicator in checkout mode or clean text */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          {currentStep === 'catalog' && (
            <span className="text-slate-600">Venta mayorista por caja · Despacho y WhatsApp</span>
          )}
          {currentStep === 'cart' && (
            <span className="text-[#28AEE4] font-semibold">Paso 1: Revisar Pedido</span>
          )}
          {currentStep === 'customer' && (
            <span className="text-[#28AEE4] font-semibold">Paso 2: Datos del Cliente</span>
          )}
          {currentStep === 'invoice' && (
            <span className="text-[#28AEE4] font-semibold">Paso 3: Factura</span>
          )}
          {currentStep === 'review' && (
            <span className="text-[#28AEE4] font-semibold">Paso 4: Resumen Final</span>
          )}
        </div>

        {/* Zone 3: Primary Action / Cart Trigger, Admin Photos & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleShare}
            title="Compartir o copiar enlace oficial de la tienda"
            className="min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 bg-white"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#0284c7] shrink-0" />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>

          {onOpenImageManager && (
            <button
              type="button"
              onClick={onOpenImageManager}
              title="Administrar fotos de catálogo (subir imágenes oficiales)"
              className="min-h-[40px] px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 bg-white"
            >
              <Camera className="w-4 h-4 text-[#0284c7]" />
              <span className="hidden sm:inline">Fotos</span>
            </button>
          )}

          {currentStep === 'catalog' ? (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Ver carrito de compras"
              className="relative min-h-[44px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#28AEE4]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#E31B23] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="tabular-nums font-bold">
                {cartTotal > 0 ? formatCLP(cartTotal) : 'Ver Pedido'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateToCatalog}
              className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Catálogo
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

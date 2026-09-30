import { Product } from '../types';
import { formatCLP } from '../utils/format';
import { ProductImage } from './ProductImage';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (product: Product, newQuantity: number) => void;
}

export function ProductCard({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}: ProductCardProps) {
  const isInCart = quantityInCart > 0;

  return (
    <article
      className={`group flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        isInCart
          ? 'border-[#0284c7] shadow-md ring-2 ring-[#0284c7]/30'
          : 'border-amber-200/70 hover:border-amber-300'
      }`}
    >
      <div>
        {/* Product Image Slot: Vibrant cheerful blue container */}
        <div className="relative aspect-4/3 w-full bg-gradient-to-b from-[#38bdf8] via-[#1aa4e3] to-[#0284c7] border-b border-sky-300/40 overflow-hidden flex items-center justify-center">
          <ProductImage product={product} className="w-full h-full" />

          {isInCart && (
            <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 tabular-nums border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{quantityInCart} {quantityInCart === 1 ? 'caja' : 'cajas'}</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 bg-white">
          {/* Product Name */}
          <h3 className="font-heading font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.6rem]">
            {product.name}
          </h3>

          {/* Presentation (Caja de XX unidades) */}
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Caja de {product.unitsPerBox} unidades
          </p>

          {/* Price Block: Box price as primary, Unit price strictly as reference */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                {formatCLP(product.boxPrice)}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                / caja
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 tabular-nums">
              Referencia: {formatCLP(product.unitRefPrice)} c/u
            </p>
          </div>
        </div>
      </div>

      {/* Action Area: 44px minimum touch targets */}
      <div className="p-3.5 sm:p-4 pt-0">
        {!isInCart ? (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full min-h-[44px] px-3 py-2.5 bg-[#28AEE4] hover:bg-[#209bcc] active:bg-[#1a85b0] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar al pedido</span>
          </button>
        ) : (
          <div className="flex items-center justify-between bg-slate-100/90 rounded-xl p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => onUpdateQuantity(product, quantityInCart - 1)}
              aria-label={`Quitar una caja de ${product.name}`}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white text-slate-700 hover:text-[#E31B23] hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center px-2">
              <span className="text-sm font-bold text-slate-900 tabular-nums leading-none">
                {quantityInCart}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {quantityInCart === 1 ? 'caja' : 'cajas'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onUpdateQuantity(product, quantityInCart + 1)}
              aria-label={`Agregar una caja más de ${product.name}`}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#28AEE4] hover:bg-[#209bcc] text-white transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

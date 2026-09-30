import { useState } from 'react';
import { CartItem, Product } from '../types';
import { formatBoxCount, formatCLP } from '../utils/format';
import { Plus, Minus, Trash2, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { ProductImage } from './ProductImage';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (product: Product, quantity: number) => void;
  onClearCart: () => void;
  onBackToCatalog: () => void;
  onProceedToCustomer: () => void;
}

export function CartView({
  cartItems,
  onUpdateQuantity,
  onClearCart,
  onBackToCatalog,
  onProceedToCustomer,
}: CartViewProps) {
  const [showClearModal, setShowClearModal] = useState(false);

  const totalBoxes = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.product.boxPrice,
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Seguir agregando</span>
        </button>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar pedido</span>
          </button>
        )}
      </div>

      <div className="mb-4">
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Tu Pedido por Cajas
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {totalBoxes === 0
            ? 'Aún no has agregado cajas'
            : `Tienes ${formatBoxCount(totalBoxes)} en el carrito`}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-6">
          <div className="w-16 h-16 bg-sky-50 text-[#28AEE4] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-900">El carrito está vacío</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Explora el catálogo de Cassatas y helados para agregar las cajas que necesitas en tu negocio.
          </p>
          <button
            type="button"
            onClick={onBackToCatalog}
            className="mt-5 min-h-[44px] px-6 py-2.5 bg-[#28AEE4] hover:bg-[#209bcc] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Ir al catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* List of Cart Items */}
          {cartItems.map((item) => {
            const subtotal = item.quantity * item.product.boxPrice;

            return (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <ProductImage product={item.product} className="w-full h-full" />
                  </div>

                  {/* Title & Box presentation */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-slate-900 text-sm leading-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Caja de {item.product.unitsPerBox} unidades
                    </p>
                    <p className="text-xs font-medium text-slate-700 mt-1">
                      Precio por caja: <span className="tabular-nums font-semibold">{formatCLP(item.product.boxPrice)}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {/* Quantity Stepper (min 44px hitbox) */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
                      aria-label={`Disminuir una caja de ${item.product.name}`}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="px-3 text-center">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-none font-medium">
                        {item.quantity === 1 ? 'caja' : 'cajas'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
                      aria-label={`Aumentar una caja de ${item.product.name}`}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#28AEE4] text-white hover:bg-[#209bcc] transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Subtotal
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                      {formatCLP(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Cart Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 mt-6 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total de Cajas</span>
              <span className="text-slate-200 font-semibold tabular-nums">
                {formatBoxCount(totalBoxes)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                TOTAL
              </span>
              <span className="text-2xl font-black text-[#28AEE4] tabular-nums">
                {formatCLP(totalPrice)}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onProceedToCustomer}
              className="w-full min-h-[50px] px-6 py-3 bg-[#28AEE4] hover:bg-[#209bcc] active:bg-[#1a85b0] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
            >
              <span>Continuar con mis datos</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Cart */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center">
              ¿Vaciar todo el pedido?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-1.5 leading-relaxed">
              Esta acción eliminará todas las cajas que has agregado al pedido actual.
            </p>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                No, mantener
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setShowClearModal(false);
                }}
                className="flex-1 min-h-[44px] px-3 py-2 text-xs font-semibold text-white bg-[#E31B23] hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

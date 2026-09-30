import { useState } from 'react';
import { CartItem, CustomerInfo, InvoiceInfo } from '../types';
import { formatBoxCount, formatCLP } from '../utils/format';
import { generateWhatsAppMessage, getWhatsAppUrl, JOLY_WHATSAPP_DISPLAY } from '../utils/whatsapp';
import { ArrowLeft, Send, Copy, Check, MessageSquare, AlertCircle, ShoppingBag, Edit3 } from 'lucide-react';

interface OrderReviewProps {
  cart: CartItem[];
  customer: CustomerInfo;
  invoice: InvoiceInfo;
  onBack: () => void;
  onEditCustomer: () => void;
  onConfirmOrder: () => void;
}

export function OrderReview({
  cart,
  customer,
  invoice,
  onBack,
  onEditCustomer,
  onConfirmOrder,
}: OrderReviewProps) {
  const [copied, setCopied] = useState(false);

  const totalBoxes = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.quantity * item.product.boxPrice,
    0
  );

  const whatsappMessage = generateWhatsAppMessage(cart, customer, invoice);
  const whatsappUrl = getWhatsAppUrl(whatsappMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleConfirmAndSend = () => {
    // Notify parent to record confirmation state
    onConfirmOrder();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Top back button */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al formulario</span>
        </button>

        <button
          type="button"
          onClick={onEditCustomer}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#28AEE4] hover:underline cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar datos</span>
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Revisión del Pedido
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Por favor verifica que toda la información sea correcta antes de confirmar.
        </p>
      </div>

      {/* Main Review Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden mb-6">
        {/* Section 1: Customer & Business Info */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                CLIENTE
              </span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">
                {customer.firstName} {customer.lastName}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                NEGOCIO
              </span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">
                {customer.businessName}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                SECTOR
              </span>
              <p className="font-medium text-slate-800 mt-0.5">
                {customer.sector}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                DIRECCIÓN
              </span>
              <p className="font-medium text-slate-800 mt-0.5">
                {customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Products Breakdown */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              PRODUCTOS ({formatBoxCount(totalBoxes)})
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {cart.map((item) => {
              const itemSubtotal = item.quantity * item.product.boxPrice;
              return (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      <span className="font-bold text-[#28AEE4] mr-1.5 tabular-nums">
                        {formatBoxCount(item.quantity)}
                      </span>
                      · {item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Caja de {item.product.unitsPerBox} un. ({formatCLP(item.product.boxPrice)} c/u)
                    </p>
                  </div>

                  <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
                    {formatCLP(itemSubtotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TOTAL */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="font-extrabold text-slate-900 uppercase text-sm sm:text-base tracking-wide">
              TOTAL
            </span>
            <span className="font-black text-xl sm:text-2xl text-[#28AEE4] tabular-nums">
              {formatCLP(totalPrice)}
            </span>
          </div>
        </div>

        {/* Section 3: Payment Method & Observations */}
        <div className="p-4 sm:p-5 space-y-3 bg-slate-50/60">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              FORMA DE PAGO
            </span>
            <p className="font-semibold text-slate-900 text-sm mt-0.5">
              {customer.paymentMethod}
            </p>
          </div>

          {customer.observations && customer.observations.trim().length > 0 && (
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                OBSERVACIÓN
              </span>
              <p className="text-xs text-slate-700 mt-0.5 italic">
                "{customer.observations.trim()}"
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Factura si corresponde */}
        {invoice.needsInvoice && (
          <div className="p-4 sm:p-5 bg-sky-50/40">
            <span className="font-bold text-[#28AEE4] uppercase tracking-wider block text-[11px] mb-2">
              FACTURA SOLICITADA
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Razón social:</span>{' '}
                <span className="font-semibold text-slate-900">{invoice.businessName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">RUT:</span>{' '}
                <span className="font-semibold text-slate-900 tabular-nums">{invoice.rut}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Giro:</span>{' '}
                <span className="font-semibold text-slate-900">{invoice.activity}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Dirección:</span>{' '}
                <span className="font-semibold text-slate-900">{invoice.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Message Preview Accordion / Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#28AEE4]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Mensaje preparado para WhatsApp
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-950 p-3.5 rounded-xl font-mono text-[11px] sm:text-xs text-slate-300 whitespace-pre-wrap break-words border border-slate-800 select-all leading-relaxed">
          {whatsappMessage}
        </pre>

        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#28AEE4] shrink-0" />
          <span>El mensaje se enviará al número oficial: <strong className="text-white">{JOLY_WHATSAPP_DISPLAY}</strong></span>
        </p>
      </div>

      {/* Final Action Buttons */}
      <div className="space-y-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleConfirmAndSend}
          className="w-full min-h-[52px] px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2.5 shadow-md transition-transform active:scale-[0.99] cursor-pointer text-center"
        >
          <Send className="w-5 h-5" />
          <span>Confirmar y Enviar por WhatsApp</span>
        </a>

        <p className="text-center text-xs text-slate-500">
          Al presionar el botón se abrirá WhatsApp en una ventana nueva con el pedido listo. No se enviará de forma automática sin que lo revises.
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CartItem, CustomerInfo, InvoiceInfo } from '../types';
import { formatBoxCount, formatCLP } from '../utils/format';
import {
  generateWhatsAppMessage,
  getWhatsAppUrl,
  getWaMeUrl,
  JOLY_WHATSAPP_DISPLAY,
  getOrCreateOrderNumber,
  getChileanDateTimeString,
  resetOrderSession,
} from '../utils/whatsapp';
import { CheckCircle2, MessageCircle, Copy, Check, PlusCircle, ExternalLink, Calendar, Clock, Hash } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface OrderConfirmedProps {
  cart: CartItem[];
  customer: CustomerInfo;
  invoice: InvoiceInfo;
  onNewOrder: () => void;
}

export function OrderConfirmed({
  cart,
  customer,
  invoice,
  onNewOrder,
}: OrderConfirmedProps) {
  const [copied, setCopied] = useState(false);
  const orderNumber = getOrCreateOrderNumber();
  const { date, time } = getChileanDateTimeString();

  const totalBoxes = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.quantity * item.product.boxPrice,
    0
  );

  const message = generateWhatsAppMessage(cart, customer, invoice, orderNumber);
  const whatsappUrl = getWhatsAppUrl(message);
  const waMeUrl = getWaMeUrl(message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    resetOrderSession();
    onNewOrder();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-28 text-center">
      {/* Brand Header */}
      <BrandLogo size="md" className="justify-center mb-6" />

      {/* Success Icon */}
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold rounded-full mb-3">
        <Hash className="w-3.5 h-3.5 text-[#28AEE4]" />
        <span>Pedido Registrado: {orderNumber}</span>
      </div>

      <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
        ¡Pedido Preparado con Éxito!
      </h1>
      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
        El pedido para <strong className="text-slate-900">{customer.businessName}</strong> está listo para ser recibido por nuestro equipo de atención por WhatsApp.
      </p>

      {/* Main WhatsApp Reconnect Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 my-6 text-left shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Destinatario oficial
            </span>
            <span className="font-heading font-extrabold text-base text-slate-900">
              JOLY & HELADOS PANDA ({JOLY_WHATSAPP_DISPLAY})
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Listo para enviar
          </span>
        </div>

        {/* Date and Time tracker banner */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-700">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#28AEE4]" />
            <span>Fecha: <strong>{date}</strong></span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#28AEE4]" />
            <span>Hora: <strong>{time}</strong></span>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p>
            • <strong>Cajas solicitadas:</strong> {formatBoxCount(totalBoxes)}
          </p>
          <p>
            • <strong>Total del pedido:</strong> <span className="tabular-nums font-bold text-slate-900">{formatCLP(totalPrice)}</span>
          </p>
          <p>
            • <strong>Forma de pago:</strong> {customer.paymentMethod}
          </p>
          {invoice.needsInvoice && (
            <p>
              • <strong>Factura:</strong> {invoice.businessName} (RUT: {invoice.rut})
            </p>
          )}
        </div>

        {/* WhatsApp Link button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Abrir en WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[48px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar texto</span>
              </>
            )}
          </button>
        </div>

        {/* Alternate link for desktop or specific browsers */}
        <div className="pt-1 text-center">
          <a
            href={waMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1"
          >
            <span>¿Problemas para abrir? Probar enlace alternativo wa.me</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Start New Order */}
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#28AEE4] hover:text-[#209bcc] hover:underline cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Iniciar un nuevo pedido</span>
      </button>
    </div>
  );
}

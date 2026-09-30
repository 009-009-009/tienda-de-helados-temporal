import { CartItem, CustomerInfo, InvoiceInfo } from '../types';
import { formatBoxCount, formatCLP } from './format';

export const JOLY_WHATSAPP_PHONE = '56995769200'; // +56995769200
export const JOLY_WHATSAPP_DISPLAY = '+56 9 9576 9200';

export function generateWhatsAppMessage(
  cart: CartItem[],
  customer: CustomerInfo,
  invoice: InvoiceInfo
): string {
  const lines: string[] = [];

  // Header
  lines.push('🍦 JOLY & HELADOS PANDA — PEDIDO MAYORISTA');
  lines.push('⏰ Despacho Tempranito (Pedidos antes de las 11:00 AM)');
  lines.push('');

  // Customer info
  lines.push(`CLIENTE: ${customer.firstName.trim()} ${customer.lastName.trim()}`);
  lines.push(`NEGOCIO: ${customer.businessName.trim()}`);
  lines.push(`SECTOR: ${customer.sector.trim()}`);
  lines.push(`DIRECCIÓN: ${customer.address.trim()}`);
  lines.push('');

  // Products
  cart.forEach((item) => {
    const boxText = formatBoxCount(item.quantity);
    const subtotalText = formatCLP(item.quantity * item.product.boxPrice);
    lines.push(`${boxText} · ${item.product.name} — ${subtotalText}`);
  });
  lines.push('');

  // Total and Payment
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.product.boxPrice,
    0
  );
  lines.push(`TOTAL ${formatCLP(totalAmount)}`);
  lines.push(`FORMA DE PAGO: ${customer.paymentMethod}`);

  // Optional observation
  if (customer.observations && customer.observations.trim().length > 0) {
    lines.push('');
    lines.push(`OBSERVACIÓN: ${customer.observations.trim()}`);
  }

  // Invoice if requested
  if (invoice.needsInvoice) {
    lines.push('');
    lines.push('FACTURA');
    lines.push(`Razón social: ${invoice.businessName.trim()}`);
    lines.push(`RUT: ${invoice.rut.trim()}`);
    lines.push(`Giro: ${invoice.activity.trim()}`);
    lines.push(`Dirección: ${invoice.address.trim()}`);
  }

  return lines.join('\n');
}

export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  // api.whatsapp.com is universally supported on iOS, Android, and desktop browsers
  return `https://api.whatsapp.com/send?phone=${JOLY_WHATSAPP_PHONE}&text=${encoded}`;
}

export function getWaMeUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${JOLY_WHATSAPP_PHONE}?text=${encoded}`;
}

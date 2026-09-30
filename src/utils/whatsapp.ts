import { CartItem, CustomerInfo, InvoiceInfo } from '../types';
import { formatBoxCount, formatCLP } from './format';

export const JOLY_WHATSAPP_PHONE = '56995769200'; // +56995769200
export const JOLY_WHATSAPP_DISPLAY = '+56 9 9576 9200';

export function getOrCreateOrderNumber(): string {
  try {
    const key = 'joly_current_order_id';
    const counterKey = 'joly_order_counter';
    let currentId = sessionStorage.getItem(key);
    if (!currentId) {
      const counter = parseInt(localStorage.getItem(counterKey) || '1000', 10);
      const next = isNaN(counter) ? 1001 : counter + 1;
      localStorage.setItem(counterKey, next.toString());
      currentId = `#HJ-${next}`;
      sessionStorage.setItem(key, currentId);
    }
    return currentId;
  } catch {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `#HJ-${random}`;
  }
}

export function resetOrderSession(): void {
  try {
    sessionStorage.removeItem('joly_current_order_id');
  } catch {
    // ignore
  }
}

export function getChileanDateTimeString(): { date: string; time: string; full: string } {
  const now = new Date();
  try {
    const date = now.toLocaleDateString('es-CL', {
      timeZone: 'America/Santiago',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = now.toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { date, time, full: `${date} a las ${time}` };
  } catch {
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())} hrs`;
    return { date, time, full: `${date} a las ${time}` };
  }
}

export function generateWhatsAppMessage(
  cart: CartItem[],
  customer: CustomerInfo,
  invoice: InvoiceInfo,
  explicitOrderNumber?: string
): string {
  const lines: string[] = [];
  const orderNum = explicitOrderNumber || getOrCreateOrderNumber();
  const { date, time } = getChileanDateTimeString();

  // Header with Order #, Date and Time for full chronological control
  lines.push('🍦 JOLY & HELADOS PANDA — PEDIDO MAYORISTA');
  lines.push(`🔖 PEDIDO N°: ${orderNum}`);
  lines.push(`📅 FECHA: ${date}  ⏰ HORA: ${time}`);
  lines.push('🚚 Despacho Tempranito (Pedidos antes de las 11:00 AM)');
  lines.push('──────────────────────────────');
  lines.push('');

  // Customer info
  lines.push(`👤 CLIENTE: ${customer.firstName.trim()} ${customer.lastName.trim()}`);
  lines.push(`🏪 NEGOCIO: ${customer.businessName.trim()}`);
  lines.push(`📍 SECTOR: ${customer.sector.trim()}`);
  lines.push(`🏠 DIRECCIÓN: ${customer.address.trim()}`);
  lines.push('');

  // Products
  lines.push('📦 DETALLE DEL PEDIDO:');
  cart.forEach((item) => {
    const boxText = formatBoxCount(item.quantity);
    const subtotalText = formatCLP(item.quantity * item.product.boxPrice);
    lines.push(`• ${boxText} · ${item.product.name} — ${subtotalText}`);
  });
  lines.push('');

  // Total and Payment
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.product.boxPrice,
    0
  );
  lines.push('──────────────────────────────');
  lines.push(`💰 TOTAL A PAGAR: ${formatCLP(totalAmount)}`);
  lines.push(`💳 FORMA DE PAGO: ${customer.paymentMethod}`);

  // Optional observation
  if (customer.observations && customer.observations.trim().length > 0) {
    lines.push('');
    lines.push(`📝 OBSERVACIÓN: ${customer.observations.trim()}`);
  }

  // Invoice if requested
  if (invoice.needsInvoice) {
    lines.push('');
    lines.push('──────────────────────────────');
    lines.push('📄 DATOS PARA FACTURA:');
    lines.push(`• Razón social: ${invoice.businessName.trim()}`);
    lines.push(`• RUT: ${invoice.rut.trim()}`);
    lines.push(`• Giro: ${invoice.activity.trim()}`);
    lines.push(`• Dirección: ${invoice.address.trim()}`);
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

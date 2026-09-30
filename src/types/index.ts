export type CategoryId =
  | 'cassatas-1l'
  | 'cassatas-1-8l'
  | 'helados-individuales'
  | 'postres-especiales'
  | 'chocante-copas';

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  defaultPresentation: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: CategoryId;
  categoryName: string;
  unitsPerBox: number;
  boxPrice: number;
  unitRefPrice: number;
  imageFileName: string; // e.g. "cassata-piña.png" or empty
  flavorNotes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number; // Number of BOXES
}

export type PaymentMethod = 'Efectivo' | 'Transferencia';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  businessName: string;
  sector: string;
  address: string;
  paymentMethod: PaymentMethod;
  observations: string;
}

export interface InvoiceInfo {
  needsInvoice: boolean;
  businessName: string; // Razón social
  rut: string;          // RUT
  activity: string;     // Giro
  address: string;      // Dirección
}

export type CheckoutStep =
  | 'catalog'
  | 'cart'
  | 'customer'
  | 'invoice'
  | 'review'
  | 'confirmed';

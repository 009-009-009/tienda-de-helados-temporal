import { useState, useEffect, useMemo } from 'react';
import { PRODUCTS } from './data/catalog';
import {
  CartItem,
  CheckoutStep,
  CustomerInfo,
  InvoiceInfo,
  Product,
} from './types';
import { Header } from './components/Header';
import { CatalogSection } from './components/CatalogSection';
import { CartView } from './components/CartView';
import { CustomerForm } from './components/CustomerForm';
import { OrderReview } from './components/OrderReview';
import { OrderConfirmed } from './components/OrderConfirmed';
import { AdminImageManager } from './components/AdminImageManager';
import { BrandLogo } from './components/BrandLogo';

const LOCAL_STORAGE_CART_KEY = 'joly_b2b_cart';
const LOCAL_STORAGE_CUSTOMER_KEY = 'joly_b2b_customer';
const LOCAL_STORAGE_INVOICE_KEY = 'joly_b2b_invoice';

const DEFAULT_CUSTOMER: CustomerInfo = {
  firstName: '',
  lastName: '',
  businessName: '',
  sector: '',
  address: '',
  paymentMethod: 'Efectivo',
  observations: '',
};

const DEFAULT_INVOICE: InvoiceInfo = {
  needsInvoice: false,
  businessName: '',
  rut: '',
  activity: '',
  address: '',
};

export default function App() {
  // Step state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('catalog');
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  // Cart state: Record of productId -> number of boxes
  const [cartQuantities, setCartQuantities] = useState<{ [productId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Customer & Invoice states
  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMER;
    } catch {
      return DEFAULT_CUSTOMER;
    }
  });

  const [invoice, setInvoice] = useState<InvoiceInfo>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_INVOICE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_INVOICE;
    } catch {
      return DEFAULT_INVOICE;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cartQuantities));
    } catch (e) {
      console.error(e);
    }
  }, [cartQuantities]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOMER_KEY, JSON.stringify(customer));
    } catch (e) {
      console.error(e);
    }
  }, [customer]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_INVOICE_KEY, JSON.stringify(invoice));
    } catch (e) {
      console.error(e);
    }
  }, [invoice]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Derived cart items list
  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cartQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const product = PRODUCTS.find((p) => p.id === productId);
        if (!product) return null;
        return {
          product,
          quantity: qty,
        };
      })
      .filter((item): item is CartItem => item !== null);
  }, [cartQuantities]);

  const totalBoxes = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.quantity * item.product.boxPrice,
      0
    );
  }, [cartItems]);

  // Handlers
  const handleAddToCart = (product: Product) => {
    setCartQuantities((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    setCartQuantities((prev) => {
      const updated = { ...prev };
      if (newQuantity <= 0) {
        delete updated[product.id];
      } else {
        updated[product.id] = newQuantity;
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartQuantities({});
  };

  const handleCustomerFormSubmit = (
    updatedCustomer: CustomerInfo,
    updatedInvoice: InvoiceInfo
  ) => {
    setCustomer(updatedCustomer);
    setInvoice(updatedInvoice);
    setCurrentStep('review');
  };

  const handleNewOrder = () => {
    setCartQuantities({});
    setCurrentStep('catalog');
  };

  return (
    <div className="min-h-screen bg-[#EEFF00] bg-gradient-to-b from-[#F8FF00] via-[#EEFF00] to-[#E2F700] text-slate-900 flex flex-col selection:bg-slate-900 selection:text-[#EEFF00]">
      {/* Top Bar Contract Compliant Header */}
      <Header
        currentStep={currentStep}
        cartItemCount={totalBoxes}
        cartTotal={totalPrice}
        onOpenCart={() => setCurrentStep('cart')}
        onNavigateToCatalog={() => setCurrentStep('catalog')}
        onOpenImageManager={() => setIsImageManagerOpen(true)}
      />

      {/* Admin Image Manager Modal */}
      <AdminImageManager
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
      />

      {/* Main Content Router */}
      <div className="flex-1">
        {currentStep === 'catalog' && (
          <CatalogSection
            cart={cartQuantities}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onGoToCart={() => setCurrentStep('cart')}
            totalBoxes={totalBoxes}
            totalPrice={totalPrice}
          />
        )}

        {currentStep === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onBackToCatalog={() => setCurrentStep('catalog')}
            onProceedToCustomer={() => {
              if (cartItems.length > 0) {
                setCurrentStep('customer');
              }
            }}
          />
        )}

        {currentStep === 'customer' && (
          <CustomerForm
            initialCustomer={customer}
            initialInvoice={invoice}
            onBack={() => setCurrentStep('cart')}
            onSubmit={handleCustomerFormSubmit}
          />
        )}

        {currentStep === 'review' && (
          <OrderReview
            cart={cartItems}
            customer={customer}
            invoice={invoice}
            onBack={() => setCurrentStep('customer')}
            onEditCustomer={() => setCurrentStep('customer')}
            onConfirmOrder={() => setCurrentStep('confirmed')}
          />
        )}

        {currentStep === 'confirmed' && (
          <OrderConfirmed
            cart={cartItems}
            customer={customer}
            invoice={invoice}
            onNewOrder={handleNewOrder}
          />
        )}
      </div>

      {/* Quiet Professional Footer */}
      <footer className="mt-auto border-t border-slate-900/10 bg-white/95 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <BrandLogo size="sm" />
            <span className="font-extrabold text-slate-900 tracking-wide">· HELADOS PANDA</span>
            <span className="font-medium text-slate-600">· Venta al por Mayor para Negocios</span>
          </div>
          <p className="text-slate-500 font-semibold">
            Despachos Tempranito · WhatsApp: +56 9 9576 9200
          </p>
        </div>
      </footer>
    </div>
  );
}

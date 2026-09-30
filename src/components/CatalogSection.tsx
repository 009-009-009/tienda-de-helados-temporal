import { useState, useMemo } from 'react';
import { Product, CategoryId } from '../types';
import { CATEGORIES, PRODUCTS } from '../data/catalog';
import { ProductCard } from './ProductCard';
import { Search, Info, X, ShoppingBag } from 'lucide-react';
import { formatBoxCount, formatCLP } from '../utils/format';

interface CatalogSectionProps {
  cart: { [productId: string]: number };
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (product: Product, quantity: number) => void;
  onGoToCart: () => void;
  totalBoxes: number;
  totalPrice: number;
}

export function CatalogSection({
  cart,
  onAddToCart,
  onUpdateQuantity,
  onGoToCart,
  totalBoxes,
  totalPrice,
}: CatalogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.categoryName.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pb-28 sm:pb-16">
      {/* Presentation & Informational Banner */}
      <section className="bg-white/95 backdrop-blur-md border-b border-slate-900/10 pt-5 pb-6 px-4 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto">
          {/* High Urgency Morning Dispatch Banner */}
          <div className="mb-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 sm:p-4.5 shadow-md border-2 border-white flex flex-col sm:flex-row items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-2xl shadow-inner">
                ⏰
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="bg-[#EEFF00] text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
                    Despacho Tempranito
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    Catálogo Mayorista Oficial
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                  ¡Hola! Ya tenemos disponible nuestro catálogo mayorista online con despacho tempranito
                </h2>
                <p className="text-xs text-rose-100 mt-0.5">
                  Haz tu pedido aquí antes de las <strong>11:00 AM</strong> para que salga en el primer camión de reparto y le llegue tempranito directo a su local.
                </p>
              </div>
            </div>

            <div className="shrink-0 bg-white/20 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/30 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider block text-amber-200">Hora Límite</span>
              <span className="text-lg font-black text-white tabular-nums">11:00 AM</span>
            </div>
          </div>

          {/* Spacious Wholesale Commercial Notice */}
          <div className="bg-amber-50/95 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-4.5 text-amber-950 shadow-xs flex items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/25 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-800">
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                  Venta por Caja
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-950">
                  Aviso Importante para Compradores
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                <strong className="text-amber-950 font-bold">Todos los productos se venden exclusivamente por caja cerrada.</strong> El valor por unidad mostrado en cada helado es solo una referencia sugerida para el cálculo de su negocio.
              </p>
            </div>
          </div>

          {/* Search Bar & Fast Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar helado, cassata, paleta o sabor..."
                className="w-full h-11 pl-10 pr-9 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-[#28AEE4] focus:ring-2 focus:ring-[#28AEE4]/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters: Responsive Grid & Flex Wrap that fully fits on mobile screens */}
          <div className="mt-4 pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Filtrar por categoría:
              </span>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] font-bold text-[#0284c7] hover:underline cursor-pointer"
                >
                  Ver todos los helados
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`col-span-2 sm:col-span-1 min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between sm:justify-center gap-2 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-950 text-white shadow-xs ring-2 ring-slate-950/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <span>🍦 Todos ({PRODUCTS.length})</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Completo
                </span>
              </button>

              {CATEGORIES.map((cat) => {
                const count = PRODUCTS.filter((p) => p.categoryId === cat.id).length;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#0284c7] text-white shadow-xs ring-2 ring-sky-400/40'
                        : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.shortName}</span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Results Counter and Active Filter Notice */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-800 font-medium">
          <span>
            Mostrando <strong className="text-slate-950 font-bold">{filteredProducts.length}</strong> de {PRODUCTS.length} productos
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#28AEE4] hover:underline"
            >
              Quitar filtro de búsqueda
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
            <p className="text-base font-semibold text-slate-800">
              No encontramos helados para "{searchQuery}"
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Intenta buscar por sabor como "piña", "frambuesa", "choco" o revisa otra categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={cart[product.id] || 0}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Strictly capped <15% viewport height on mobile) */}
      {totalBoxes > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {formatBoxCount(totalBoxes)} en el pedido
              </span>
              <span className="text-lg font-black text-slate-900 tabular-nums leading-tight">
                {formatCLP(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={onGoToCart}
              className="min-h-[48px] px-5 py-2.5 bg-[#28AEE4] hover:bg-[#209bcc] active:bg-[#1a85b0] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Pedido</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/catalog';
import { Product } from '../types';
import {
  saveCustomImage,
  removeCustomImage,
  getAllCustomImages,
  OFFICIAL_LOGO_KEY,
  saveCustomLogo,
  removeCustomLogo,
  exportImagesBackupJSON,
  importImagesBackupJSON,
} from '../utils/imageStore';
import { removeWhiteBackground, clearBackgroundCache } from '../utils/removeBackground';
import { ProductImage } from './ProductImage';
import { BrandLogo } from './BrandLogo';
import {
  X,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Crown,
  Wand2,
  Download,
} from 'lucide-react';

interface AdminImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminImageManager({ isOpen, onClose }: AdminImageManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [uploadingFor, setUploadingFor] = useState<Product | null>(null);
  const [linkLynPrompt, setLinkLynPrompt] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    try {
      const json = await exportImagesBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo-fotos-helados-joly-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessNotice('¡Archivo de respaldo descargado con éxito!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch {
      alert('No se pudo exportar el respaldo.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const count = await importImagesBackupJSON(text);
        await loadImages();
        setSuccessNotice(`¡Se restauraron ${count} fotos oficiales desde el archivo de respaldo!`);
        setTimeout(() => setSuccessNotice(null), 5000);
      } catch {
        alert('El archivo no es un respaldo válido de fotos.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadImages = async () => {
    const all = await getAllCustomImages();
    setCustomImages(all);
  };

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasCustomLogo = Boolean(customImages[OFFICIAL_LOGO_KEY]);

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const cleanDataUrl = await removeWhiteBackground(dataUrl);
      await saveCustomLogo(cleanDataUrl);
      await loadImages();
      setSuccessNotice('¡Logo oficial de JOLY cargado y transparentado! Se aplicó a toda la tienda.');
      setTimeout(() => setSuccessNotice(null), 4000);
      if (logoInputRef.current) logoInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (window.confirm('¿Deseas restaurar el logo de texto predeterminado de JOLY?')) {
      await removeCustomLogo();
      await loadImages();
      setSuccessNotice('Logo predeterminado restaurado.');
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  const handleCleanAllSaved = async () => {
    setIsCleaning(true);
    clearBackgroundCache();
    try {
      const all = await getAllCustomImages();
      let count = 0;
      for (const [key, val] of Object.entries(all)) {
        const cleaned = await removeWhiteBackground(val);
        await saveCustomImage(key, cleaned);
        count++;
      }
      await loadImages();
      setSuccessNotice(`¡Micro-detalles limpios con éxito de ${count > 0 ? `${count} fotos` : 'todas las fotos'}! Palitos, platos y cucharas transparentados sobre el azul.`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } finally {
      setIsCleaning(false);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.categoryId === selectedCategory);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Automatically remove white background so the product stamps directly onto the blue card!
      const cleanDataUrl = await removeWhiteBackground(dataUrl);

      const fileName = uploadingFor.imageFileName;
      await saveCustomImage(fileName, cleanDataUrl);

      // If it is Lyn Frutilla or Lyn Naranja, offer to link both
      if (fileName === 'lyn-frutilla.png' || fileName === 'lyn-naranja.png') {
        setLinkLynPrompt(cleanDataUrl);
      } else {
        setSuccessNotice(`¡Imagen transparentada y guardada para ${uploadingFor.name}!`);
        setTimeout(() => setSuccessNotice(null), 3000);
      }

      await loadImages();
      setUploadingFor(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleApplyToBothLyn = async (dataUrl: string) => {
    await saveCustomImage('lyn-frutilla.png', dataUrl);
    await saveCustomImage('lyn-naranja.png', dataUrl);
    await loadImages();
    setLinkLynPrompt(null);
    setSuccessNotice('¡Imagen oficial aplicada con éxito a Lyn Frutilla y Lyn Naranja!');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleRemove = async (product: Product) => {
    if (window.confirm(`¿Quitar la imagen personalizada de ${product.name}?`)) {
      await removeCustomImage(product.imageFileName);
      await loadImages();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0284c7] flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Gestor de Fotos Oficiales de Catálogo
              </h2>
              <p className="text-xs text-slate-500">
                Sube tus archivos PNG o JPG originales. Se guardan sin compresión ni alteración por IA.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleCleanAllSaved}
              disabled={isCleaning}
              title="Quita automáticamente los fondos blancos de todas las fotos subidas para que se estampen directo en el azul"
              className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isCleaning ? 'Transparentando...' : '🪄 Quitar fondo blanco'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportBackup}
              title="Descargar un archivo de respaldo (.json) con todas tus fotos cargadas"
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Descargar Respaldo</span>
            </button>

            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              title="Cargar un archivo de respaldo de fotos descargado anteriormente"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Respaldo</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden Backup File Input */}
        <input
          ref={backupInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportBackup}
        />

        {/* Success Banner */}
        {successNotice && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Lyn Link Prompt Modal */}
        {linkLynPrompt && (
          <div className="m-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  ¿Aplicar esta misma imagen a ambas paletas Lyn?
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Con 1 clic se asociará tanto a <strong>Lyn Frutilla</strong> como a <strong>Lyn Naranja</strong> respetando su diseño y transparencia.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleApplyToBothLyn(linkLynPrompt)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Sí, aplicar a ambas
              </button>
              <button
                type="button"
                onClick={() => setLinkLynPrompt(null)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors"
              >
                Solo a esta
              </button>
            </div>
          </div>
        )}

        {/* Brand Logo Designated Section */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/50 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white border border-blue-200/80 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
              <BrandLogo size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Logo Oficial de la Empresa
                </span>
                {hasCustomLogo && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                {hasCustomLogo ? 'Logo oficial de JOLY cargado' : 'Logo tipográfico predeterminado'}
              </p>
              <p className="text-[11px] text-slate-500">
                Se ubica automáticamente en la barra superior, portada del catálogo, recibos y pie de página.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasCustomLogo ? 'Cambiar Logo' : 'Subir Logo Oficial'}</span>
            </button>
            {hasCustomLogo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                title="Restaurar logo predeterminado"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hidden Logo File Input */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleLogoSelect}
        />

        {/* Category Filter Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex flex-wrap items-center gap-1.5 text-xs font-medium bg-white">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Todos ({PRODUCTS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.shortName}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const hasCustom = Boolean(customImages[product.imageFileName]);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-3 relative hover:border-blue-300 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-b from-[#38bdf8] to-[#0284c7] border border-sky-300/40 overflow-hidden shrink-0 flex items-center justify-center">
                    <ProductImage product={product} className="w-full h-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate" title={product.name}>
                      {product.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {product.imageFileName}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadingFor(product);
                          fileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0284c7] font-bold text-[11px] rounded-md flex items-center gap-1 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{hasCustom ? 'Reemplazar' : 'Subir foto'}</span>
                      </button>

                      {hasCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemove(product)}
                          title="Restaurar / Quitar imagen subida"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {hasCustom ? (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" title="Foto oficial cargada" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Fidelidad de marca: Las imágenes subidas mantienen su transparencia original.</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors w-full sm:w-auto"
          >
            Listo, volver al catálogo
          </button>
        </div>

      </div>
    </div>
  );
}

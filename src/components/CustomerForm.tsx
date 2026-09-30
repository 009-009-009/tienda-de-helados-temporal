import { useState } from 'react';
import { CustomerInfo, InvoiceInfo, PaymentMethod } from '../types';
import { ArrowLeft, ArrowRight, Building2, User, MapPin, CreditCard, FileText, CheckCircle2 } from 'lucide-react';

interface CustomerFormProps {
  initialCustomer: CustomerInfo;
  initialInvoice: InvoiceInfo;
  onBack: () => void;
  onSubmit: (customer: CustomerInfo, invoice: InvoiceInfo) => void;
}

export function CustomerForm({
  initialCustomer,
  initialInvoice,
  onBack,
  onSubmit,
}: CustomerFormProps) {
  const [customer, setCustomer] = useState<CustomerInfo>(initialCustomer);
  const [invoice, setInvoice] = useState<InvoiceInfo>(initialInvoice);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Customer required fields
    if (!customer.firstName.trim()) {
      newErrors.firstName = 'Ingresa el nombre del contacto';
    }
    if (!customer.lastName.trim()) {
      newErrors.lastName = 'Ingresa el apellido';
    }
    if (!customer.businessName.trim()) {
      newErrors.businessName = 'Ingresa el nombre de tu negocio o local';
    }
    if (!customer.sector.trim()) {
      newErrors.sector = 'Ingresa el sector o comuna';
    }
    if (!customer.address.trim()) {
      newErrors.address = 'Ingresa la dirección de entrega';
    }

    // Invoice required fields if requested
    if (invoice.needsInvoice) {
      if (!invoice.businessName.trim()) {
        newErrors.invoiceBusinessName = 'Ingresa la razón social para la factura';
      }
      if (!invoice.rut.trim()) {
        newErrors.invoiceRut = 'Ingresa el RUT de la empresa';
      }
      if (!invoice.activity.trim()) {
        newErrors.invoiceActivity = 'Ingresa el giro comercial';
      }
      if (!invoice.address.trim()) {
        newErrors.invoiceAddress = 'Ingresa la dirección tributaria';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(customer, invoice);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Top back button */}
      <div className="mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al carrito</span>
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Datos del Negocio y Despacho
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Completa los datos para coordinar la entrega y el comprobante de tu pedido.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Section 1: Contacto y Negocio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 text-[#28AEE4]">
            <User className="w-4 h-4 text-[#28AEE4]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Datos del Cliente
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.firstName}
                onChange={(e) => {
                  setCustomer({ ...customer, firstName: e.target.value });
                  if (errors.firstName) setErrors({ ...errors, firstName: '' });
                }}
                placeholder="Ej. Juan"
                className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                  errors.firstName
                    ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[#28AEE4]'
                }`}
              />
              {errors.firstName && (
                <p className="text-[11px] text-[#E31B23] mt-1 font-medium">{errors.firstName}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Apellido <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.lastName}
                onChange={(e) => {
                  setCustomer({ ...customer, lastName: e.target.value });
                  if (errors.lastName) setErrors({ ...errors, lastName: '' });
                }}
                placeholder="Ej. Pérez"
                className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                  errors.lastName
                    ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[#28AEE4]'
                }`}
              />
              {errors.lastName && (
                <p className="text-[11px] text-[#E31B23] mt-1 font-medium">{errors.lastName}</p>
              )}
            </div>

            {/* Negocio */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre del Negocio o Almacén <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customer.businessName}
                  onChange={(e) => {
                    setCustomer({ ...customer, businessName: e.target.value });
                    if (errors.businessName) setErrors({ ...errors, businessName: '' });
                  }}
                  placeholder="Ej. Minimarket San Pedro / Cafetería Central"
                  className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                    errors.businessName
                      ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#28AEE4]'
                  }`}
                />
              </div>
              {errors.businessName && (
                <p className="text-[11px] text-[#E31B23] mt-1 font-medium">{errors.businessName}</p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sector o Comuna <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.sector}
                onChange={(e) => {
                  setCustomer({ ...customer, sector: e.target.value });
                  if (errors.sector) setErrors({ ...errors, sector: '' });
                }}
                placeholder="Ej. Centro / Bellavista / Maipú"
                className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                  errors.sector
                    ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[#28AEE4]'
                }`}
              />
              {errors.sector && (
                <p className="text-[11px] text-[#E31B23] mt-1 font-medium">{errors.sector}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dirección exacta <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.address}
                onChange={(e) => {
                  setCustomer({ ...customer, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                placeholder="Ej. Av. Los Robles 1234, Local 2"
                className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                  errors.address
                    ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[#28AEE4]'
                }`}
              />
              {errors.address && (
                <p className="text-[11px] text-[#E31B23] mt-1 font-medium">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Forma de Pago */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 text-[#28AEE4]">
            <CreditCard className="w-4 h-4 text-[#28AEE4]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Forma de Pago <span className="text-[#E31B23]">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCustomer({ ...customer, paymentMethod: 'Efectivo' })}
              className={`min-h-[52px] p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                customer.paymentMethod === 'Efectivo'
                  ? 'border-[#28AEE4] bg-sky-50/50 ring-1 ring-[#28AEE4]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-left">
                <span className="block text-sm font-bold text-slate-900">Efectivo</span>
                <span className="text-[11px] text-slate-500">Pago contra entrega</span>
              </div>
              {customer.paymentMethod === 'Efectivo' && (
                <CheckCircle2 className="w-5 h-5 text-[#28AEE4]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setCustomer({ ...customer, paymentMethod: 'Transferencia' })}
              className={`min-h-[52px] p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                customer.paymentMethod === 'Transferencia'
                  ? 'border-[#28AEE4] bg-sky-50/50 ring-1 ring-[#28AEE4]'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="text-left">
                <span className="block text-sm font-bold text-slate-900">Transferencia</span>
                <span className="text-[11px] text-slate-500">Bancaria previa / al recibir</span>
              </div>
              {customer.paymentMethod === 'Transferencia' && (
                <CheckCircle2 className="w-5 h-5 text-[#28AEE4]" />
              )}
            </button>
          </div>
        </div>

        {/* Section 3: Observaciones (Opcional) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Observaciones <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            rows={2}
            value={customer.observations}
            onChange={(e) => setCustomer({ ...customer, observations: e.target.value })}
            placeholder="Indicaciones para el despacho, horario preferente, timbre o referencia..."
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#28AEE4] focus:outline-none transition-colors"
          />
        </div>

        {/* Section 4: Factura */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-[#28AEE4]">
              <FileText className="w-4 h-4 text-[#28AEE4]" />
              <h2 className="text-sm font-bold text-slate-900">
                ¿Necesita factura?
              </h2>
            </div>

            {/* Sí / No Segmented Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setInvoice({ ...invoice, needsInvoice: true })}
                className={`min-h-[36px] px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  invoice.needsInvoice
                    ? 'bg-[#28AEE4] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvoice({ ...invoice, needsInvoice: false });
                  // Clear invoice errors if user chooses No
                  const nextErrors = { ...errors };
                  delete nextErrors.invoiceBusinessName;
                  delete nextErrors.invoiceRut;
                  delete nextErrors.invoiceActivity;
                  delete nextErrors.invoiceAddress;
                  setErrors(nextErrors);
                }}
                className={`min-h-[36px] px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !invoice.needsInvoice
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {invoice.needsInvoice
              ? 'Por favor ingresa los datos tributarios para emitir tu factura electrónica.'
              : 'Se emitirá boleta de venta estándar si no solicitas factura.'}
          </p>

          {invoice.needsInvoice && (
            <div className="space-y-3.5 pt-3 border-t border-slate-100 animate-fadeIn">
              {/* Razón social */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Razón Social <span className="text-[#E31B23]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoice.businessName}
                  onChange={(e) => {
                    setInvoice({ ...invoice, businessName: e.target.value });
                    if (errors.invoiceBusinessName) {
                      setErrors({ ...errors, invoiceBusinessName: '' });
                    }
                  }}
                  placeholder="Ej. Comercializadora y Distribuidora SpA"
                  className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                    errors.invoiceBusinessName
                      ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#28AEE4]'
                  }`}
                />
                {errors.invoiceBusinessName && (
                  <p className="text-[11px] text-[#E31B23] mt-1 font-medium">
                    {errors.invoiceBusinessName}
                  </p>
                )}
              </div>

              {/* RUT & Giro in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* RUT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RUT <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoice.rut}
                    onChange={(e) => {
                      setInvoice({ ...invoice, rut: e.target.value });
                      if (errors.invoiceRut) setErrors({ ...errors, invoiceRut: '' });
                    }}
                    placeholder="Ej. 76.543.210-K"
                    className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                      errors.invoiceRut
                        ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 focus:border-[#28AEE4]'
                    }`}
                  />
                  {errors.invoiceRut && (
                    <p className="text-[11px] text-[#E31B23] mt-1 font-medium">{errors.invoiceRut}</p>
                  )}
                </div>

                {/* Giro */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giro Comercial <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoice.activity}
                    onChange={(e) => {
                      setInvoice({ ...invoice, activity: e.target.value });
                      if (errors.invoiceActivity) setErrors({ ...errors, invoiceActivity: '' });
                    }}
                    placeholder="Ej. Venta al por menor de alimentos"
                    className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                      errors.invoiceActivity
                        ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 focus:border-[#28AEE4]'
                    }`}
                  />
                  {errors.invoiceActivity && (
                    <p className="text-[11px] text-[#E31B23] mt-1 font-medium">
                      {errors.invoiceActivity}
                    </p>
                  )}
                </div>
              </div>

              {/* Dirección tributaria */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección Tributaria <span className="text-[#E31B23]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoice.address}
                  onChange={(e) => {
                    setInvoice({ ...invoice, address: e.target.value });
                    if (errors.invoiceAddress) setErrors({ ...errors, invoiceAddress: '' });
                  }}
                  placeholder="Ej. Av. Providencia 1234, Of. 501, Santiago"
                  className={`w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-colors ${
                    errors.invoiceAddress
                      ? 'border-[#E31B23] focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#28AEE4]'
                  }`}
                />
                {errors.invoiceAddress && (
                  <p className="text-[11px] text-[#E31B23] mt-1 font-medium">
                    {errors.invoiceAddress}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full min-h-[50px] px-6 py-3 bg-[#28AEE4] hover:bg-[#209bcc] active:bg-[#1a85b0] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
          >
            <span>Revisar Resumen del Pedido</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

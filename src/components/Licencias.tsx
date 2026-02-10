"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle,
  Info,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { generateRecommendation } from "../utils/licenseEstimator";
import type { LicenseInfo } from "../types/licenses";

type ProductType = "windows" | "office" | "";
type PaymentType = "perpetual" | "subscription" | "";
type UserType = "home" | "business" | "enterprise" | "";
type UserCount = "1-5" | "6-25" | "26-100" | "100+" | "";

interface ExpandedSections {
  estimator: boolean;
  windows: boolean;
  office: boolean;
  security: boolean;
  migration: boolean;
}

export default function Licencias() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>("");
  const [selectedUserType, setSelectedUserType] = useState<UserType>("");
  const [selectedUserCount, setSelectedUserCount] = useState<UserCount>("");

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    estimator: true,
    windows: false,
    office: false,
    security: false,
    migration: false,
  });

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const resetFilters = () => {
    setSelectedProduct("");
    setSelectedPayment("");
    setSelectedUserType("");
    setSelectedUserCount("");
  };

  const rawRecommendation = generateRecommendation(
    selectedProduct,
    selectedPayment,
    selectedUserType,
    selectedUserCount
  );

  // Convertir formato de recomendación a array de productos
  const recommendationProducts: LicenseInfo[] = [];
  if (rawRecommendation) {
    if (rawRecommendation.windows) recommendationProducts.push(rawRecommendation.windows);
    if (rawRecommendation.office) recommendationProducts.push(rawRecommendation.office);
  }

  const recommendation = {
    ...rawRecommendation,
    products: recommendationProducts,
    note: rawRecommendation?.reason,
  };

  return (
    <div className="my-24 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-6 inline-block rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white shadow-lg">
            <h1 className="text-4xl font-bold">🪟 Guía de Licencias Microsoft 2025</h1>
          </div>
          <p className="mx-auto max-w-3xl text-xl text-gray-700">
            Encuentra la licencia perfecta para tus necesidades - Windows y Office
          </p>
        </header>

        {/* Interactive License Estimator */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => toggleSection("estimator")}
            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-blue-100 p-3">
                <Filter className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Estimador Interactivo de Licencias
                </h3>
                <p className="text-gray-600">
                  Selecciona tus necesidades y obtén la mejor recomendación
                </p>
              </div>
            </div>
            {expandedSections.estimator ? <ChevronDown /> : <ChevronRight />}
          </button>

          {expandedSections.estimator && (
            <div className="border-t border-gray-100 px-6 pb-6">
              {/* Filters */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Product Type */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tipo de Producto
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value as ProductType)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="windows">Windows</option>
                    <option value="office">Office</option>
                  </select>
                </div>

                {/* Payment Model */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Modelo de Pago
                  </label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value as PaymentType)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="perpetual">Perpetua (Pago Único)</option>
                    <option value="subscription">Suscripción</option>
                  </select>
                </div>

                {/* User Type */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tipo de Usuario
                  </label>
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value as UserType)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="home">Hogar</option>
                    <option value="business">Negocio</option>
                    <option value="enterprise">Empresa Grande</option>
                  </select>
                </div>

                {/* User Count */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Cantidad de Usuarios
                  </label>
                  <select
                    value={selectedUserCount}
                    onChange={(e) => setSelectedUserCount(e.target.value as UserCount)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="1-5">1-5 usuarios</option>
                    <option value="6-25">6-25 usuarios</option>
                    <option value="26-100">26-100 usuarios</option>
                    <option value="100+">100+ usuarios</option>
                  </select>
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-4">
                <button
                  onClick={resetFilters}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                >
                  🔄 Limpiar Filtros
                </button>
              </div>

              {/* Recommendations */}
              {recommendation.products.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h4 className="text-lg font-bold text-gray-800">📊 Recomendaciones:</h4>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {recommendation.products.map((product: LicenseInfo, index: number) => (
                      <div
                        key={index}
                        className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 transition-shadow hover:shadow-lg"
                      >
                        <div className="mb-4 flex items-center">
                          <div className="mr-3 rounded-lg bg-blue-500 p-2 text-2xl text-white">
                            {product.icon}
                          </div>
                          <div>
                            <h5 className="text-lg font-bold text-blue-900">{product.name}</h5>
                            <p className="text-sm text-blue-700">{product.price}</p>
                          </div>
                        </div>

                        <p className="mb-4 text-gray-700">{product.description}</p>

                        <div className="mb-4 space-y-2">
                          {product.features?.map((feature: string, fIndex: number) => (
                            <div key={fIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-blue-200 pt-4">
                          <p className="text-xs text-gray-600">
                            <strong>Ideal para:</strong> {product.idealFor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {recommendation.note && (
                    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>💡 Nota:</strong> {recommendation.note}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rest of sections continue... */}
        <div className="space-y-8">
          {/* Windows Licenses Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <button
              onClick={() => toggleSection("windows")}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="mr-4 rounded-lg bg-blue-100 p-3">🪟</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Licencias Windows 11</h3>
                  <p className="text-gray-600">Opciones disponibles para Windows 11</p>
                </div>
              </div>
              {expandedSections.windows ? <ChevronDown /> : <ChevronRight />}
            </button>

            {expandedSections.windows && (
              <div className="border-t border-gray-100 px-6 pb-6">
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* OEM License */}
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
                    <div className="mb-4 flex items-center">
                      <div className="mr-3 rounded-lg bg-blue-500 p-2 text-white">💻</div>
                      <h4 className="text-lg font-bold text-blue-800">Licencia OEM</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Vinculada al hardware</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Precio más económico</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        <span>No transferible</span>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-600">
                        <strong>Ideal para:</strong> Nuevas PC, uso único por equipo
                      </p>
                    </div>
                  </div>

                  {/* Retail License */}
                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
                    <div className="mb-4 flex items-center">
                      <div className="mr-3 rounded-lg bg-green-500 p-2 text-white">📦</div>
                      <h4 className="text-lg font-bold text-green-800">Licencia Retail</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Transferible entre equipos</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Soporte oficial Microsoft</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Info className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Mayor inversión inicial</span>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-600">
                        <strong>Ideal para:</strong> Usuarios que cambian de PC frecuentemente
                      </p>
                    </div>
                  </div>

                  {/* Volume License */}
                  <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
                    <div className="mb-4 flex items-center">
                      <div className="mr-3 rounded-lg bg-purple-500 p-2 text-white">🏢</div>
                      <h4 className="text-lg font-bold text-purple-800">Licencia Volumen</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Activación múltiple</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Gestión centralizada</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Info className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Contratos mínimos</span>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-600">
                        <strong>Ideal para:</strong> Empresas, organizaciones, despliegues masivos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Office Section - simplified for length */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <button
              onClick={() => toggleSection("office")}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="mr-4 rounded-lg bg-orange-100 p-3">📊</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Office 2024 y Microsoft 365</h3>
                  <p className="text-gray-600">Opciones perpetuas y suscripciones disponibles</p>
                </div>
              </div>
              {expandedSections.office ? <ChevronDown /> : <ChevronRight />}
            </button>

            {expandedSections.office && (
              <div className="border-t border-gray-100 px-6 pb-6 pt-6">
                <p className="text-gray-700">
                  Office LTSC 2024, Microsoft 365 Personal, Familiar y Business Standard
                  disponibles con diferentes modelos de pago.
                </p>
              </div>
            )}
          </div>

          {/* Security Warning Section */}
          <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-lg">
            <button
              onClick={() => toggleSection("security")}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-red-50"
            >
              <div className="flex items-center">
                <div className="mr-4 rounded-lg bg-red-100 p-3">⚠️</div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Riesgos del Mercado Gris</h3>
                  <p className="text-red-600">Identificar y evitar licencias fraudulentas</p>
                </div>
              </div>
              {expandedSections.security ? <ChevronDown /> : <ChevronRight />}
            </button>

            {expandedSections.security && (
              <div className="border-t border-red-100 px-6 pb-6">
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h4 className="mb-4 flex items-center text-lg font-bold text-red-800">
                      <AlertTriangle className="mr-2" />
                      🚨 Señales de Alerta
                    </h4>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Precios extremadamente bajos (&lt;$300 MXN)
                      </li>
                      <li className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Entrega digital inmediata sin documentación
                      </li>
                      <li className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        No menciona vinculación a cuenta Microsoft
                      </li>
                      <li className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Ausencia de soporte oficial
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                    <h4 className="mb-4 flex items-center text-lg font-bold text-yellow-800">
                      <Shield className="mr-2" />
                      ⚖️ Consecuencias
                    </h4>
                    <ul className="space-y-2 text-sm text-yellow-700">
                      <li className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Pérdida de activación sin previo aviso
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Problemas con actualizaciones de seguridad
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Violación de términos de licencia
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Riesgo de auditorías empresariales
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h5 className="mb-2 font-semibold text-green-800">✅ Compra Segura:</h5>
                  <p className="text-sm text-green-700">
                    Adquiere únicamente de Microsoft Store, Partners certificados o distribuidores
                    autorizados. Verifica siempre ratings, reseñas y documentación completa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 rounded-2xl bg-gray-800 p-8 text-white">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-4 flex items-center text-lg font-bold">
                <Info className="mr-2" />
                📞 Soporte
              </h4>
              <p className="mb-4 text-sm text-gray-300">
                Para consultas específicas de licenciamiento empresarial
              </p>
              <a
                href="https://wa.me/5215660000199?text=Hola,%20me%20interesa%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700"
              >
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
                Contactar por WhatsApp
              </a>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold">🔄 Actualizaciones</h4>
              <p className="text-sm text-gray-300">
                Esta guía se actualiza constantemente con la información más reciente. Última
                actualización: Junio 2025.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold">⚖️ Aviso Legal</h4>
              <p className="text-sm text-gray-300">
                Los precios mostrados son <strong>estimados referenciales</strong> y están sujetos a
                cambios por: fluctuaciones del tipo de cambio USD/MXN, promociones vigentes,
                descuentos por volumen y políticas comerciales.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-600 pt-6 text-center">
            <p className="text-sm text-gray-400">Guía de Licencias Microsoft 2025 •</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

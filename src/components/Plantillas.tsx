"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

interface FormData {
  clientName: string;
  clientEmail: string;
  taskType: "quote" | "payment" | "license" | "update";
  productName: string;
  additionalInfo: string;
  isContPAQi: boolean;
  previewMode: boolean;
}

export default function Plantillas() {
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    clientEmail: "",
    taskType: "quote",
    productName: "",
    additionalInfo: "",
    isContPAQi: false,
    previewMode: false,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePreview = () => {
    setFormData((prev) => ({ ...prev, previewMode: !prev.previewMode }));
  };

  // Email content templates
  const getEmailContent = (): { title: string; mainContent: string } => {
    const { taskType, clientName, productName, additionalInfo } = formData;
    const safeName = escapeHtml(clientName);
    const safeProduct = escapeHtml(productName);
    const safeInfo = escapeHtml(additionalInfo);

    let title = "";
    let mainContent = "";

    switch (taskType) {
      case "quote":
        title = "Cotización - Unidad C";
        mainContent = `
          <p>Estimado/a ${safeName},</p>
          <p>Agradecemos su interés en nuestros servicios. Adjuntamos la cotización solicitada para <strong>${safeProduct}</strong>.</p>
          ${safeInfo ? `<p>${safeInfo}</p>` : ""}
          <p>Quedamos a sus órdenes para cualquier duda o aclaración.</p>
        `;
        break;

      case "payment":
        title = "Confirmación de Pago - Unidad C";
        mainContent = `
          <p>Estimado/a ${safeName},</p>
          <p>Le confirmamos que hemos recibido su pago correspondiente a <strong>${safeProduct}</strong>.</p>
          ${safeInfo ? `<p>${safeInfo}</p>` : ""}
          <p>Gracias por su confianza en nuestros servicios.</p>
        `;
        break;

      case "license":
        title = "Licencia - Unidad C";
        mainContent = `
          <p>Estimado/a ${safeName},</p>
          <p>Adjuntamos la información de la licencia para <strong>${safeProduct}</strong>.</p>
          ${safeInfo ? `<p>${safeInfo}</p>` : ""}
          <p>Para activar su licencia, siga las instrucciones incluidas en el archivo adjunto.</p>
        `;
        break;

      case "update":
        title = "Actualización - Unidad C";
        mainContent = `
          <p>Estimado/a ${safeName},</p>
          <p>Le informamos que la actualización de <strong>${safeProduct}</strong> se ha completado exitosamente.</p>
          ${safeInfo ? `<p>${safeInfo}</p>` : ""}
          <p>Si requiere asistencia adicional, no dude en contactarnos.</p>
        `;
        break;

      default:
        title = "Unidad C";
        mainContent = `<p>Estimado/a ${safeName},</p>`;
    }

    return { title, mainContent };
  };

  const sendEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Funcionalidad de envío de correo en desarrollo");
  };

  const { title, mainContent } = getEmailContent();

  return (
    <div className="my-24 h-3/4 min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="p-8">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              Sistema de Plantillas de Correo
            </h1>

            {!formData.previewMode ? (
              <form onSubmit={sendEmail} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Correo del Cliente
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Tarea</label>
                  <select
                    name="taskType"
                    value={formData.taskType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="quote">Envío de Cotización</option>
                    <option value="payment">Confirmación de Pago</option>
                    <option value="license">Envío de Licencia</option>
                    <option value="update">Confirmación de Actualización</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Producto/Servicio
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isContPAQi"
                    checked={formData.isContPAQi}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    ¿Es un producto o servicio de ContPAQi?
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Información Adicional
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Vista Previa
                  </button>
                  <button
                    type="submit"
                    className="rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Enviar Correo
                  </button>
                </div>
              </form>
            ) : (
              <div className="email-preview">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Vista Previa del Correo</h2>
                  <div className="space-x-2">
                    <button
                      onClick={togglePreview}
                      className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                    >
                      Volver al Formulario
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                  <div className="bg-gray-800 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{title}</h3>
                      <div>
                        <img
                          src="/images/logo_uc_orange_hd.svg"
                          alt="Unidad C Logo"
                          width={190}
                          height={48}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6">
                    <div dangerouslySetInnerHTML={{ __html: mainContent }}></div>

                    <div className="my-6 text-center">
                      <a
                        href="https://wa.me/5215660000199"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-md bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
                      >
                        📞 Contáctanos por WhatsApp
                      </a>
                    </div>

                    {formData.isContPAQi && (
                      <div className="mt-6 flex justify-center">
                        <div className="mx-auto">
                          <img
                            src="/marcas/contpaqi.svg"
                            alt="ContPAQi"
                            width={150}
                            height={75}
                            className="mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
                    <p>Consultoría y Soluciones en TI</p>
                    <p className="mt-2">
                      Correo: info@unidadc.com
                      <br />
                      Teléfono: 566 000 0199
                      <br />
                      <a href="https://www.unidadc.com" className="text-blue-600 hover:underline">
                        www.unidadc.com
                      </a>
                    </p>
                    <p className="mt-2">Mérida, Yucatán, México</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

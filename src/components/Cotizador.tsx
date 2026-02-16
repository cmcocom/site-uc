"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  fontSizes,
  fontFamilies,
  fontWeights,
  lineHeights,
  letterSpacings,
  applyTypography,
  applyTypographyToAll,
} from "../styles/typography";
import { NumerosALetras } from "numero-a-letras";

// Este componente se renderizará solo del lado del cliente
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// Modificamos la función getSimpleQuoteId para que acepte un número aleatorio opcional
const getSimpleQuoteId = (randomNum?: number) => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const suffix = randomNum ? randomNum.toString().padStart(3, "0") : "233";
  return `C${year}${month}${day}-${suffix}`;
};

// Actualizar la función validatePhone para el nuevo formato
const validatePhone = (phone: string) => {
  const phoneRegex = /^\+\d{2}\s\(\d{3}\)\s\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

// Add this validation function near your other utility functions
const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

interface Producto {
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioCompra: number;
  moneda: "MXN" | "USD";
  margen: number;
  precio: number;
  importe: number;
  descuento: number;
  total: number;
}

interface ClientData {
  nombre: string;
  fecha: string;
  rfc: string;
  contacto: string;
  correo: string;
  telefono: string;
  moneda: "MXN" | "USD";
  t_c: string | number;
  observaciones: string;
}

export default function Cotizacion() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [usdDof, setUsdDof] = useState(0);
  const [moneda, setMoneda] = useState<"MXN" | "USD">("MXN");

  // Añadimos el estado para el ID
  const [quoteId, setQuoteId] = useState("");

  // Fetch exchange rate from local API proxy
  useEffect(() => {
    const fetchBanxicoRate = async () => {
      try {
        const response = await fetch("/api/exchange-rate");
        if (!response.ok) throw new Error("API error");

        const data = await response.json();
        if (data.rate) {
          const rate = parseFloat(data.rate);
          setExchangeRate(rate + 0.15);
        }
      } catch {
        // Exchange rate fetch failed silently
      }
    };

    fetchBanxicoRate();
  }, []);

  useEffect(() => {
    if (exchangeRate) {
      setUsdDof(exchangeRate);
    }
  }, [exchangeRate]);

  useEffect(() => {
    // Establecer la fecha actual y el ID de cotización
    const today = new Date().toISOString().split("T")[0];
    setClientData((prev) => ({
      ...prev,
      fecha: today,
    }));
    setQuoteId(getSimpleQuoteId(Math.floor(Math.random() * 999)));
  }, []);

  // Estado para los productos
  const [productos, setProductos] = useState<Producto[]>([
    {
      codigo: "",
      descripcion: "",
      cantidad: 0,
      unidad: "",
      precioCompra: 0,
      moneda: "MXN",
      margen: 0,
      precio: 0,
      importe: 0,
      descuento: 0,
      total: 0,
    },
  ]);

  // Estado para los datos del cliente
  const [clientData, setClientData] = useState<ClientData>({
    nombre: "",
    fecha: "",
    rfc: "",
    contacto: "",
    correo: "",
    telefono: "",
    moneda: "MXN",
    t_c: "" as string | number,
    observaciones: "",
  });

  // Actualizar usd_dof en clientData cuando cambie usdDof
  useEffect(() => {
    if (usdDof) {
      setClientData((prev) => ({
        ...prev,
        t_c: usdDof,
      }));
    }
  }, [usdDof]);

  // Función auxiliar para formatear inputs numéricos
  const formatNumberInputHandlers = (
    field: string,
    idx: number,
    value: number,
    onChange: (idx: number, field: string, value: number) => void
  ) => {
    return {
      value:
        field === "precio"
          ? value.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
              minimumFractionDigits: 2,
            })
          : value.toLocaleString("es-MX"),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const limpio = e.target.value.replace(/[^0-9.]/g, "").replace(/^(\d*\.\d{0,2}).*$/, "$1");
        const nuevoValor = parseFloat(limpio);
        onChange(idx, field, isNaN(nuevoValor) ? 0 : nuevoValor);
      },
      inputMode: "decimal" as const,
    };
  };

  // Separamos el cálculo de los totales en dos partes:
  // 1. Totales en la moneda original de cada producto (independiente de la moneda del cliente)
  const calcularTotalesOriginales = useCallback(() => {
    let importe = 0;
    let descuento = 0;

    productos.forEach((item) => {
      importe += item.importe;
      descuento += item.importe - item.total;
    });

    const subtotal = importe - descuento;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return { importe, descuento, subtotal, iva, total };
  }, [productos]);

  // 2. Función para convertir los totales a la moneda del cliente (sólo para mostrar)
  const convertirAMonedaCliente = useCallback(
    (valor: number, monedaProducto: "MXN" | "USD") => {
      if (monedaProducto === moneda) return valor;

      if (monedaProducto === "USD" && moneda === "MXN") {
        return valor * usdDof;
      } else if (monedaProducto === "MXN" && moneda === "USD") {
        return valor / usdDof;
      }

      return valor;
    },
    [moneda, usdDof]
  );

  // Modificar la función handleClientChange
  const handleClientChange = (field: string, value: string) => {
    if (field === "moneda") {
      setClientData((prev) => ({
        ...prev,
        moneda: value as "MXN" | "USD",
        t_c: usdDof,
      }));

      setMoneda(value as "MXN" | "USD");

      setProductos((prevProductos) =>
        prevProductos.map((producto) => {
          const updatedProduct = { ...producto };
          return {
            ...updatedProduct,
            moneda: updatedProduct.moneda,
            precio: updatedProduct.precio,
            importe: updatedProduct.importe,
            total: updatedProduct.total,
          };
        })
      );
    } else {
      setClientData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Modificar la función handleProductChange
  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updatedProductos = [...productos];
    const currentProduct = { ...updatedProductos[index] };

    // Actualizar el campo modificado
    if (field === "moneda") {
      currentProduct.moneda = value as "MXN" | "USD";
    } else {
      (currentProduct as Record<string, string | number>)[field] = typeof value === "string" ? value : Number(value);
    }

    const precioCompra = currentProduct.precioCompra || 0;
    const margen = currentProduct.margen || 0;
    const cantidad = currentProduct.cantidad || 0;
    const descuento = currentProduct.descuento || 0;

    currentProduct.precio = precioCompra / (1 - margen / 100);
    currentProduct.importe = currentProduct.precio * cantidad;
    currentProduct.total = currentProduct.importe * (1 - descuento / 100);

    updatedProductos[index] = currentProduct;
    setProductos(updatedProductos);
  };

  // Función para agregar nuevo producto
  const handleAddProduct = () => {
    setProductos([
      ...productos,
      {
        codigo: "",
        descripcion: "",
        cantidad: 0,
        unidad: "",
        precioCompra: 0,
        moneda: "MXN",
        margen: 0,
        precio: 0,
        importe: 0,
        descuento: 0,
        total: 0,
      },
    ]);
  };

  // Función para eliminar producto
  const handleDeleteProduct = (index: number) => {
    setProductos(productos.filter((_, idx) => idx !== index));
  };

  // Función para generar nuevo ID
  const handleQuoteRefresh = () => {
    const randomNum = Math.floor(Math.random() * 999);
    setQuoteId(getSimpleQuoteId(randomNum));
  };

  const handleFullPagePDF = async () => {
    let elementClone: HTMLElement | null = null;

    try {
      const element = contentRef.current;
      if (!element) {
        throw new Error("No se encontró el elemento a convertir");
      }

      if (!clientData.fecha) {
        setClientData((prev) => ({
          ...prev,
          fecha: new Date().toISOString().split("T")[0],
        }));
      }

      elementClone = element.cloneNode(true) as HTMLElement;
      if (!elementClone) {
        throw new Error("Falló la clonación del elemento");
      }

      elementClone.style.width = "27.94cm";
      elementClone.style.padding = "0";
      elementClone.style.margin = "0";
      elementClone.style.boxSizing = "border-box";
      elementClone.style.position = "absolute";
      elementClone.style.left = "-9999px";
      elementClone.style.transform = "none";
      elementClone.style.transformOrigin = "top left";
      document.body.appendChild(elementClone);

      const marginCm = 1.5;
      const pageWidth = 11 * 2.54;
      const pageHeight = 8.5 * 2.54;
      const contentWidth = pageWidth - 2 * marginCm;
      const contentHeight = pageHeight - 2 * marginCm;
      const scale = 1;

      elementClone.style.width = `${contentWidth / scale}cm`;
      elementClone.style.height = `${contentHeight / scale}cm`;
      elementClone.style.backgroundColor = "#FFFFFF";
      elementClone.style.transformOrigin = "top left";
      elementClone.style.transform = `scale(${scale})`;
      elementClone.style.overflow = "visible";

      const refreshButton = elementClone.querySelector('button[title="Generar nueva cotización"]');
      if (refreshButton) {
        (refreshButton as HTMLElement).style.display = "none";
      }

      try {
        const allStrongTags = elementClone.querySelectorAll("strong");
        for (let strong of allStrongTags) {
          if (strong.textContent?.includes("T. C.")) {
            let parent = strong.parentElement;
            while (parent && parent.tagName !== "DIV") {
              parent = parent.parentElement;
            }

            if (parent && parent.classList.contains("flex")) {
              (parent as HTMLElement).style.display = "none";
              break;
            }
          }
        }
      } catch {
        // T.C. hiding failed silently
      }

      applyTypographyToAll(elementClone, {
        fontSize: fontSizes.xs,
        fontFamily: fontFamilies.primary,
        lineHeight: lineHeights.normal,
        letterSpacing: letterSpacings.normal,
      });

      const title = elementClone.querySelector(".text-2xl");
      if (title) {
        applyTypography(title as HTMLElement, {
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.bold,
        });
      }

      const table = elementClone.querySelector("table");
      if (table) {
        const headerCells = table.querySelectorAll("thead th");
        headerCells.forEach((cell) => {
          (cell as HTMLElement).style.verticalAlign = "middle";
          (cell as HTMLElement).style.height = "32px";
          (cell as HTMLElement).style.lineHeight = "1";
        });

        const tbody = table.querySelector("tbody");
        if (tbody) {
          tbody.innerHTML = "";

          productos.forEach((producto, idx) => {
            const row = document.createElement("tr");
            row.className = "border-t";

            const cells = [];

            cells.push(`<td class="p-1 border text-center">${idx + 1}</td>`);
            cells.push(`<td class="p-1 border">${producto.codigo || "--"}</td>`);
            cells.push(`<td class="p-1 border text-left">${producto.descripcion || "--"}</td>`);
            cells.push(`<td class="p-1 border text-center">${producto.unidad || "--"}</td>`);
            cells.push(`<td class="p-1 border text-right">${producto.precioCompra || "0"}</td>`);
            cells.push(`<td class="p-1 border text-center">${producto.cantidad || "0"}</td>`);
            cells.push(`<td class="p-1 border text-center">${producto.moneda || "MXN"}</td>`);
            cells.push(`<td class="p-1 border text-center">${producto.margen || "0"}</td>`);

            const currency = moneda === "USD" ? "USD" : "MXN";
            const locale = moneda === "USD" ? "en-US" : "es-MX";

            let rawPrice;
            if (moneda === "USD") {
              rawPrice = producto.moneda === "MXN" ? producto.precio / usdDof : producto.precio;
            } else {
              rawPrice = producto.moneda === "USD" ? producto.precio * usdDof : producto.precio;
            }
            const priceTrunc = Math.floor(rawPrice * 100) / 100;
            cells.push(
              `<td class="p-1 border text-right">${priceTrunc.toLocaleString(locale, {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>`
            );

            let rawImporte;
            if (moneda === "USD") {
              rawImporte = producto.moneda === "MXN" ? producto.importe / usdDof : producto.importe;
            } else {
              rawImporte = producto.moneda === "USD" ? producto.importe * usdDof : producto.importe;
            }
            const importeTrunc = Math.floor(rawImporte * 100) / 100;
            cells.push(
              `<td class="p-1 border text-right">${importeTrunc.toLocaleString(locale, {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>`
            );

            cells.push(`<td class="p-1 border text-center">${producto.descuento || "0"}%</td>`);

            let rawTotal;
            if (moneda === "USD") {
              rawTotal = producto.moneda === "MXN" ? producto.total / usdDof : producto.total;
            } else {
              rawTotal = producto.moneda === "USD" ? producto.total * usdDof : producto.total;
            }
            const totalTrunc = Math.floor(rawTotal * 100) / 100;
            cells.push(
              `<td class="p-1 border text-right">${totalTrunc.toLocaleString(locale, {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</td>`
            );

            row.innerHTML = cells.join("");
            tbody.appendChild(row);
          });
        }
      }

      const inputs = elementClone.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        const span = document.createElement("span");
        applyTypography(span, {
          fontSize: fontSizes.xs,
          fontFamily: fontFamilies.primary,
        });

        let value = "";
        const inputEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (inputEl.getAttribute("name") === "fecha" || (inputEl as HTMLInputElement).type === "date") {
          if (clientData.fecha) {
            try {
              const [year, month, day] = clientData.fecha.split("-");
              const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              value = fechaLocal.toLocaleDateString("es-MX");
            } catch {
              value = new Date().toLocaleDateString("es-MX");
            }
          } else {
            value = new Date().toLocaleDateString("es-MX");
          }
        } else if ((inputEl as HTMLInputElement).type === "email") {
          value = (inputEl as HTMLInputElement).value.toLowerCase();
        } else if (inputEl.tagName.toLowerCase() === "select") {
          if (
            (inputEl as HTMLSelectElement).closest("[data-moneda-client]") ||
            (inputEl.previousElementSibling &&
              inputEl.previousElementSibling.textContent?.includes("MONEDA"))
          ) {
            value = moneda || "MXN";
          } else if (
            (inputEl as HTMLSelectElement).hasAttribute("data-unidad") ||
            (inputEl as HTMLSelectElement).id === "unidad"
          ) {
            const row = (inputEl as HTMLSelectElement).closest("tr");
            if (row) {
              const rowIndex = Array.from(row.parentNode!.children).indexOf(row);
              value = productos[rowIndex]?.unidad || "--";
            } else {
              value = (inputEl as HTMLSelectElement).value || "--";
            }
          } else {
            value = (inputEl as HTMLSelectElement).value || "--";
          }
        } else {
          value = (inputEl as HTMLInputElement | HTMLTextAreaElement).value;
        }

        span.textContent = value || "--";
        inputEl.replaceWith(span);
      });

      const actionButtons = elementClone.querySelectorAll(".group-hover\\:opacity-100");
      actionButtons.forEach((button) => button.remove());

      const sectionTitles = elementClone.querySelectorAll("#footersheet h2");
      sectionTitles.forEach((title) => {
        applyTypography(title as HTMLElement, {
          fontSize: fontSizes.sm,
          fontFamily: fontFamilies.primary,
          fontWeight: fontWeights.bold,
        });
      });

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(elementClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        imageTimeout: 30000,
        logging: false,
        width: elementClone.offsetWidth,
        height: elementClone.offsetHeight,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.querySelector("[data-content]") as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = "100%";
          }
        },
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "cm",
        format: "letter",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 1.5;

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        margin,
        pdfWidth - margin * 2,
        pdfHeight - margin * 2,
        undefined,
        "FAST"
      );

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      alert("Error al generar el PDF. Por favor, intente nuevamente: " + (error as Error).message);
    } finally {
      if (elementClone && elementClone.parentNode) {
        document.body.removeChild(elementClone);
      }
    }
  };

  const handlePagePDF = async () => {
    let elementClone: HTMLElement | null = null;

    try {
      const element = contentRef.current;
      if (!element) {
        throw new Error("No se encontró el elemento a convertir");
      }

      if (!clientData.fecha) {
        setClientData((prev) => ({
          ...prev,
          fecha: new Date().toISOString().split("T")[0],
        }));
      }

      elementClone = element.cloneNode(true) as HTMLElement;
      if (!elementClone) {
        throw new Error("Falló la clonación del elemento");
      }

      elementClone.style.width = "21.59cm";
      elementClone.style.padding = "0";
      elementClone.style.margin = "0";
      elementClone.style.boxSizing = "border-box";
      elementClone.style.position = "absolute";
      elementClone.style.left = "-9999px";
      elementClone.style.transform = "none";
      elementClone.style.transformOrigin = "top left";
      document.body.appendChild(elementClone);

      const marginCm = 1.5;
      const pageWidth = 8.5 * 2.54;
      const pageHeight = 11 * 2.54;
      const contentWidth = pageWidth - 2 * marginCm;
      const contentHeight = pageHeight - 2 * marginCm;
      const scale = 1;

      elementClone.style.width = `${contentWidth / scale}cm`;
      elementClone.style.height = `${contentHeight / scale}cm`;
      elementClone.style.backgroundColor = "#FFFFFF";
      elementClone.style.transformOrigin = "top left";
      elementClone.style.transform = `scale(${scale})`;
      elementClone.style.overflow = "visible";

      const refreshButton = elementClone.querySelector('button[title="Generar nueva cotización"]');
      if (refreshButton) {
        (refreshButton as HTMLElement).style.display = "none";
      }

      try {
        const allStrongTags = elementClone.querySelectorAll("strong");
        for (let strong of allStrongTags) {
          if (strong.textContent?.includes("T. C.")) {
            let parent = strong.parentElement;
            while (parent && parent.tagName !== "DIV") {
              parent = parent.parentElement;
            }

            if (parent && parent.classList.contains("flex")) {
              (parent as HTMLElement).style.display = "none";
              break;
            }
          }
        }
      } catch {
        // T.C. hiding failed silently
      }

      applyTypographyToAll(elementClone, {
        fontSize: fontSizes.xs,
        fontFamily: fontFamilies.primary,
        lineHeight: lineHeights.normal,
        letterSpacing: letterSpacings.normal,
      });

      const title = elementClone.querySelector(".text-2xl");
      if (title) {
        applyTypography(title as HTMLElement, {
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.bold,
        });
      }

      const table = elementClone.querySelector("table");
      if (table) {
        const hayDescuentos = productos.some((producto) => producto.descuento > 0);
        let columnsToHide = [0, 1, 4, 6, 7];

        if (!hayDescuentos) {
          columnsToHide.push(10);
        }

        const headerCells = table.querySelectorAll("thead th");
        headerCells.forEach((cell, index) => {
          (cell as HTMLElement).style.verticalAlign = "middle";
          (cell as HTMLElement).style.height = "32px";
          (cell as HTMLElement).style.lineHeight = "1";

          if (columnsToHide.includes(index)) {
            (cell as HTMLElement).style.display = "none";
          }
        });

        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          cells.forEach((cell, index) => {
            (cell as HTMLElement).style.verticalAlign = "middle";
            (cell as HTMLElement).style.height = "32px";
            (cell as HTMLElement).style.lineHeight = "1";

            if (columnsToHide.includes(index)) {
              (cell as HTMLElement).style.display = "none";
            }
          });
        });
      }

      const inputs = elementClone.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        const span = document.createElement("span");
        applyTypography(span, {
          fontSize: fontSizes.xs,
          fontFamily: fontFamilies.primary,
        });

        let value = "";
        const inputEl = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (inputEl.getAttribute("name") === "fecha" || (inputEl as HTMLInputElement).type === "date") {
          if (clientData.fecha) {
            try {
              const [year, month, day] = clientData.fecha.split("-");
              const fechaLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              value = fechaLocal.toLocaleDateString("es-MX");
            } catch {
              value = new Date().toLocaleDateString("es-MX");
            }
          } else {
            value = new Date().toLocaleDateString("es-MX");
          }
        } else if ((inputEl as HTMLInputElement).type === "email") {
          value = (inputEl as HTMLInputElement).value.toLowerCase();
        } else if (inputEl.tagName.toLowerCase() === "select") {
          if (
            (inputEl as HTMLSelectElement).closest("[data-moneda-client]") ||
            (inputEl.previousElementSibling &&
              inputEl.previousElementSibling.textContent?.includes("MONEDA"))
          ) {
            value = moneda || "MXN";
          } else if (
            (inputEl as HTMLSelectElement).hasAttribute("data-unidad") ||
            (inputEl as HTMLSelectElement).id === "unidad"
          ) {
            const row = (inputEl as HTMLSelectElement).closest("tr");
            if (row) {
              const rowIndex = Array.from(row.parentNode!.children).indexOf(row);
              value = productos[rowIndex]?.unidad || "--";
            } else {
              value = (inputEl as HTMLSelectElement).value || "--";
            }
          } else {
            value = (inputEl as HTMLSelectElement).value || "--";
          }
        } else {
          value = (inputEl as HTMLInputElement | HTMLTextAreaElement).value;
        }

        span.textContent = value || "--";
        inputEl.replaceWith(span);
      });

      const actionButtons = elementClone.querySelectorAll(".group-hover\\:opacity-100");
      actionButtons.forEach((button) => button.remove());

      const sectionTitles = elementClone.querySelectorAll("#footersheet h2");
      sectionTitles.forEach((title) => {
        applyTypography(title as HTMLElement, {
          fontSize: fontSizes.sm,
          fontFamily: fontFamilies.primary,
          fontWeight: fontWeights.bold,
        });
      });

      const footer = document.createElement("div");
      footer.style.position = "absolute";
      footer.style.bottom = "0.5in";
      footer.style.left = "0";
      footer.style.right = "0";
      footer.style.textAlign = "center";

      applyTypography(footer, {
        fontSize: fontSizes.xs,
        fontFamily: fontFamilies.primary,
      });
      footer.style.color = "#666666";

      footer.innerHTML = `
      <p>Consultoría y Soluciones en TI</p>
      <p>www.unidadc.com</p>
    `;
      elementClone.appendChild(footer);

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(elementClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        imageTimeout: 30000,
        logging: false,
        width: elementClone.offsetWidth,
        height: elementClone.offsetHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "cm",
        format: "letter",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 1.5;

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        margin,
        pdfWidth - margin * 2,
        pdfHeight - margin * 2,
        undefined,
        "FAST"
      );

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      alert("Error al generar el PDF. Por favor, intente nuevamente: " + (error as Error).message);
    } finally {
      if (elementClone && elementClone.parentNode) {
        document.body.removeChild(elementClone);
      }
    }
  };

  const totales = useMemo(() => {
    const totalesOriginales = calcularTotalesOriginales();

    let importeEnMonedaCliente = 0;
    let descuentoEnMonedaCliente = 0;

    productos.forEach((item) => {
      const importeConvertido = convertirAMonedaCliente(item.importe, item.moneda);
      const totalConvertido = convertirAMonedaCliente(item.total, item.moneda);

      importeEnMonedaCliente += importeConvertido;
      descuentoEnMonedaCliente += importeConvertido - totalConvertido;
    });

    const subtotalConvertido = importeEnMonedaCliente - descuentoEnMonedaCliente;
    const ivaConvertido = subtotalConvertido * 0.16;
    const totalConvertido = subtotalConvertido + ivaConvertido;

    return {
      impTrunc: Math.floor(importeEnMonedaCliente * 100) / 100,
      descTrunc: Math.floor(descuentoEnMonedaCliente * 100) / 100,
      subTrunc: Math.floor(subtotalConvertido * 100) / 100,
      ivaTrunc: Math.floor(ivaConvertido * 100) / 100,
      totalRounded: Math.floor(totalConvertido * 100) / 100,
      originales: totalesOriginales,
    };
  }, [productos, calcularTotalesOriginales, convertirAMonedaCliente]);

  const cantidadEnLetras = useMemo(() => {
    const texto = NumerosALetras(totales.totalRounded);
    if (moneda === "USD") {
      return texto
        .replace("Pesos", "Dólares")
        .replace("Peso", "Dólar")
        .replace(/\/100 M\.N\./g, "/100 USD");
    }
    return texto;
  }, [totales.totalRounded, moneda]);

  const currency = moneda === "USD" ? "USD" : "MXN";
  const locale = moneda === "USD" ? "en-US" : "es-MX";

  return (
    <div
      className="pb-28 pt-28 print:mb-6 print:mt-6"
      style={{
        backgroundImage: "url(/images/bg_qr.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <div
        ref={contentRef}
        className="mx-auto min-h-[800px] w-full max-w-[1280px] bg-white p-[1.5cm] font-sans text-gray-700 print:min-h-[800px] print:w-[1280px] print:overflow-visible print:p-[1.5cm]"
        style={{
          fontSize: fontSizes.base,
          fontFamily: fontFamilies.primary,
          width: "1280px",
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        <div className="mb-3 grid grid-cols-2 items-center">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-2xl font-bold text-gray-600">COTIZACIÓN</h1>
            <div className="flex items-center gap-2 text-[9pt]">
              <span className="mt-1 text-gray-500">{quoteId}</span>
              <button
                onClick={handleQuoteRefresh}
                className="mt-1 text-blue-600 hover:text-blue-700 focus:outline-none"
                title="Generar nueva cotización"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <img
              src="/formatos/logo_uc_sheets.svg"
              alt="Logo Unidad C"
              width="200"
              height="80"
              className="mb-3 object-contain"
            />
          </div>
        </div>

        <div
          className="mb-3 flex flex-row justify-between border border-gray-300 p-4"
          style={{ fontSize: fontSizes.base, fontFamily: fontFamilies.primary }}
        >
          <div className="flex w-full flex-col gap-4 leading-tight">
            <div className="flex items-center justify-between">
              <div className="flex w-[60%] items-center">
                <strong className="mr-2 whitespace-nowrap">NOMBRE:</strong>
                <input
                  type="text"
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.nombre}
                  onChange={(e) => handleClientChange("nombre", e.target.value)}
                  className="h-[24px] w-[calc(100%-80px)] text-left uppercase focus:outline-none"
                  placeholder="NOMBRE COMPLETO"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex w-[60%] items-center">
                <strong className="mr-2 whitespace-nowrap">RFC:</strong>
                <input
                  type="text"
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.rfc}
                  onChange={(e) => handleClientChange("rfc", e.target.value)}
                  className="h-[24px] w-[calc(100%-60px)] text-left uppercase focus:outline-none"
                  placeholder="RFC"
                  maxLength={13}
                />
              </div>
              <div className="flex w-[40%] items-center justify-end">
                <strong className="mr-2 whitespace-nowrap">FECHA:</strong>
                <input
                  type="date"
                  name="fecha"
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.fecha}
                  onChange={(e) => handleClientChange("fecha", e.target.value)}
                  className="h-[24px] text-left focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex w-[60%] items-center">
                <strong className="mr-2 whitespace-nowrap">CONTACTO:</strong>
                <input
                  type="text"
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.contacto}
                  onChange={(e) => handleClientChange("contacto", e.target.value)}
                  className="h-[24px] w-[calc(100%-90px)] text-left focus:outline-none"
                  placeholder="NOMBRE DE CONTACTO"
                />
              </div>
              <div className="flex w-[40%] justify-end">
                <strong className="mr-2 whitespace-nowrap">T. C.:</strong>
                <input
                  type="text"
                  style={{ fontSize: fontSizes.base }}
                  value={
                    typeof usdDof === "number"
                      ? usdDof.toFixed(4)
                      : parseFloat(String(usdDof) || "0").toFixed(4)
                  }
                  readOnly
                  className="h-[24px] w-[80px] text-right focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex w-[60%] items-center">
                <strong className="mr-2 whitespace-nowrap">CORREO:</strong>
                <input
                  type="email"
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.correo}
                  onChange={(e) => handleClientChange("correo", e.target.value)}
                  className={`h-[24px] w-[calc(100%-80px)] text-left lowercase focus:outline-none ${
                    clientData.correo && !validateEmail(clientData.correo) ? "border-red-500" : ""
                  }`}
                  placeholder="ejemplo@dominio.com"
                />
              </div>
              <div className="flex w-[40%] items-center justify-end">
                <strong className="mr-2 whitespace-nowrap">MONEDA:</strong>
                <select
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.moneda}
                  onChange={(e) => handleClientChange("moneda", e.target.value)}
                  className="w-[80px] focus:outline-none"
                  data-moneda-client="true"
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex w-[60%] items-center">
                <strong className="mr-2 whitespace-nowrap">TELÉFONO:</strong>
                <input
                  type="tel"
                  style={{ fontSize: fontSizes.base }}
                  value={clientData.telefono}
                  onChange={(e) => handleClientChange("telefono", e.target.value)}
                  className={`h-[24px] w-[calc(100%-90px)] text-left focus:outline-none ${
                    clientData.telefono && !validatePhone(clientData.telefono)
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="(555) 123-4567"
                  maxLength={16}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <table
            className="w-full border border-gray-300"
            style={{ fontSize: fontSizes.base, fontFamily: fontFamilies.primary }}
          >
            <thead className="items-center justify-items-center bg-[#FF7F00] text-left text-white">
              <tr>
                <>
                  <th className="border p-1">ID</th>
                  <th className="border p-1">CÓDIGO</th>
                </>
                <th className="border p-1">DESCRIPCIÓN</th>
                <th className="border p-1">UNIDAD</th>
                <th className="border p-1">PRECIO COMPRA</th>
                <th className="border p-1">CANTIDAD</th>
                <>
                  <th className="border p-1">MONEDA</th>
                  <th className="border p-1">MARGEN</th>
                </>
                <th className="border p-1">PRECIO</th>
                <th className="border p-1">IMPORTE</th>
                <th className="border p-1">DESCUENTO</th>
                <th className="border p-1">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((item, idx) => (
                <tr key={idx} className="group relative border-t">
                  <>
                    <td className="border p-1 text-center">{idx + 1}</td>
                    <td className="border p-1">
                      <input
                        type="text"
                        style={{ fontSize: fontSizes.base }}
                        value={item.codigo}
                        onChange={(e) => handleProductChange(idx, "codigo", e.target.value)}
                        className="w-full bg-transparent p-1 focus:outline-1"
                      />
                    </td>
                  </>
                  <td className="border p-1">
                    <textarea
                      style={{ fontSize: fontSizes.base }}
                      value={item.descripcion}
                      onChange={(e) => {
                        const text = e.target.value;
                        if (text.length <= 300) {
                          handleProductChange(idx, "descripcion", text);
                        }
                      }}
                      maxLength={300}
                      rows={2}
                      className="max-h-[120px] min-h-[40px] w-full resize-y bg-transparent p-1 focus:outline-1"
                      placeholder="Descripción del producto (máx. 300 caracteres)"
                    />
                  </td>
                  <td className="border p-2">
                    <select
                      style={{ fontSize: fontSizes.base }}
                      value={item.unidad}
                      onChange={(e) => handleProductChange(idx, "unidad", e.target.value)}
                      className="w-full bg-transparent p-1 text-center focus:outline-1"
                      id="unidad"
                      data-unidad="true"
                    >
                      <option value="">Seleccionar</option>
                      <option value="SERVICIO">SERVICIO</option>
                      <option value="PIEZA">PIEZA</option>
                      <option value="UNIDAD">UNIDAD</option>
                      <option value="METRO">METRO</option>
                      <option value="LICENCIA PERPETUA">LICENCIA PERPETUA</option>
                      <option value="LICENCIA ANUAL">LICENCIA ANUAL</option>
                      <option value="LICENCIA MENSUAL">LICENCIA MENSUAL</option>
                      <option value="HORA">HORA SERVICIO</option>
                      <option value="DIA">DIA SERVICIO</option>
                    </select>
                  </td>
                  <td className="border p-1">
                    <input
                      style={{ fontSize: fontSizes.base }}
                      type="number"
                      min="0"
                      value={item.precioCompra}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        handleProductChange(idx, "precioCompra", isNaN(value) ? 0 : value);
                      }}
                      className="w-full bg-transparent p-1 text-right focus:outline-1"
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      style={{ fontSize: fontSizes.base }}
                      type="number"
                      {...formatNumberInputHandlers(
                        "cantidad",
                        idx,
                        item.cantidad,
                        handleProductChange
                      )}
                      className="w-full bg-transparent p-1 text-center focus:outline-1"
                    />
                  </td>
                  <>
                    <td className="border p-1">
                      <select
                        style={{ fontSize: fontSizes.base }}
                        value={item.moneda}
                        onChange={(e) => handleProductChange(idx, "moneda", e.target.value)}
                        className="w-full bg-transparent p-1 text-center focus:outline-1"
                      >
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                      </select>
                    </td>
                    <td className="border p-1">
                      <input
                        style={{ fontSize: fontSizes.base }}
                        type="number"
                        min="0"
                        max="100"
                        value={item.margen}
                        onChange={(e) => {
                          const value = Math.min(Math.max(0, parseFloat(e.target.value)), 100);
                          handleProductChange(idx, "margen", isNaN(value) ? 0 : value);
                        }}
                        className="w-full bg-transparent p-1 text-center focus:outline-1"
                        placeholder="%"
                      />
                    </td>
                  </>
                  <td className="border p-1 text-right text-sm">
                    {(() => {
                      const currency = moneda === "USD" ? "USD" : "MXN";
                      const locale = moneda === "USD" ? "en-US" : "es-MX";
                      let raw = item.precio;

                      if (item.moneda !== moneda) {
                        raw = convertirAMonedaCliente(raw, item.moneda);
                      }

                      const valTrunc = Math.floor(raw * 100) / 100;
                      return valTrunc.toLocaleString(locale, {
                        style: "currency",
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    })()}
                  </td>
                  <td className="border p-1 text-right text-sm">
                    {(() => {
                      const currency = moneda === "USD" ? "USD" : "MXN";
                      const locale = moneda === "USD" ? "en-US" : "es-MX";
                      let raw = item.importe;

                      if (item.moneda !== moneda) {
                        raw = convertirAMonedaCliente(raw, item.moneda);
                      }

                      const valTrunc = Math.floor(raw * 100) / 100;
                      return valTrunc.toLocaleString(locale, {
                        style: "currency",
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    })()}
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      style={{ fontSize: fontSizes.base }}
                      min="0"
                      max="100"
                      value={item.descuento}
                      onChange={(e) => {
                        const value = Math.min(Math.max(0, parseFloat(e.target.value)), 100);
                        handleProductChange(idx, "descuento", isNaN(value) ? 0 : value);
                      }}
                      className="w-full bg-transparent p-1 text-center"
                    />
                  </td>
                  <td className="border p-1 text-right text-sm">
                    {(() => {
                      const currency = moneda === "USD" ? "USD" : "MXN";
                      const locale = moneda === "USD" ? "en-US" : "es-MX";
                      let raw = item.total;

                      if (item.moneda !== moneda) {
                        raw = convertirAMonedaCliente(raw, item.moneda);
                      }

                      const valTrunc = Math.floor(raw * 100) / 100;
                      return valTrunc.toLocaleString(locale, {
                        style: "currency",
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    })()}
                  </td>
                  <>
                    <td className="absolute p-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteProduct(idx)}
                        className="rounded bg-white px-2 py-1 text-red-500 shadow hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </>
                  <>
                    <td className="absolute -left-16 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={handleAddProduct}
                        className="rounded bg-white px-2 py-1 text-blue-500 shadow hover:text-blue-700"
                      >
                        Agregar
                      </button>
                    </td>
                  </>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="mb-3 break-inside-avoid text-left leading-tight"
          style={{ fontSize: fontSizes.base, fontFamily: fontFamilies.primary }}
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="w-2/3 pr-4">
              <strong>Observaciones: </strong>
              <textarea
                style={{ fontSize: fontSizes.base }}
                value={clientData.observaciones}
                onChange={(e) => handleClientChange("observaciones", e.target.value)}
                className="mb-2 mt-1 w-full rounded border border-gray-300 p-2"
                rows={2}
                placeholder="Agregar observaciones"
              />

              <p className="mt-2">Cantidad en letras:</p>
              <p>
                <strong>{cantidadEnLetras}</strong>
              </p>
            </div>
            <div className="w-1/3 space-y-1 text-right">
              <p>
                <strong>Importe Total:</strong>{" "}
                {totales.impTrunc.toLocaleString(locale, {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p>
                <strong>Descuento:</strong>{" "}
                {totales.descTrunc.toLocaleString(locale, {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p>
                <strong>Subtotal:</strong>{" "}
                {totales.subTrunc.toLocaleString(locale, {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p>
                <strong>IVA (16%):</strong>{" "}
                {totales.ivaTrunc.toLocaleString(locale, {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p>
                <strong>Total a Pagar:</strong>{" "}
                {totales.totalRounded.toLocaleString(locale, {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div
          id="footersheet"
          className="bottom-6 left-6 right-6 mb-4 grid break-inside-avoid grid-cols-6 gap-2 leading-tight print:relative print:bottom-0 print:left-0"
          style={{ fontSize: fontSizes.base, fontFamily: fontFamilies.primary }}
        >
          <div className="col-span-4">
            <h2 className="mb-1 text-start font-bold">Condiciones Comerciales</h2>
            <ol className="list-inside list-disc text-start leading-tight">
              <li>
                Todos los pedidos requieren un <strong>70 % de anticipo</strong> y el saldo contra
                entrega.
              </li>
              <li>
                Precios en {moneda === "USD" ? "dólares estadounidenses" : "pesos mexicanos"}.
              </li>
              <li>Pagos vía depósito, transferencia, tarjeta o efectivo.</li>
              <li>
                <strong>Total a Pagar incluye IVA.</strong> Precios sujetos a cambios sin previo
                aviso.
              </li>
              <li>
                Incluir número de cotización en la referencia del pago y enviar comprobante a{" "}
                <strong>facturacion@unidadc.com</strong>
              </li>
              <li>No se admiten cancelaciones una vez autorizada la cotización.</li>
              <li>Garantía no cubre mal uso, descargas eléctricas o instalación ajena.</li>
              <li>Entrega sujeta a disponibilidad.</li>
              <li>
                <strong>Unidad C</strong> no se hace responsable por retrasos ajenos.
              </li>
            </ol>
          </div>
          <div className="col-span-2 leading-tight">
            <div className="mb-3">
              <h2 className="mb-1 font-bold">Datos Bancarios</h2>
              <p>
                <strong>Banco:</strong> Banorte
              </p>
              <ClientOnly>
                <p>
                  <strong>Cuenta (MXN):</strong> 0445446593
                </p>
              </ClientOnly>
              <p>
                <strong>CLABE:</strong> 072910004454465933
              </p>
            </div>
            <div>
              <h2 className="mb-1 font-bold">Contacto</h2>
              <p>CRISTIAN MIGUEL COCOM VÁZQUEZ</p>
              <p>
                <strong>COVC-790525-J16</strong>
              </p>
              <p>
                <strong>C. P. 97249.</strong>
              </p>
              <p>Mérida, Yucatán, México</p>
              <ClientOnly>
                <p>
                  <strong>contacto@unidadc.com</strong>
                </p>
                <p>(566) 000 0199</p>
              </ClientOnly>
            </div>
          </div>
        </div>
        <div
          className="mt-auto hidden text-center text-gray-600 print:mt-20 print:block"
          style={{ fontSize: fontSizes.sm, fontFamily: fontFamilies.primary }}
        >
          <p>Consultoría y Soluciones en TI</p>
          <p>www.unidadc.com</p>
        </div>
      </div>
      <div className="fixed bottom-24 right-5 z-40 flex flex-col space-y-3">
        <button
          onClick={handlePagePDF}
          className="rounded-full bg-blue-600 px-6 py-3 text-white shadow-lg hover:bg-blue-700"
        >
          PDF Cliente
        </button>
        <button
          onClick={handleFullPagePDF}
          className="flex items-center space-x-2 rounded-full bg-green-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <span>PDF Unidad C</span>
        </button>
      </div>
    </div>
  );
}

// licenseEstimator.ts - Módulo para la lógica de estimación de licencias Microsoft

import type { LicenseInfo } from "../types/licenses";

interface ProductOption {
  value: string;
  label: string;
  icon?: string;
}

interface LicenseCategory {
  [key: string]: LicenseInfo;
}

interface LicenseData {
  windows: LicenseCategory;
  office: LicenseCategory;
}

interface RecommendationRules {
  windows: {
    [key: string]: string;
  };
  office: {
    [key: string]: string;
  };
}

export interface Recommendation {
  windows: LicenseInfo | null;
  office: LicenseInfo | null;
  reason: string;
  totalEstimate?: string;
  products?: LicenseInfo[];
  note?: string;
}

export const productOptions: ProductOption[] = [
  { value: "windows", label: "Windows 11", icon: "🪟" },
  { value: "office", label: "Office / Microsoft 365", icon: "📊" },
  { value: "exchange", label: "Exchange Online", icon: "📧" },
  { value: "both", label: "Windows + Office", icon: "📦" },
];

export const paymentOptions: ProductOption[] = [
  { value: "perpetual", label: "Pago Único (Perpetua)", icon: "💳" },
  { value: "subscription", label: "Suscripción", icon: "🔄" },
];

export const userTypeOptions: ProductOption[] = [
  { value: "personal", label: "Usuario Personal/Familia", icon: "🏠" },
  { value: "business", label: "Pequeña Empresa", icon: "🏢" },
  { value: "enterprise", label: "Gran Empresa", icon: "🏭" },
  { value: "education", label: "Educación", icon: "🎓" },
];

export const userCountOptions: ProductOption[] = [
  { value: "1", label: "1 usuario" },
  { value: "2-6", label: "2-6 usuarios" },
  { value: "7-25", label: "7-25 usuarios" },
  { value: "26-300", label: "26-300 usuarios" },
  { value: "300+", label: "300+ usuarios" },
];

export const licenseData: LicenseData = {
  windows: {
    oem: {
      name: "Windows 11 OEM",
      price: "$500-$1,200 MXN",
      transferable: false,
      support: "Limitado",
      useCase: "Un equipo permanente",
      pros: ["Más económico", "Activación automática"],
      cons: ["No transferible", "Soporte limitado"],
      icon: "💻",
      description: "Licencia vinculada al hardware",
      idealFor: "Nuevas PC, uso único por equipo",
      features: ["Vinculada al hardware", "Precio más económico", "No transferible"],
    },
    retail: {
      name: "Windows 11 Retail",
      price: "$2,500-$4,500 MXN",
      transferable: true,
      support: "Completo",
      useCase: "Flexibilidad máxima",
      pros: ["Transferible", "Soporte completo"],
      cons: ["Más costoso"],
      icon: "📦",
      description: "Licencia transferible entre equipos",
      idealFor: "Usuarios que cambian de PC frecuentemente",
      features: ["Transferible entre equipos", "Soporte oficial Microsoft", "Mayor inversión inicial"],
    },
    volume: {
      name: "Windows 11 Pro (Volumen)",
      price: "$1,500-$2,000 MXN",
      transferable: true,
      support: "Empresarial",
      useCase: "Despliegues múltiples",
      pros: ["Gestión centralizada", "Activación múltiple"],
      cons: ["Contratos mínimos"],
      icon: "🏢",
      description: "Licencia para despliegues masivos",
      idealFor: "Empresas, organizaciones, despliegues masivos",
      features: ["Activación múltiple", "Gestión centralizada", "Contratos mínimos"],
    },
  },
  office: {
    ltsc2024: {
      name: "Office LTSC 2024 Pro Plus",
      price: "$3,500-$4,500 MXN",
      type: "Perpetua",
      support: "5 años",
      features: ["Word", "Excel", "PowerPoint", "Outlook", "Access", "OneNote"],
      icon: "💳",
      description: "Licencia perpetua de pago único",
      idealFor: "Empresas que prefieren licencias perpetuas",
    },
    m365personal: {
      name: "Microsoft 365 Personal",
      price: "$1,299 MXN/año",
      type: "Suscripción",
      users: 1,
      features: ["Apps actualizadas", "1TB OneDrive", "Soporte 24/7"],
      icon: "🔄",
      description: "Suscripción personal con almacenamiento",
      idealFor: "1 usuario personal",
    },
    m365family: {
      name: "Microsoft 365 Familiar",
      price: "$1,799 MXN/año",
      type: "Suscripción",
      users: 6,
      features: ["6 cuentas", "1TB c/u", "Apps completas"],
      icon: "🔄",
      description: "Suscripción familiar hasta 6 usuarios",
      idealFor: "Hasta 6 usuarios de una familia",
    },
    m365business: {
      name: "Microsoft 365 Business Standard",
      price: "$2,800-$3,200 MXN/año por usuario",
      type: "Suscripción",
      users: "Multiple",
      features: ["Herramientas empresariales", "Teams", "SharePoint"],
      icon: "🏢",
      description: "Suite empresarial completa",
      idealFor: "Pequeñas y medianas empresas",
    },
  },
};

// Reglas de recomendación basadas en criterios
export const recommendationRules: RecommendationRules = {
  windows: {
    "home-perpetual": "oem",
    "home-subscription": "retail",
    "business-perpetual": "volume",
    "business-subscription": "volume",
    "enterprise-perpetual": "volume",
    "enterprise-subscription": "volume",
  },
  office: {
    "home-perpetual-1-5": "ltsc2024",
    "home-subscription-1-5": "m365personal",
    "home-subscription-6-25": "m365family",
    "business-perpetual": "ltsc2024",
    "business-subscription": "m365business",
    "enterprise-perpetual": "ltsc2024",
    "enterprise-subscription": "m365business",
  },
};

/**
 * Genera una recomendación de licencia basada en los criterios seleccionados
 */
export const generateRecommendation = (
  selectedProduct: string,
  selectedPayment: string,
  selectedUserType: string,
  selectedUserCount: string
): Recommendation | null => {
  if (!selectedProduct || !selectedUserType || !selectedPayment) {
    return null;
  }

  const recommendation: Recommendation = {
    windows: null,
    office: null,
    reason: "",
    totalEstimate: "",
  };

  // Generar recomendación para Windows
  if (selectedProduct === "windows" || selectedProduct === "both") {
    const windowsKey = `${selectedUserType}-${selectedPayment}`;
    const windowsType = recommendationRules.windows[windowsKey];
    if (windowsType && licenseData.windows[windowsType]) {
      recommendation.windows = licenseData.windows[windowsType];
    }
  }

  // Generar recomendación para Office
  if (selectedProduct === "office" || selectedProduct === "both") {
    let officeKey = `${selectedUserType}-${selectedPayment}`;

    // Para usuarios personales, considerar la cantidad de usuarios
    if (selectedUserType === "home" && selectedPayment === "subscription" && selectedUserCount) {
      officeKey += `-${selectedUserCount}`;
    }

    const officeType = recommendationRules.office[officeKey];
    if (officeType && licenseData.office[officeType]) {
      recommendation.office = licenseData.office[officeType];
    }
  }

  // Generar razón de la recomendación
  recommendation.reason = generateRecommendationReason(
    selectedUserType,
    selectedPayment,
    selectedUserCount
  );

  return recommendation;
};

/**
 * Genera una explicación de por qué se hizo esta recomendación
 */
const generateRecommendationReason = (
  userType: string,
  payment: string,
  _userCount: string
): string => {
  const reasons: Record<string, string> = {
    "home-perpetual": "Opción más económica para uso personal sin necesidad de actualizaciones continuas",
    "home-subscription": "Flexibilidad y actualizaciones continuas con almacenamiento en la nube",
    "business-perpetual": "Control de costos a largo plazo con gestión centralizada",
    "business-subscription": "Herramientas empresariales modernas con colaboración en tiempo real",
    "enterprise-perpetual": "Gestión a gran escala con control total sobre actualizaciones",
    "enterprise-subscription":
      "Funcionalidades avanzadas de seguridad y administración empresarial",
  };

  const key = `${userType}-${payment}`;
  return (
    reasons[key] ||
    "Esta combinación ofrece la mejor relación costo-beneficio para tu perfil de uso"
  );
};

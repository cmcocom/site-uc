// Typography configuration for the application
// This file centralizes all typography-related settings

// Font families
export const fontFamilies = {
  primary: "Arial, sans-serif",
  secondary: "Helvetica, Arial, sans-serif",
  mono: "Courier New, monospace",
};

// Font sizes (in pt)
export const fontSizes = {
  xs: "7pt",
  sm: "8pt",
  base: "9pt", // Base font size for application
  md: "10pt",
  lg: "12pt",
  xl: "14pt",
  "2xl": "16pt",
  "3xl": "18pt",
  "4xl": "20pt",
};

// Font weights
export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Line heights
export const lineHeights = {
  tight: 1.1,
  normal: 1.2,
  relaxed: 1.4,
  loose: 1.6,
};

// Letter spacing
export const letterSpacings = {
  tight: "-0.01em",
  normal: "0em",
  wide: "0.01em",
};

// Default typography settings
export const defaultTypography = {
  fontFamily: fontFamilies.primary,
  fontSize: fontSizes.base,
  fontWeight: fontWeights.normal,
  lineHeight: lineHeights.normal,
  letterSpacing: letterSpacings.normal,
};

interface TypographyOptions {
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: string;
}

// Helper function to apply typography styles to an element
export const applyTypography = (
  element: HTMLElement | null | undefined,
  {
    fontSize = defaultTypography.fontSize,
    fontFamily = defaultTypography.fontFamily,
    fontWeight = defaultTypography.fontWeight,
    lineHeight = defaultTypography.lineHeight,
    letterSpacing = defaultTypography.letterSpacing,
  }: TypographyOptions = {}
) => {
  if (!element) return;

  element.style.fontSize = fontSize;
  element.style.fontFamily = fontFamily;
  element.style.fontWeight = String(fontWeight);
  element.style.lineHeight = String(lineHeight);
  element.style.letterSpacing = letterSpacing;
};

// Function to apply typography to all elements in a DOM tree
export const applyTypographyToAll = (rootElement: HTMLElement | null | undefined, options: TypographyOptions = {}) => {
  if (!rootElement) return;

  // Apply to root element
  applyTypography(rootElement, options);

  // Apply to all child elements
  const allElements = rootElement.querySelectorAll("*");
  allElements.forEach((element) => {
    applyTypography(element as HTMLElement, options);
  });

  // Special handling for specific elements
  const textInputs = rootElement.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="tel"], textarea, select'
  );
  textInputs.forEach((input) => {
    applyTypography(input as HTMLElement, {
      ...options,
      fontFamily: fontFamilies.primary,
    });
  });

  // Table cells
  const tableCells = rootElement.querySelectorAll("td, th");
  tableCells.forEach((cell) => {
    applyTypography(cell as HTMLElement, {
      ...options,
      fontWeight: (cell as HTMLElement).tagName === "TH" ? fontWeights.semibold : fontWeights.normal,
    });
  });

  // Headings
  const headings = rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((heading) => {
    let headingSize;
    switch ((heading as HTMLElement).tagName) {
      case "H1":
        headingSize = fontSizes["3xl"];
        break;
      case "H2":
        headingSize = fontSizes["2xl"];
        break;
      case "H3":
        headingSize = fontSizes.xl;
        break;
      case "H4":
        headingSize = fontSizes.lg;
        break;
      case "H5":
        headingSize = fontSizes.md;
        break;
      case "H6":
        headingSize = fontSizes.base;
        break;
      default:
        headingSize = fontSizes.base;
    }

    applyTypography(heading as HTMLElement, {
      ...options,
      fontSize: headingSize,
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
    });
  });
};

// Function to apply typography to PDF content
export const applyPdfTypography = (elementClone: HTMLElement | null | undefined) => {
  if (!elementClone) return;

  // Apply base typography to entire document
  applyTypographyToAll(elementClone, {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.primary,
    lineHeight: lineHeights.normal,
  });

  // Special handling for PDF-specific elements

  // Client data section
  const clientSection = elementClone.querySelector(".flex.flex-row");
  if (clientSection) {
    const labels = clientSection.querySelectorAll("strong");
    labels.forEach((label) => {
      applyTypography(label as HTMLElement, {
        fontWeight: fontWeights.semibold,
        fontSize: fontSizes.base,
      });
    });

    const inputs = clientSection.querySelectorAll("input, select, span");
    inputs.forEach((input) => {
      applyTypography(input as HTMLElement, {
        fontSize: fontSizes.base,
      });
    });
  }

  // Table headers
  const tableHeaders = elementClone.querySelectorAll("thead th");
  tableHeaders.forEach((header) => {
    applyTypography(header as HTMLElement, {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      fontFamily: fontFamilies.primary,
    });
  });

  // Table cells
  const tableCells = elementClone.querySelectorAll("tbody td");
  tableCells.forEach((cell) => {
    applyTypography(cell as HTMLElement, {
      fontSize: fontSizes.base,
      fontFamily: fontFamilies.primary,
    });

    // Ensure content inside cells also gets proper styling
    const cellElement = cell as HTMLElement;
    if (cellElement.childNodes.length > 0) {
      const wrapper = document.createElement("div");
      wrapper.style.fontSize = fontSizes.base;
      wrapper.style.fontFamily = fontFamilies.primary;
      wrapper.innerHTML = cellElement.innerHTML;
      cellElement.innerHTML = "";
      cellElement.appendChild(wrapper);
    }
  });

  // Footer
  const footer = elementClone.querySelector(".text-center.text-xs.text-gray-600");
  if (footer) {
    applyTypography(footer as HTMLElement, {
      fontSize: fontSizes.sm,
      fontFamily: fontFamilies.primary,
    });
  }

  // Make sure all spans (which may be dynamically created) have proper styling
  const spans = elementClone.querySelectorAll("span");
  spans.forEach((span) => {
    applyTypography(span as HTMLElement, {
      fontSize: fontSizes.base,
      fontFamily: fontFamilies.primary,
    });
  });

  return elementClone;
};

// CSS class utility function to generate typography classes for Tailwind usage
export const typographyClasses = {
  base: `font-sans text-[${fontSizes.base}] font-normal leading-normal`,
  heading: `font-sans text-[${fontSizes.lg}] font-semibold leading-tight`,
  subheading: `font-sans text-[${fontSizes.md}] font-medium leading-snug`,
  caption: `font-sans text-[${fontSizes.sm}] font-normal leading-tight`,
  table: `font-sans text-[${fontSizes.base}] font-normal leading-normal`,
  tableHeader: `font-sans text-[${fontSizes.base}] font-semibold leading-normal`,
  input: `font-sans text-[${fontSizes.base}] font-normal leading-normal`,
  button: `font-sans text-[${fontSizes.base}] font-medium leading-normal`,
  footer: `font-sans text-[${fontSizes.sm}] font-normal leading-normal`,
};

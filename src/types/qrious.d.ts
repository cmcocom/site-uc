declare module "qrious" {
  export interface QRiousOptions {
    background?: string;
    backgroundAlpha?: number;
    element?: HTMLCanvasElement | HTMLImageElement;
    foreground?: string;
    foregroundAlpha?: number;
    level?: "L" | "M" | "Q" | "H";
    mime?: string;
    padding?: number;
    size?: number;
    value?: string;
  }

  export default class QRious {
    constructor(options?: QRiousOptions);
    background: string;
    backgroundAlpha: number;
    element: HTMLCanvasElement | HTMLImageElement;
    foreground: string;
    foregroundAlpha: number;
    level: "L" | "M" | "Q" | "H";
    mime: string;
    padding: number;
    size: number;
    value: string;
    toDataURL(mime?: string): string;
  }
}

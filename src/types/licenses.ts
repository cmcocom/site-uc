// License types for Microsoft licensing guide

export interface LicenseInfo {
  name: string;
  price: string;
  transferable?: boolean;
  support?: string;
  useCase?: string;
  pros?: string[];
  cons?: string[];
  type?: string;
  users?: number | string;
  features?: string[];
  icon?: string;
  description?: string;
  idealFor?: string;
}

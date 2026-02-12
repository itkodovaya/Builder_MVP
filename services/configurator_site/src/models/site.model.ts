/**
 * Site Model (Legacy)
 * 
 * @deprecated Use Draft model instead
 */

export interface Site {
  id: string;
  brandName: string;
  industry: string;
  logo?: import('./logo.model').Logo;
  config: Record<string, unknown>;
  isTemporary: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


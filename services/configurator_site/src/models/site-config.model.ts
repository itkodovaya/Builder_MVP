/**
 * Site Config Model
 * 
 * Represents the generated site configuration
 */

export interface SiteConfig {
  brand: {
    name: string;
    industry: string;
    logo?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  templateId?: string; // e.g. 'default', 'modern'
  layout: {
    header: HeaderConfig;
    sections: SectionConfig[];
    footer: FooterConfig;
  };
}

export interface HeaderConfig {
  showLogo: boolean;
  logoUrl?: string;
  navigation: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  href: string;
  order: number;
}

export interface SectionConfig {
  id: string;
  type: 'hero' | 'about' | 'services' | 'contact' | 'custom';
  content: Record<string, unknown>;
  order: number;
  visible: boolean;
}

export interface FooterConfig {
  showBrand: boolean;
  copyright: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
  order: number;
}


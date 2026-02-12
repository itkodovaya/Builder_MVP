/**
 * Template Models
 * 
 * Models for site templates
 */

import type { SiteConfig, HeaderConfig, FooterConfig, SectionConfig } from './site-config.model';

/**
 * Input data for config generation
 */
export interface ConfigInput {
  brandName: string;
  industry: string;
  logo?: string;
}

/**
 * Brand configuration
 */
export interface BrandConfig {
  name: string;
  industry: string;
  logo?: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
}

/**
 * Site Template Interface
 */
export interface SiteTemplate {
  id: string;
  name: string;
  industry: string | string[];
  version: number;

  // Generation methods
  generateBrand(input: ConfigInput): BrandConfig;
  generateTheme(input: ConfigInput): ThemeConfig;
  generateHeader(input: ConfigInput): HeaderConfig;
  generateSections(input: ConfigInput): SectionConfig[];
  generateFooter(input: ConfigInput): FooterConfig;

  // Apply template
  apply(input: ConfigInput): SiteConfig;
}


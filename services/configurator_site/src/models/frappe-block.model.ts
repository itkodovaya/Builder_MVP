/**
 * Frappe Block Model
 * 
 * Frappe-specific block format
 * Used only in Frappe adapter for transformation
 */

export interface FrappeBlock {
  blockId: string;
  blockName?: string;
  element?: string;
  children?: FrappeBlock[];
  baseStyles?: Record<string, any>;
  rawStyles?: Record<string, any>;
  mobileStyles?: Record<string, any>;
  tabletStyles?: Record<string, any>;
  attributes?: Record<string, any>;
  classes?: string[];
  innerText?: string;
  innerHTML?: string;
  extendedFromComponent?: string;
  originalElement?: string;
  isChildOfComponent?: string;
  referenceBlockId?: string;
  isRepeaterBlock?: boolean;
  visibilityCondition?: string | FrappeVisibilityCondition;
  elementBeforeConversion?: string;
  customAttributes?: Record<string, any>;
  dynamicValues?: FrappeBlockDataKey[];
  blockClientScript?: string;
  blockDataScript?: string;
  props?: Record<string, any>;
  dataKey?: FrappeBlockDataKey;
}

export interface FrappeBlockDataKey {
  key: string;
  property: string;
  type: string;
  comesFrom?: string;
}

export interface FrappeVisibilityCondition {
  key: string;
  comesFrom: string;
}

export interface FrappeRenderRequest {
  blocks: FrappeBlock[];
  options?: {
    inlineCSS?: boolean;
    cssPath?: string;
    metadata?: {
      title?: string;
      description?: string;
      canonicalUrl?: string;
    };
  };
}

export interface FrappeRenderResponse {
  html: string;
  css?: string;
  metadata?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
  };
}

export interface FrappeValidationRequest {
  blocks: FrappeBlock[];
}

export interface FrappeValidationResponse {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code?: string;
  }>;
}

export interface FrappeTemplate {
  id: string;
  name: string;
  industry?: string | string[];
  version?: number;
  description?: string;
}


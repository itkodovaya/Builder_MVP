/**
 * Block Model
 * 
 * Internal block representation for site configuration
 * Compatible with Frappe Block format but independent
 */

export interface Block {
  blockId: string;
  blockName?: string;
  element?: string;
  children?: Block[];
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
  visibilityCondition?: string | VisibilityCondition;
  elementBeforeConversion?: string;
  customAttributes?: Record<string, any>;
  dynamicValues?: BlockDataKey[];
  blockClientScript?: string;
  blockDataScript?: string;
  props?: Record<string, any>;
  dataKey?: BlockDataKey;
}

export interface BlockDataKey {
  key: string;
  property: string;
  type: string;
  comesFrom?: string;
}

export interface VisibilityCondition {
  key: string;
  comesFrom: string;
}


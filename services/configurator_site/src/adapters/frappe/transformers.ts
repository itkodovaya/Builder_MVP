/**
 * Frappe Transformers
 * 
 * Transform data between our internal format and Frappe format
 */

import type { Block, BlockDataKey } from '../../models/block.model';
import type {
  FrappeBlock,
  FrappeBlockDataKey,
  FrappeVisibilityCondition,
} from '../../models/frappe-block.model';

/**
 * Transform our Block to Frappe Block format
 */
export function toFrappeBlock(block: Block): FrappeBlock {
  const frappeBlock: FrappeBlock = {
    blockId: block.blockId,
  };

  if (block.blockName) frappeBlock.blockName = block.blockName;
  if (block.element) frappeBlock.element = block.element;
  if (block.baseStyles) frappeBlock.baseStyles = block.baseStyles;
  if (block.rawStyles) frappeBlock.rawStyles = block.rawStyles;
  if (block.mobileStyles) frappeBlock.mobileStyles = block.mobileStyles;
  if (block.tabletStyles) frappeBlock.tabletStyles = block.tabletStyles;
  if (block.attributes) frappeBlock.attributes = block.attributes;
  if (block.classes) frappeBlock.classes = block.classes;
  if (block.innerText) frappeBlock.innerText = block.innerText;
  if (block.innerHTML) frappeBlock.innerHTML = block.innerHTML;
  if (block.extendedFromComponent) frappeBlock.extendedFromComponent = block.extendedFromComponent;
  if (block.originalElement) frappeBlock.originalElement = block.originalElement;
  if (block.isChildOfComponent) frappeBlock.isChildOfComponent = block.isChildOfComponent;
  if (block.referenceBlockId) frappeBlock.referenceBlockId = block.referenceBlockId;
  if (block.isRepeaterBlock !== undefined) frappeBlock.isRepeaterBlock = block.isRepeaterBlock;
  if (block.elementBeforeConversion) frappeBlock.elementBeforeConversion = block.elementBeforeConversion;
  if (block.customAttributes) frappeBlock.customAttributes = block.customAttributes;
  if (block.blockClientScript) frappeBlock.blockClientScript = block.blockClientScript;
  if (block.blockDataScript) frappeBlock.blockDataScript = block.blockDataScript;
  if (block.props) frappeBlock.props = block.props;

  // Transform children recursively
  if (block.children && block.children.length > 0) {
    frappeBlock.children = block.children.map(toFrappeBlock);
  }

  // Transform dataKey
  if (block.dataKey) {
    frappeBlock.dataKey = toFrappeBlockDataKey(block.dataKey);
  }

  // Transform visibilityCondition
  if (block.visibilityCondition) {
    if (typeof block.visibilityCondition === 'string') {
      frappeBlock.visibilityCondition = block.visibilityCondition;
    } else {
      frappeBlock.visibilityCondition = toFrappeVisibilityCondition(block.visibilityCondition);
    }
  }

  // Transform dynamicValues
  if (block.dynamicValues && block.dynamicValues.length > 0) {
    frappeBlock.dynamicValues = block.dynamicValues.map(toFrappeBlockDataKey);
  }

  return frappeBlock;
}

/**
 * Transform Frappe Block to our Block format
 */
export function fromFrappeBlock(frappeBlock: FrappeBlock): Block {
  const block: Block = {
    blockId: frappeBlock.blockId,
  };

  if (frappeBlock.blockName) block.blockName = frappeBlock.blockName;
  if (frappeBlock.element) block.element = frappeBlock.element;
  if (frappeBlock.baseStyles) block.baseStyles = frappeBlock.baseStyles;
  if (frappeBlock.rawStyles) block.rawStyles = frappeBlock.rawStyles;
  if (frappeBlock.mobileStyles) block.mobileStyles = frappeBlock.mobileStyles;
  if (frappeBlock.tabletStyles) block.tabletStyles = frappeBlock.tabletStyles;
  if (frappeBlock.attributes) block.attributes = frappeBlock.attributes;
  if (frappeBlock.classes) block.classes = frappeBlock.classes;
  if (frappeBlock.innerText) block.innerText = frappeBlock.innerText;
  if (frappeBlock.innerHTML) block.innerHTML = frappeBlock.innerHTML;
  if (frappeBlock.extendedFromComponent) block.extendedFromComponent = frappeBlock.extendedFromComponent;
  if (frappeBlock.originalElement) block.originalElement = frappeBlock.originalElement;
  if (frappeBlock.isChildOfComponent) block.isChildOfComponent = frappeBlock.isChildOfComponent;
  if (frappeBlock.referenceBlockId) block.referenceBlockId = frappeBlock.referenceBlockId;
  if (frappeBlock.isRepeaterBlock !== undefined) block.isRepeaterBlock = frappeBlock.isRepeaterBlock;
  if (frappeBlock.elementBeforeConversion) block.elementBeforeConversion = frappeBlock.elementBeforeConversion;
  if (frappeBlock.customAttributes) block.customAttributes = frappeBlock.customAttributes;
  if (frappeBlock.blockClientScript) block.blockClientScript = frappeBlock.blockClientScript;
  if (frappeBlock.blockDataScript) block.blockDataScript = frappeBlock.blockDataScript;
  if (frappeBlock.props) block.props = frappeBlock.props;

  // Transform children recursively
  if (frappeBlock.children && frappeBlock.children.length > 0) {
    block.children = frappeBlock.children.map(fromFrappeBlock);
  }

  // Transform dataKey
  if (frappeBlock.dataKey) {
    block.dataKey = fromFrappeBlockDataKey(frappeBlock.dataKey);
  }

  // Transform visibilityCondition
  if (frappeBlock.visibilityCondition) {
    if (typeof frappeBlock.visibilityCondition === 'string') {
      block.visibilityCondition = frappeBlock.visibilityCondition;
    } else {
      block.visibilityCondition = fromFrappeVisibilityCondition(frappeBlock.visibilityCondition);
    }
  }

  // Transform dynamicValues
  if (frappeBlock.dynamicValues && frappeBlock.dynamicValues.length > 0) {
    block.dynamicValues = frappeBlock.dynamicValues
      .map(fromFrappeBlockDataKey)
      .filter((x): x is BlockDataKey => x != null);
  }

  return block;
}

/**
 * Transform BlockDataKey to Frappe format
 */
function toFrappeBlockDataKey(dataKey: Block['dataKey']): FrappeBlockDataKey {
  if (!dataKey) {
    throw new Error('dataKey is required');
  }
  return {
    key: dataKey.key,
    property: dataKey.property,
    type: dataKey.type,
    comesFrom: dataKey.comesFrom,
  };
}

/**
 * Transform Frappe BlockDataKey to our format
 */
function fromFrappeBlockDataKey(frappeDataKey: FrappeBlockDataKey): Block['dataKey'] {
  return {
    key: frappeDataKey.key,
    property: frappeDataKey.property,
    type: frappeDataKey.type,
    comesFrom: frappeDataKey.comesFrom,
  };
}

/**
 * Transform VisibilityCondition to Frappe format
 */
function toFrappeVisibilityCondition(condition: Block['visibilityCondition']): FrappeVisibilityCondition {
  if (typeof condition === 'string') {
    throw new Error('VisibilityCondition must be an object, not a string');
  }
  if (!condition) {
    throw new Error('VisibilityCondition is required');
  }
  return {
    key: condition.key,
    comesFrom: condition.comesFrom,
  };
}

/**
 * Transform Frappe VisibilityCondition to our format
 */
function fromFrappeVisibilityCondition(
  frappeCondition: FrappeVisibilityCondition
): Block['visibilityCondition'] {
  return {
    key: frappeCondition.key,
    comesFrom: frappeCondition.comesFrom,
  };
}

/**
 * Transform array of blocks
 */
export function toFrappeBlocks(blocks: Block[]): FrappeBlock[] {
  return blocks.map(toFrappeBlock);
}

/**
 * Transform array of Frappe blocks
 */
export function fromFrappeBlocks(frappeBlocks: FrappeBlock[]): Block[] {
  return frappeBlocks.map(fromFrappeBlock);
}


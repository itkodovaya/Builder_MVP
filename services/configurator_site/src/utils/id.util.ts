/**
 * ID Generation Utility
 * 
 * Generates unique IDs for drafts and files
 */

import { createId } from '@paralleldrive/cuid2';

export function generateId(): string {
  return createId();
}


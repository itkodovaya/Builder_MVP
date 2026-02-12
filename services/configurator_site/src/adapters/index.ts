/**
 * Adapters Index
 * 
 * Export adapters and factory function
 */

export type { IConfiguratorAdapter, RenderOptions, RenderResult, ValidationResult, PreviewResult, Template } from './configurator.adapter';
export { FallbackAdapter } from './fallback/fallback.adapter';
export { FrappeAdapter } from './frappe/frappe.adapter';
export { getConfiguratorAdapter } from '../config/frappe.config';


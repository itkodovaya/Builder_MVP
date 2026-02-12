/**
 * HTML Sanitization Utility
 * 
 * Sanitizes HTML to prevent XSS attacks and execution of user scripts
 */

/**
 * Sanitize HTML string
 * Removes dangerous elements and attributes
 */
export function sanitizeHtml(html: string): string {
  let sanitized = html;

  // 1. Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // 3. Remove javascript: protocol in href and src
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // 4. Remove iframe tags (security risk)
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // 5. Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // 6. Remove style tags with potentially dangerous content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 7. Remove dangerous attributes
  const dangerousAttributes = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload'
  ];
  
  for (const attr of dangerousAttributes) {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  return sanitized;
}

/**
 * Validate URL for safety
 * Only allows relative URLs, http://, and https://
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Allow relative URLs
  if (url.startsWith('/')) {
    return true;
  }

  // Allow http:// and https://
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  // Allow data: URLs for images only
  if (url.startsWith('data:image/')) {
    return true;
  }

  return false;
}

/**
 * Sanitize URL
 * Removes dangerous protocols and returns safe URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  // Remove javascript: protocol
  let sanitized = url.replace(/javascript:/gi, '');
  
  // Remove data:text/html
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // If URL is not valid, return safe fallback
  if (!isValidUrl(sanitized)) {
    return '#';
  }

  return sanitized;
}

/**
 * Escape HTML entities
 * Prevents XSS by escaping special characters
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}


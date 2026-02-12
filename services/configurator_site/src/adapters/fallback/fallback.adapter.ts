/**
 * Fallback Adapter
 * 
 * Simple implementation of IConfiguratorAdapter without Frappe
 * Used when Frappe is unavailable or disabled
 * Provides basic HTML rendering from blocks
 */

import type { IConfiguratorAdapter, RenderOptions, RenderResult, ValidationResult, ValidationError, PreviewResult, Template } from '../configurator.adapter';
import type { Block } from '../../models/block.model';
import type { SiteConfig } from '../../models/site-config.model';
import { escapeHtml, sanitizeUrl } from '../../utils/sanitize.util';
import { generateId } from '../../utils/id.util';

export class FallbackAdapter implements IConfiguratorAdapter {
  /**
   * Render a page from blocks
   */
  async renderPage(blocks: Block[], options?: RenderOptions): Promise<RenderResult> {
    const html = this.renderBlocksToHTML(blocks);
    const css = this.extractCSS(blocks);

    const fullHtml = this.wrapInHTMLDocument(html, css, options);

    return {
      html: fullHtml,
      css,
      metadata: options?.metadata,
    };
  }

  /**
   * Validate block structure
   */
  async validateBlocks(blocks: Block[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Basic validation
    if (!blocks || blocks.length === 0) {
      errors.push({
        path: '/',
        message: 'At least one block is required',
        code: 'EMPTY_BLOCKS',
      });
    }

    // Validate each block
    this.validateBlockRecursive(blocks, '', errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates(): Promise<Template[]> {
    // Return empty array for fallback adapter
    // Templates are handled by template registry
    return [];
  }

  /**
   * Generate preview of a page
   */
  async previewPage(blocks: Block[], options?: RenderOptions): Promise<PreviewResult> {
    const result = await this.renderPage(blocks, options);
    return {
      html: result.html,
      css: result.css,
      assets: {},
    };
  }

  /**
   * Convert SiteConfig to blocks
   */
  configToBlocks(config: SiteConfig): Block[] {
    const blocks: Block[] = [];

    // Header block
    if (config.layout.header) {
      blocks.push(this.createHeaderBlock(config));
    }

    // Section blocks
    if (config.layout.sections) {
      for (const section of config.layout.sections) {
        if (section.visible) {
          blocks.push(this.createSectionBlock(section, config));
        }
      }
    }

    // Footer block
    if (config.layout.footer) {
      blocks.push(this.createFooterBlock(config));
    }

    return blocks;
  }

  /**
   * Check if adapter is available
   */
  async isAvailable(): Promise<boolean> {
    // Fallback adapter is always available
    return true;
  }

  /**
   * Render blocks to HTML
   */
  private renderBlocksToHTML(blocks: Block[]): string {
    return blocks.map(block => this.renderBlock(block)).join('\n');
  }

  /**
   * Render a single block
   */
  private renderBlock(block: Block): string {
    const element = block.element || 'div';
    const tag = this.sanitizeElementName(element);
    
    const attributes = this.buildAttributes(block);
    const styles = this.buildStyles(block);
    const classes = block.classes?.join(' ') || '';
    
    const classAttr = classes ? ` class="${escapeHtml(classes)}"` : '';
    const styleAttr = styles ? ` style="${escapeHtml(styles)}"` : '';
    
    const openTag = `<${tag}${attributes}${classAttr}${styleAttr}>`;
    const closeTag = `</${tag}>`;

    let content = '';
    
    if (block.innerHTML) {
      content = block.innerHTML;
    } else if (block.innerText) {
      content = escapeHtml(block.innerText);
    } else if (block.children && block.children.length > 0) {
      content = this.renderBlocksToHTML(block.children);
    }

    return `${openTag}${content}${closeTag}`;
  }

  /**
   * Build HTML attributes from block
   */
  private buildAttributes(block: Block): string {
    const attrs: string[] = [];

    if (block.attributes) {
      for (const [key, value] of Object.entries(block.attributes)) {
        const safeKey = this.sanitizeAttributeName(key);
        const safeValue = escapeHtml(String(value));
        attrs.push(`${safeKey}="${safeValue}"`);
      }
    }

    if (block.customAttributes) {
      for (const [key, value] of Object.entries(block.customAttributes)) {
        const safeKey = this.sanitizeAttributeName(key);
        const safeValue = escapeHtml(String(value));
        attrs.push(`data-${safeKey}="${safeValue}"`);
      }
    }

    if (block.blockId) {
      attrs.push(`data-block-id="${escapeHtml(block.blockId)}"`);
    }

    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }

  /**
   * Build inline styles from block
   */
  private buildStyles(block: Block): string {
    const styles: string[] = [];

    // Merge all style objects
    const allStyles = {
      ...block.baseStyles,
      ...block.rawStyles,
    };

    for (const [key, value] of Object.entries(allStyles)) {
      const cssKey = this.camelToKebab(key);
      styles.push(`${cssKey}: ${String(value)}`);
    }

    return styles.join('; ');
  }

  /**
   * Extract CSS from blocks
   */
  private extractCSS(blocks: Block[]): string {
    // Basic CSS for common elements
    return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}
`;
  }

  /**
   * Wrap HTML in document structure
   */
  private wrapInHTMLDocument(html: string, css: string, options?: RenderOptions): string {
    const title = options?.metadata?.title || 'Site Preview';
    const description = options?.metadata?.description || '';
    const canonicalUrl = options?.metadata?.canonicalUrl || '';
    
    const cssLink = !options?.inlineCSS && options?.cssPath
      ? `<link rel="stylesheet" href="${sanitizeUrl(options.cssPath)}">`
      : '';
    
    const inlineStyles = options?.inlineCSS
      ? `<style>${css}</style>`
      : '';

    const metaDescription = description
      ? `<meta name="description" content="${escapeHtml(description)}">`
      : '';
    
    const metaCanonical = canonicalUrl
      ? `<link rel="canonical" href="${sanitizeUrl(canonicalUrl)}">`
      : '';

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${metaDescription}
  ${metaCanonical}
  ${cssLink}
  ${inlineStyles}
</head>
<body>
  ${html}
</body>
</html>`;
  }

  /**
   * Validate block recursively
   */
  private validateBlockRecursive(blocks: Block[], path: string, errors: ValidationError[]): void {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockPath = path ? `${path}[${i}]` : `[${i}]`;

      if (!block.blockId) {
        errors.push({
          path: blockPath,
          message: 'Block must have a blockId',
          code: 'MISSING_BLOCK_ID',
        });
      }

      if (block.children) {
        this.validateBlockRecursive(block.children, `${blockPath}.children`, errors);
      }
    }
  }

  /**
   * Create header block from config
   */
  private createHeaderBlock(config: SiteConfig): Block {
    const navItems: Block[] = config.layout.header.navigation
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        blockId: generateId(),
        element: 'a',
        innerText: item.label,
        attributes: {
          href: item.href,
        },
        classes: ['nav-link'],
      }));

    return {
      blockId: generateId(),
      element: 'header',
      classes: ['header'],
      baseStyles: {
        backgroundColor: config.theme.primaryColor,
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      children: [
        {
          blockId: generateId(),
          element: 'div',
          classes: ['header-logo'],
          innerHTML: config.brand.logo
            ? `<img src="${sanitizeUrl(config.brand.logo)}" alt="${escapeHtml(config.brand.name)}" style="height: 40px;">`
            : escapeHtml(config.brand.name),
        },
        {
          blockId: generateId(),
          element: 'nav',
          classes: ['header-nav'],
          children: navItems,
        },
      ],
    };
  }

  /**
   * Create section block from config
   */
  private createSectionBlock(section: SiteConfig['layout']['sections'][0], config: SiteConfig): Block {
    const content: Block[] = [];

    if (section.content.title) {
      content.push({
        blockId: generateId(),
        element: 'h2',
        innerText: String(section.content.title),
        classes: ['section-title'],
      });
    }

    if (section.content.description) {
      content.push({
        blockId: generateId(),
        element: 'p',
        innerText: String(section.content.description),
        classes: ['section-description'],
      });
    }

    return {
      blockId: generateId(),
      element: 'section',
      classes: ['section', `section-${section.type}`],
      baseStyles: {
        padding: '3rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
      },
      children: content,
    };
  }

  /**
   * Create footer block from config
   */
  private createFooterBlock(config: SiteConfig): Block {
    const links: Block[] = config.layout.footer.links
      .sort((a, b) => a.order - b.order)
      .map(link => ({
        blockId: generateId(),
        element: 'a',
        innerText: link.label,
        attributes: {
          href: link.href,
        },
        classes: ['footer-link'],
      }));

    return {
      blockId: generateId(),
      element: 'footer',
      classes: ['footer'],
      baseStyles: {
        backgroundColor: '#2d3748',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
      },
      children: [
        {
          blockId: generateId(),
          element: 'div',
          classes: ['footer-links'],
          children: links,
        },
        {
          blockId: generateId(),
          element: 'p',
          innerText: config.layout.footer.copyright,
        },
      ],
    };
  }

  /**
   * Sanitize element name
   */
  private sanitizeElementName(name: string): string {
    // Only allow alphanumeric characters
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '');
    return sanitized || 'div';
  }

  /**
   * Sanitize attribute name
   */
  private sanitizeAttributeName(name: string): string {
    // Only allow alphanumeric, dash, underscore
    return name.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  /**
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}


/**
 * Publish Service
 * 
 * Generates static HTML/CSS from site config for publishing
 */

import type { SiteConfig } from '../models/site-config.model';
import type { PublishOptions, StaticSiteFiles } from '../models/publish.model';
import { previewService } from './preview.service';
import { escapeHtml, sanitizeUrl } from '../utils/sanitize.util';
import { validateEnv } from '../config/env.config';
import { getConfiguratorAdapter } from '../adapters';

const env = validateEnv();

class PublishService {
  /**
   * Generate HTML from site config
   */
  async generateHTML(config: SiteConfig, options: PublishOptions = {}): Promise<string> {
    const { inlineCSS = false, cssPath } = options;

    // Validate URLs before rendering
    if (!previewService.validateUrls(config)) {
      throw new Error('Invalid URLs in site config');
    }

    // Use adapter to render
    const adapter = getConfiguratorAdapter();
    const blocks = adapter.configToBlocks(config);
    
    const renderResult = await adapter.renderPage(blocks, {
      inlineCSS,
      cssPath,
      metadata: {
        title: config.brand.name,
      },
    });

    return renderResult.html;
  }

  /**
   * Extract CSS from site config
   */
  extractCSS(config: SiteConfig): string {
    const css = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f8f8;
}
.header {
  background: ${config.theme.primaryColor};
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.header-logo {
  font-size: 1.5rem;
  font-weight: bold;
}
.header-nav {
  display: flex;
  gap: 2rem;
}
.header-nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: opacity 0.2s;
}
.header-nav a:hover {
  opacity: 0.8;
}
.hero {
  background: linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor});
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.hero p {
  font-size: 1.25rem;
  max-width: 800px;
  margin-bottom: 2rem;
}
.section {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-bottom: 1px solid #eee;
}
.section:last-child {
  border-bottom: none;
}
.section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${config.theme.primaryColor};
  text-align: center;
}
.section p {
  text-align: center;
  margin-bottom: 1rem;
}
.footer {
  background: #2d3748;
  color: white;
  padding: 2rem;
  text-align: center;
}
.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}
.footer-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}
.footer-links a:hover {
  opacity: 0.8;
}
.cta-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: white;
  color: ${config.theme.primaryColor};
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: transform 0.2s;
}
.cta-button:hover {
  transform: scale(1.05);
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
.service-item {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}
.service-item h3 {
  color: ${config.theme.primaryColor};
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}
.service-item p {
  color: #4a5568;
  line-height: 1.6;
}
`;

    return this.optimizeCSS(css);
  }

  /**
   * Optimize CSS (minify)
   */
  optimizeCSS(css: string): string {
    const shouldMinify = env.CSS_MINIFY === true || env.CSS_MINIFY === undefined; // Default to true

    if (!shouldMinify) {
      return css.trim();
    }

    // Basic CSS minification
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*\{\s*/g, '{') // Remove spaces around {
      .replace(/\s*\}\s*/g, '}') // Remove spaces around }
      .replace(/\s*:\s*/g, ':') // Remove spaces around :
      .replace(/\s*;\s*/g, ';') // Remove spaces around ;
      .replace(/\s*,\s*/g, ',') // Remove spaces around ,
      .replace(/\s*>\s*/g, '>') // Remove spaces around >
      .replace(/\s*\+\s*/g, '+') // Remove spaces around +
      .replace(/\s*~\s*/g, '~') // Remove spaces around ~
      .trim();
  }

  /**
   * Generate complete static site files
   */
  async generateStaticSite(config: SiteConfig, siteId: string): Promise<StaticSiteFiles> {
    // Use adapter to render
    const adapter = getConfiguratorAdapter();
    const blocks = adapter.configToBlocks(config);
    
    const renderResult = await adapter.renderPage(blocks, {
      inlineCSS: false,
      cssPath: `/p/${siteId}/styles.css`,
      metadata: {
        title: config.brand.name,
      },
    });

    return {
      html: renderResult.html,
      css: renderResult.css || this.extractCSS(config),
    };
  }

  /**
   * Render a section
   */
  private renderSection(section: SiteConfig['layout']['sections'][0], config: SiteConfig): string {
    switch (section.type) {
      case 'hero':
        return `
          <section class="hero">
            <h1>${escapeHtml(String(section.content.title || ''))}</h1>
            <p>${escapeHtml(String(section.content.subtitle || ''))}</p>
            ${section.content.ctaText ? `<a href="${sanitizeUrl(String(section.content.ctaHref || '#'))}" class="cta-button">${escapeHtml(String(section.content.ctaText))}</a>` : ''}
          </section>
        `;
      
      case 'about':
        return `
          <section class="section">
            <h2>${escapeHtml(String(section.content.title || 'О нас'))}</h2>
            <p>${escapeHtml(String(section.content.description || ''))}</p>
          </section>
        `;
      
      case 'services':
        return this.renderServicesSection(section, config);
      
      case 'contact':
        return `
          <section class="section">
            <h2>${escapeHtml(String(section.content.title || 'Контакты'))}</h2>
            ${section.content.email ? `<p>Email: <a href="mailto:${escapeHtml(String(section.content.email))}">${escapeHtml(String(section.content.email))}</a></p>` : ''}
            ${section.content.phone ? `<p>Телефон: ${escapeHtml(String(section.content.phone))}</p>` : ''}
          </section>
        `;
      
      default:
        return this.renderCustomSection(section);
    }
  }

  /**
   * Render services section
   */
  private renderServicesSection(section: SiteConfig['layout']['sections'][0], config: SiteConfig): string {
    const title = escapeHtml(String(section.content.title || 'Услуги'));
    const description = section.content.description ? `<p>${escapeHtml(String(section.content.description))}</p>` : '';
    
    let itemsHtml = '';
    if (Array.isArray(section.content.items)) {
      itemsHtml = `
        <div class="services-grid">
          ${section.content.items.map((item: any) => `
            <div class="service-item">
              <h3>${escapeHtml(String(item.title || ''))}</h3>
              <p>${escapeHtml(String(item.description || ''))}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <section class="section">
        <h2>${title}</h2>
        ${description}
        ${itemsHtml}
      </section>
    `;
  }

  /**
   * Render custom section
   */
  private renderCustomSection(section: SiteConfig['layout']['sections'][0]): string {
    const title = section.content.title ? escapeHtml(String(section.content.title)) : 'Секция';
    
    const safeFields = ['description', 'text', 'content'];
    let html = '';

    for (const field of safeFields) {
      if (section.content[field] && typeof section.content[field] === 'string') {
        html += `<p>${escapeHtml(section.content[field] as string)}</p>`;
      }
    }

    if (!html) {
      html = `<pre>${escapeHtml(JSON.stringify(section.content, null, 2))}</pre>`;
    }

    return `
      <section class="section">
        <h2>${title}</h2>
        ${html}
      </section>
    `;
  }
}

export const publishService = new PublishService();


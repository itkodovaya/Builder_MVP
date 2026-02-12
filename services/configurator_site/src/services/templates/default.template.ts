
import { SiteConfig } from '../../models/site-config.model';
import { TemplateRenderer } from './template.interface';
import { sanitizeUrl, escapeHtml } from '../../utils/sanitize.util';

export class DefaultTemplate implements TemplateRenderer {
  id = 'default';
  name = 'Классический';
  description = 'Базовый универсальный шаблон, подходящий для любого бизнеса.';

  render(config: SiteConfig): string {
    const sectionsHtml = config.layout.sections
      .filter((section) => section.visible)
      .sort((a, b) => a.order - b.order)
      .map((section) => this.renderSection(section))
      .join('\n');

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.brand.name}</title>
  <style>
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
    .header {
      background: ${config.theme.primaryColor};
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    }
    .header-nav a:hover {
      text-decoration: underline;
    }
    .hero {
      background: linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor});
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .hero p {
      font-size: 1.25rem;
    }
    .section {
      padding: 3rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .section h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: ${config.theme.primaryColor};
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
    }
    .footer-links a:hover {
      text-decoration: underline;
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
  </style>
</head>
<body>
  <header class="header">
    <div class="header-logo">${config.brand.logo ? `<img src="${sanitizeUrl(config.brand.logo)}" alt="${escapeHtml(config.brand.name)}" style="height: 40px;">` : escapeHtml(config.brand.name)}</div>
    <nav class="header-nav">
      ${config.layout.header.navigation
        .sort((a, b) => a.order - b.order)
        .map(item => `<a href="${sanitizeUrl(item.href)}">${escapeHtml(item.label)}</a>`)
        .join('')}
    </nav>
  </header>
  
  <main>
    ${sectionsHtml}
  </main>
  
  <footer class="footer">
    <div class="footer-links">
      ${config.layout.footer.links
        .sort((a, b) => a.order - b.order)
        .map(link => `<a href="${sanitizeUrl(link.href)}">${escapeHtml(link.label)}</a>`)
        .join('')}
    </div>
    <p>${escapeHtml(config.layout.footer.copyright)}</p>
  </footer>
</body>
</html>`;
  }

  private renderSection(section: SiteConfig['layout']['sections'][0]): string {
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
        return this.renderServicesSection(section);
      
      case 'contact':
        return `
          <section class="section">
            <h2>${escapeHtml(String(section.content.title || 'Контакты'))}</h2>
            ${section.content.email ? `<p>Email: <a href="mailto:${escapeHtml(String(section.content.email))} ">${escapeHtml(String(section.content.email))}</a></p>` : ''}
            ${section.content.phone ? `<p>Телефон: ${escapeHtml(String(section.content.phone))}</p>` : ''}
          </section>
        `;
      
      default:
        return this.renderCustomSection(section);
    }
  }

  private renderServicesSection(section: SiteConfig['layout']['sections'][0]): string {
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

  private renderCustomSection(section: SiteConfig['layout']['sections'][0]): string {
    const title = section.content.title ? escapeHtml(String(section.content.title)) : 'Секция';
    
    // Safely render custom content
    const content = this.renderCustomContent(section.content);

    return `
      <section class="section">
        <h2>${title}</h2>
        ${content}
      </section>
    `;
  }

  private renderCustomContent(content: Record<string, unknown>): string {
    // Only render safe text content
    const safeFields = ['description', 'text', 'content'];
    let html = '';

    for (const field of safeFields) {
      if (content[field] && typeof content[field] === 'string') {
        html += `<p>${escapeHtml(content[field] as string)}</p>`;
      }
    }

    // If no safe content found, show sanitized JSON
    if (!html) {
      html = `<pre>${escapeHtml(JSON.stringify(content, null, 2))}</pre>`;
    }

    return html;
  }
}

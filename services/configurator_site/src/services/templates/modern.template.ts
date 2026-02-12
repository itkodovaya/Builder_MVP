import { SiteConfig } from '../../models/site-config.model';
import { TemplateRenderer } from './template.interface';
import { sanitizeUrl, escapeHtml } from '../../utils/sanitize.util';

export class ModernTemplate implements TemplateRenderer {
  id = 'modern';
  name = 'Современный';
  description = 'Стильный дизайн с градиентами, карточками и современной типографикой.';

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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${config.theme.primaryColor};
      --secondary: ${config.theme.secondaryColor};
      --text: #1f2937;
      --text-light: #6b7280;
      --bg: #ffffff;
      --bg-alt: #f3f4f6;
      --container: 1200px;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.5;
      color: var(--text);
      background: var(--bg);
    }

    .container {
      max-width: var(--container);
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Header */
    .header {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 0;
    }
    
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav {
      display: flex;
      gap: 2rem;
    }

    .nav a {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav a:hover {
      color: var(--primary);
    }

    /* Hero */
    .hero {
      padding: 6rem 0;
      background: radial-gradient(circle at top right, var(--bg-alt), transparent);
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3.5rem;
      line-height: 1.2;
      font-weight: 800;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }
    
    .hero p {
      font-size: 1.25rem;
      color: var(--text-light);
      max-width: 600px;
      margin: 0 auto 2.5rem;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 2rem;
      background: var(--primary);
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 9999px;
      transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      filter: brightness(1.1);
    }

    /* Section */
    .section {
      padding: 5rem 0;
    }
    
    .section:nth-child(even) {
      background: var(--bg-alt);
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
    
    .section-description {
      color: var(--text-light);
      font-size: 1.125rem;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Services Grid */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .service-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    
    .service-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-color: var(--primary);
    }
    
    .service-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--text);
    }
    
    .service-card p {
      color: var(--text-light);
    }

    /* Footer */
    .footer {
      background: #111827;
      color: white;
      padding: 4rem 0 2rem;
    }
    
    .footer a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .footer a:hover {
      color: white;
    }
    
    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    
    .footer-links {
      display: flex;
      gap: 2rem;
    }
    
    .copyright {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #374151;
      width: 100%;
      text-align: center;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        ${config.brand.logo ? `<img src="${sanitizeUrl(config.brand.logo)}" alt="${escapeHtml(config.brand.name)}" style="height: 48px;">` : ''}
        <span>${escapeHtml(config.brand.name)}</span>
      </div>
      <nav class="nav">
        ${config.layout.header.navigation
          .sort((a, b) => a.order - b.order)
          .map(item => `<a href="${sanitizeUrl(item.href)}">${escapeHtml(item.label)}</a>`)
          .join('')}
      </nav>
    </div>
  </header>
  
  <main>
    ${sectionsHtml}
  </main>
  
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-links">
        ${config.layout.footer.links
          .sort((a, b) => a.order - b.order)
          .map(link => `<a href="${sanitizeUrl(link.href)}">${escapeHtml(link.label)}</a>`)
          .join('')}
      </div>
      <div class="copyright">
        ${escapeHtml(config.layout.footer.copyright)}
      </div>
    </div>
  </footer>
</body>
</html>`;
  }

  private renderSection(section: SiteConfig['layout']['sections'][0]): string {
    switch (section.type) {
      case 'hero':
        return `
          <section class="hero">
            <div class="container">
              <h1>${escapeHtml(String(section.content.title || ''))}</h1>
              <p>${escapeHtml(String(section.content.subtitle || ''))}</p>
              ${section.content.ctaText ? `<a href="${sanitizeUrl(String(section.content.ctaHref || '#'))}" class="btn">${escapeHtml(String(section.content.ctaText))}</a>` : ''}
            </div>
          </section>
        `;
      
      case 'about':
        return `
          <section class="section">
            <div class="container">
              <div class="section-header">
                <h2>${escapeHtml(String(section.content.title || 'О нас'))}</h2>
              </div>
              <div class="section-description">
                <p>${escapeHtml(String(section.content.description || ''))}</p>
              </div>
            </div>
          </section>
        `;
      
      case 'services':
        return this.renderServicesSection(section);
      
      case 'contact':
        return `
          <section class="section">
            <div class="container">
              <div class="section-header">
                <h2>${escapeHtml(String(section.content.title || 'Контакты'))}</h2>
              </div>
              <div style="text-align: center; font-size: 1.25rem;">
                ${section.content.email ? `<p style="margin-bottom: 0.5rem">Email: <a style="color: var(--primary)" href="mailto:${escapeHtml(String(section.content.email))} ">${escapeHtml(String(section.content.email))}</a></p>` : ''}
                ${section.content.phone ? `<p>Телефон: ${escapeHtml(String(section.content.phone))}</p>` : ''}
              </div>
            </div>
          </section>
        `;
      
      default:
        // Reuse default custom section for now, or style it up
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
            <div class="service-card">
              <h3>${escapeHtml(String(item.title || ''))}</h3>
              <p>${escapeHtml(String(item.description || ''))}</p>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>${title}</h2>
            ${description ? `<div class="section-description">${description}</div>` : ''}
          </div>
          ${itemsHtml}
        </div>
      </section>
    `;
  }

  private renderCustomSection(section: SiteConfig['layout']['sections'][0]): string {
    const title = section.content.title ? escapeHtml(String(section.content.title)) : 'Секция';
    const content = this.renderCustomContent(section.content);

    return `
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>${title}</h2>
          </div>
          ${content}
        </div>
      </section>
    `;
  }

  private renderCustomContent(content: Record<string, unknown>): string {
    const safeFields = ['description', 'text', 'content'];
    let html = '';

    for (const field of safeFields) {
      if (content[field] && typeof content[field] === 'string') {
        html += `<p class="section-description">${escapeHtml(content[field] as string)}</p>`;
      }
    }

    if (!html) {
      html = `<pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;">${escapeHtml(JSON.stringify(content, null, 2))}</pre>`;
    }

    return html;
  }
}

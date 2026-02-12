import { TemplateRenderer } from './template.interface';
import { DefaultTemplate } from './default.template';
import { ModernTemplate } from './modern.template';

export class TemplateRegistry {
  private templates: Map<string, TemplateRenderer>;

  constructor() {
    this.templates = new Map();
    this.register('default', new DefaultTemplate());
    this.register('modern', new ModernTemplate());
  }

  register(id: string, renderer: TemplateRenderer): void {
    this.templates.set(id, renderer);
  }

  listTemplates(): TemplateRenderer[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id?: string): TemplateRenderer {
    // Default to 'default' template if id is missing or not found
    const templateId = id || 'default';
    const template = this.templates.get(templateId);
    
    if (!template) {
      console.warn(`Template ${templateId} not found, falling back to default`);
      return this.templates.get('default')!;
    }
    
    return template;
  }
}

export const templateRegistry = new TemplateRegistry();

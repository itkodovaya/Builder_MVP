import { SiteConfig } from '../../models/site-config.model';

export interface TemplateRenderer {
  id: string;
  name: string;
  description: string;
  render(config: SiteConfig): string;
}

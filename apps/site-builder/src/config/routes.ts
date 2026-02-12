/**
 * Application Routes
 * 
 * Centralized route definitions for the site builder application
 */

export const routes = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  admin: {
    home: '/admin',
    users: '/admin/users',
    sites: '/admin/sites',
    templates: '/admin/templates',
    drafts: '/admin/drafts',
    stats: '/admin/stats',
  },
  wizard: {
    step1: '/wizard/step-1',
    step2: '/wizard/step-2',
    step3: '/wizard/step-3',
  },
  preview: (siteId: string) => `/preview/${siteId}`,
  register: (siteId?: string) => siteId ? `/register?siteId=${siteId}` : '/register',
} as const;


/**
 * Migration Models
 * 
 * Models for draft migration to permanent site
 */

export interface MigrateDraftInput {
  userId: string; // ID пользователя (из сервиса авторизации)
}

export interface MigrateDraftResponse {
  siteId: string;      // ID постоянного сайта
  draftId: string;     // ID мигрированного черновика
  migratedAt: string;  // ISO 8601 дата миграции
}

export interface PermanentSite {
  id: string;
  userId: string;
  brandName: string;
  industry: string;
  logo?: {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  };
  config: Record<string, unknown>;
  isTemporary: false;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationResult {
  success: boolean;
  siteId?: string;
  draftId: string;
  migratedAt?: string;
  error?: string;
}


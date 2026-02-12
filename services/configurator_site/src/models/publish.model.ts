/**
 * Publish Models
 * 
 * Models for site publishing
 */

export interface PublishOptions {
  inlineCSS?: boolean;
  cssPath?: string;
  minifyCSS?: boolean;
}

export interface StaticSiteFiles {
  html: string;
  css: string;
  assets?: AssetFile[];
}

export interface AssetFile {
  sourcePath: string;
  targetPath: string;
  filename: string;
}

export interface PublishResult {
  siteId: string;
  url: string;
  publishedAt: string;
}

export interface PublishResponse {
  success: boolean;
  data?: PublishResult;
  error?: {
    code: string;
    message: string;
  };
}


export type AssetType = "image" | "audio" | "video";

export interface TemplateAsset {
  assetId: string;
  assetKey: string;
  assetName: string;
  assetType: AssetType;
  allowedFormats: string[];
  maxFileSizeKb: number;
  requiredWidth?: number;
  requiredHeight?: number;
  allowResize?: boolean;
  assetUrl?: string;
  maxDurationSec?: number;
  isRequired: boolean;
}

export interface TemplateAnalytics {
  editCount: number;
  previewCount: number;
  exportCount: number;
}

export interface TemplateItem {
  templateId: string;
  templateName: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  analytics: TemplateAnalytics;
}

export interface TemplateDetail extends TemplateItem {
  assets: TemplateAsset[];
}

export interface ProjectStateAsset {
  assetId: string;
  file?: File;
  previewUrl?: string;
  validationStatus: "pending" | "valid" | "invalid";
  validationMessage?: string;
}

export interface EditorProjectState {
  projectId: string;
  templateId: string;
  projectName: string;
  assets: Record<string, ProjectStateAsset>; // key by assetId
  previewGenerated: boolean;
  editCount: number;
  previewCount: number;
  exportCount: number;
}



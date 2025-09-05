export type AssetType = "image" | "audio" | "video";

export interface TemplateAssetDef {
  assetDefId: string;
  assetKey: string;
  assetName: string;
  assetType: AssetType;
  allowedFormats: string[];
  maxFileSizeMb: number;
  requiredWidth?: number;
  requiredHeight?: number;
  allowResize?: boolean;
  placeholderUrl: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface TemplateAnalytics {
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
  assets: TemplateAssetDef[];
}

export interface ProjectStateAsset {
  assetDefId: string;
  file?: File;
  previewUrl?: string;
  validationStatus: "pending" | "valid" | "invalid";
  validationMessage?: string;
}

export interface EditorProjectState {
  projectId: string;
  templateId: string;
  projectName: string;
  assets: Record<string, ProjectStateAsset>; // key by assetDefId
  previewGenerated: boolean;
  previewCount: number;
  exportCount: number;
}



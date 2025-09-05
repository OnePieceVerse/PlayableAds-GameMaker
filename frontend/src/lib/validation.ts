import { TemplateAssetDef } from "@/types";

export async function validateFileAgainstAsset(file: File, def: TemplateAssetDef) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isAllowedFormat = ext ? def.allowedFormats.includes(ext) : false;
  const isSizeOk = file.size <= def.maxFileSizeMb * 1024 * 1024;
  let isDimensionOk = true;
  if (def.assetType === "image" && (def.requiredWidth || def.requiredHeight)) {
    const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
    if (def.requiredWidth && def.requiredHeight) {
      isDimensionOk = dims.width === def.requiredWidth && dims.height === def.requiredHeight;
    }
  }
  return { isAllowedFormat, isSizeOk, isDimensionOk };
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}



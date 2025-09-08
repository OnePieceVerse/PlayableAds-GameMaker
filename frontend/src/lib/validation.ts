export async function validateFileAgainstAsset(
  file: File,
  def: {
    allowedFormats: string[];
    maxFileSizeKb: number;
    assetType: "image" | "audio" | "video";
    requiredWidth?: number;
    requiredHeight?: number;
    maxDurationSec?: number;
  }
) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isAllowedFormat = ext ? def.allowedFormats.includes(ext) : false;
  const isSizeOk = file.size <= def.maxFileSizeKb * 1024;
  let isDimensionOk = true;
  if (def.assetType === "image" && (def.requiredWidth || def.requiredHeight)) {
    const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
    if (def.requiredWidth && def.requiredHeight) {
      isDimensionOk = dims.width === def.requiredWidth && dims.height === def.requiredHeight;
    }
  }
  let isDurationOk = true;
  if ((def.assetType === "audio" || def.assetType === "video") && def.maxDurationSec) {
    const dur = await readMediaDuration(file, def.assetType).catch(() => Number.POSITIVE_INFINITY);
    isDurationOk = dur <= def.maxDurationSec;
  }
  return { isAllowedFormat, isSizeOk, isDimensionOk, isDurationOk };
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

function readMediaDuration(file: File, kind: "audio" | "video"): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const d = (el as HTMLMediaElement).duration;
      URL.revokeObjectURL(url);
      resolve(isFinite(d) ? d : 0);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("failed to load media"));
    };
    el.src = url;
  });
}



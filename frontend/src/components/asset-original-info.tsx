"use client";

import Image from "next/image";

export interface AssetOriginalInfoProps {
  assetName: string;
  assetKey: string;
  assetType: "image" | "audio" | "video";
  allowedFormats: string[];
  maxFileSizeKb: number;
  requiredWidth?: number;
  requiredHeight?: number;
  assetUrl?: string;
  maxDurationSec?: number;
}

export function AssetOriginalInfo(props: AssetOriginalInfoProps) {
  const {
    assetName,
    assetKey,
    assetType,
    allowedFormats,
    maxFileSizeKb,
    requiredWidth,
    requiredHeight,
    assetUrl,
    maxDurationSec,
  } = props;

  const ext = (allowedFormats?.[0] || "").toLowerCase();
  const inferred = ext ? `${assetKey}.${ext}` : assetKey;
  const fromUrl = assetUrl ? (assetUrl.split("/").pop() || "") : "";
  const filename = fromUrl || inferred;

  return (
    <div className="grid grid-cols-[1fr_220px] gap-2 items-start">
      <div className="min-w-0 space-y-1">
        <div className="font-medium truncate">{assetName}</div>
        <div className="text-xs text-muted-foreground">文件名: {filename}</div>
        <div className="text-xs text-muted-foreground">格式: {allowedFormats.join(", ")}</div>
        <div className="text-xs text-muted-foreground">大小: ≤ {maxFileSizeKb}KB</div>
        {requiredWidth && requiredHeight ? (
          <div className="text-xs text-muted-foreground">尺寸: {requiredWidth}×{requiredHeight}</div>
        ) : null}
        {maxDurationSec && (assetType === "audio" || assetType === "video") ? (
          <div className="text-xs text-muted-foreground">时长: ≤ {maxDurationSec}s</div>
        ) : null}
      </div>
      {assetType === "image" ? (
        <div className="relative w-[220px] aspect-[3/2] rounded-md overflow-hidden border bg-muted">
          {assetUrl ? (
            <Image
              src={assetUrl}
              alt={`${assetName}-原始`}
              fill
              sizes="220px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">原始</div>
          )}
        </div>
      ) : assetType === "audio" ? (
        <div className="w-[220px] h-[120px] rounded-md border bg-muted/50 grid place-items-center">
          {assetUrl ? (
            <audio controls className="w-[200px]">
              <source src={assetUrl} />
            </audio>
          ) : (
            <div className="text-xs text-muted-foreground">AUDIO</div>
          )}
        </div>
      ) : (
        <div className="w-[220px] h-[120px] rounded-md border bg-muted/50 grid place-items-center overflow-hidden">
          {assetUrl ? (
            <video controls className="h-full">
              <source src={assetUrl} />
            </video>
          ) : (
            <div className="text-xs text-muted-foreground">VIDEO</div>
          )}
        </div>
      )}
    </div>
  );
}



import { AssetOriginalInfo } from "@/components/asset-original-info";
import { notFound } from "next/navigation";
import { StartCustomizationButton } from "@/components/start-customization-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeviceFrame } from "@/components/device-frame";
import { IncrementStat } from "@/components/increment-stat";


type TemplateDetailDto = {
  templateId: string;
  templateName: string;
  category?: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  assets: BackendAsset[];
};

type BackendAsset = {
  assetId: string;
  assetName: string;
  assetType: "image" | "audio" | "video";
  assetFileName: string;
  allowedFormats: string[];
  maxFileSizeKb: number;
  requiredWidth?: number;
  requiredHeight?: number;
  maxDurationSec?: number;
  isRequired: boolean;
};

import { headers } from "next/headers";

async function getTemplate(id: string): Promise<TemplateDetailDto | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const res = await fetch(`${origin}/api/templates/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    const payload = await res.json().catch(() => ({ data: null }));
    return (payload?.data as TemplateDetailDto) ?? null;
  } catch {
    return null;
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params?: Promise<{ id: string | string[] }>;
}) {
  const p = (await params) || { id: "" };
  const id = Array.isArray(p.id) ? p.id[0] : p.id;
  const data = await getTemplate(id);
  if (!data) return notFound();

  function groupAssets() {
    if (!data) return { 图片: [], Gif: [], 音频: [], 视频: [] } as Record<string, ViewAsset[]>;
    const transformed: ViewAsset[] = data.assets.map((a) => ({
      ...a,
      assetUrl: `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/templates-static/${data.templateName}/assets/${a.assetType}s/${a.assetFileName}`,
    }));
    const groups: Record<string, ViewAsset[]> = { 图片: [], Gif: [], 音频: [], 视频: [] };
    for (const a of transformed) {
      if (a.assetType === "image") {
        const isGif = a.allowedFormats?.some((f: string) => f.toLowerCase() === "gif");
        (isGif ? groups["Gif"] : groups["图片"]).push(a);
      } else if (a.assetType === "audio") {
        groups["音频"].push(a);
      } else if (a.assetType === "video") {
        groups["视频"].push(a);
      }
    }
    return groups;
  }

type ViewAsset = BackendAsset & { assetUrl: string };

  const grouped = groupAssets();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
      <div className="space-y-4">
        <IncrementStat templateId={data.templateId} kind="preview" />
        <DeviceFrame>
          <iframe
            src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/templates-static/${data.templateName}/index.html`}
            title={data.templateName}
            className="w-full h-full bg-white"
          />
        </DeviceFrame>
      </div>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{data.templateName}</h1>
          </div>
          <StartCustomizationButton templateId={data.templateId} templateName={data.templateName} className="px-8" />
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <div className="text-muted-foreground">模板类型</div>
            <div>{data.category || "通用"}</div>
          </div>
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <div className="text-muted-foreground">玩法介绍</div>
            <div className="text-muted-foreground">{data.description}</div>
          </div>
        </div>

        <div className="text-sm leading-7 text-muted-foreground">
          {data.description}
        </div>

        <div className="flex flex-wrap gap-3">
          {(data.tags || []).map((t, i) => (
              <Badge key={`${t}-${i}`} variant="secondary">
                {t}
              </Badge>
            ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="font-medium">素材清单与要求</h2>
          <p className="text-xs text-muted-foreground">提示：素材替换均为可选，不替换时系统将使用模板默认素材。</p>
          {(["图片", "Gif", "音频", "视频"] as const).map((label) =>
            grouped[label].length ? (
              <details key={label} className="group rounded-md border [&_summary::-webkit-details-marker]:hidden">
                <summary className="cursor-pointer select-none flex items-center justify-between p-3 text-sm font-medium text-muted-foreground">
                  <span>{label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{grouped[label].length} 项</span>
                    <svg
                      className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="divide-y border-t bg-background">
                  {grouped[label].map((a) => (
                    <div key={a.assetId} className="p-3">
                      <AssetOriginalInfo
                        assetName={a.assetName}
                        assetKey={a.assetFileName}
                        assetType={a.assetType}
                        allowedFormats={a.allowedFormats}
                        maxFileSizeKb={a.maxFileSizeKb}
                        requiredWidth={a.requiredWidth}
                        requiredHeight={a.requiredHeight}
                        assetUrl={a.assetUrl}
                        maxDurationSec={a.maxDurationSec}
                      />
                    </div>
                  ))}
                </div>
              </details>
            ) : null
          )}
        </div>


      </div>
    </div>
  );
}



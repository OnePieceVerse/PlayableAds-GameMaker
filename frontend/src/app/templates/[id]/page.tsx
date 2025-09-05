import Image from "next/image";
import { AssetOriginalInfo } from "@/components/asset-original-info";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  assets: any[];
};

async function getTemplate(id: string): Promise<TemplateDetailDto> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/templates/${id}`, { cache: "no-store" });
  return (await res.json()).data;
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
    if (!data) return { 图片: [], Gif: [], 音频: [], 视频: [] } as Record<string, any[]>;
    const groups: Record<string, any[]> = { 图片: [], Gif: [], 音频: [], 视频: [] };
    for (const a of data.assets.slice().sort((x: any, y: any) => x.displayOrder - y.displayOrder)) {
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

  const grouped = groupAssets();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
      <div className="space-y-4">
        <IncrementStat templateId={data.templateId} kind="preview" />
        <DeviceFrame>
          <iframe
            src={`/templates/${data.templateId}/index.html`}
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
          {data.templateName} 是本平台提供的模板之一，可自定义图片/文案/音乐/互动参数，一键生成 H5 活动。玩法简介：{data.description}
        </div>

        <div className="flex flex-wrap gap-3">
          {[data.category, "游戏", "活动", "教育", "培训", "老师"]
            .filter(Boolean)
            .map((t, i) => (
              <Badge key={`${t}-${i}`} variant="secondary">
                {t}
              </Badge>
            ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="font-medium">素材清单与要求</h2>
          {(["图片", "Gif", "音频", "视频"] as const).map((label) =>
            grouped[label].length ? (
              <div key={label} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="divide-y rounded-md border bg-background">
                  {grouped[label].map((a: any) => (
                    <div key={a.assetDefId} className="p-3">
                      <AssetOriginalInfo
                        assetName={a.assetName}
                        assetKey={a.assetKey}
                        assetType={a.assetType}
                        allowedFormats={a.allowedFormats}
                        maxFileSizeMb={a.maxFileSizeMb}
                        requiredWidth={a.requiredWidth}
                        requiredHeight={a.requiredHeight}
                        placeholderUrl={a.placeholderUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>


      </div>
    </div>
  );
}



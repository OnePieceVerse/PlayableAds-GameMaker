"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AssetOriginalInfo } from "@/components/asset-original-info";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { TemplateDetail } from "@/types";
import { validateFileAgainstAsset } from "@/lib/validation";

async function fetchTemplate(id: string): Promise<TemplateDetail> {
  const res = await fetch(`/api/templates/${id}`);
  const { data } = (await res.json()) as { data: TemplateDetail };
  return data;
}

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const templateId = sp.get("templateId");
  const projectName = sp.get("name") || "我的项目";

  const [tpl, setTpl] = useState<TemplateDetail | null>(null);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [previews, setPreviews] = useState<Record<string, string | undefined>>({});
  const [validation, setValidation] = useState<Record<string, { status: "pending" | "valid" | "invalid"; msg?: string }>>({});
  const [previewReady, setPreviewReady] = useState<boolean>(false); // reserved for future use

  useEffect(() => {
    if (!templateId) return;
    fetchTemplate(templateId).then(setTpl).catch(() => toast.error("加载模板失败"));
  }, [templateId]);

  const orderedAssets = useMemo(() => {
    return (tpl?.assets || []).slice().sort((a, b) => a.displayOrder - b.displayOrder);
  }, [tpl]);

  const groupedAssets = useMemo(() => {
    type GroupKey = "图片" | "Gif" | "音频" | "视频";
    const groups: Record<GroupKey, TemplateDetail["assets"]> = {
      图片: [],
      Gif: [],
      音频: [],
      视频: [],
    };
    for (const a of orderedAssets) {
      if (a.assetType === "image") {
        const isGif = a.allowedFormats?.some((f) => f.toLowerCase() === "gif");
        (isGif ? groups["Gif"] : groups["图片"]).push(a);
      } else if (a.assetType === "audio") {
        groups["音频"].push(a);
      } else if (a.assetType === "video") {
        groups["视频"].push(a);
      }
    }
    return groups;
  }, [orderedAssets]);

  async function onFileChange(defId: string, def: TemplateDetail["assets"][number], f?: File) {
    if (!f) return;
    const { isAllowedFormat, isSizeOk, isDimensionOk } = await validateFileAgainstAsset(f, def);
    if (!isAllowedFormat) {
      setValidation((v) => ({ ...v, [defId]: { status: "invalid", msg: "格式不符合" } }));
      return toast.error("格式不符合");
    }
    if (!isSizeOk) {
      setValidation((v) => ({ ...v, [defId]: { status: "invalid", msg: "文件过大" } }));
      return toast.error("文件过大");
    }
    if (isDimensionOk === false) {
      setValidation((v) => ({ ...v, [defId]: { status: "invalid", msg: "尺寸不符合" } }));
      return toast.error("尺寸不符合");
    }
    setFiles((fs) => ({ ...fs, [defId]: f }));
    const url = URL.createObjectURL(f);
    setPreviews((p) => ({ ...p, [defId]: url }));
    setValidation((v) => ({ ...v, [defId]: { status: "valid" } }));
    setPreviewReady(false);
  }

  async function generatePreview() {
    if (!tpl) return;
    // 素材均可不替换，直接进入预览
    setPreviewReady(true);
    toast.success("正在跳转预览页");
    const url = new URL(window.location.href);
    url.pathname = `/editor/${params.projectId}/preview`;
    window.location.href = `${url.pathname}?templateId=${tpl.templateId}&name=${encodeURIComponent(projectName)}`;
  }

  // 导出逻辑移动到导出页面

  return (
    <div className="py-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">模板名称</div>
          <div className="text-lg font-medium">{projectName}</div>
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">素材清单</h2>
          <p className="text-xs text-muted-foreground">提示：每个素材均可不替换，系统将使用模板默认占位素材。</p>
          {(["图片", "Gif", "音频", "视频"] as const).map((label) =>
            groupedAssets[label].length ? (
              <div key={label} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="divide-y rounded-md border bg-background">
                  {groupedAssets[label].map((a) => (
                    <div key={a.assetDefId} className="grid grid-cols-[1fr_80px_1fr] items-start gap-4 p-3">
                      {/* 左侧：原始素材信息组件 */}
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

                      {/* 中间文案 */}
                      <div className="text-center text-sm text-muted-foreground grid place-items-center">替换为</div>

                      {/* 右侧：新素材上传 + 预览 */}
                      <div className="min-w-0 flex-1">
                        <div className="mt-0 flex items-start gap-3">
                          {a.assetType === "image" ? (
                            <div className="relative w-[220px] aspect-[3/2] rounded-md overflow-hidden border bg-muted">
                              {previews[a.assetDefId] ? (
                                <Image src={previews[a.assetDefId] as string} alt={`${a.assetName}-新`} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">未上传</div>
                              )}
                            </div>
                          ) : (
                            <div className="w-[220px] h-[120px] rounded-md border bg-muted/50 grid place-items-center text-xs text-muted-foreground">未上传</div>
                          )}
                          <div className="grid gap-2">
                            <Label htmlFor={`f_${a.assetDefId}`}>上传新素材</Label>
                            <Input
                              id={`f_${a.assetDefId}`}
                              type="file"
                              accept={a.allowedFormats.map((e: string) => `.${e}`).join(",")}
                              onChange={(e) => onFileChange(a.assetDefId, a, e.target.files?.[0])}
                            />
                            <div className="text-xs text-muted-foreground">
                              状态: {validation[a.assetDefId]?.status || "pending"}
                              {validation[a.assetDefId]?.msg ? ` · ${validation[a.assetDefId]?.msg}` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={generatePreview}>生成预览</Button>
        </div>
      </div>
    </div>
  );
}



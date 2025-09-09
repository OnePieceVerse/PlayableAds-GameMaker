"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ExportPage() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const templateId = sp.get("templateId");
  const name = sp.get("name") || "我的项目";

  async function exportZip() {
    // trigger backend export, then download through Next proxy
    const expRes = await fetch(`/api/projects/${params.projectId}/export`, { method: "POST" });
    if (!expRes.ok) return;
    if (templateId) {
      fetch(`/api/templates/${templateId}/stats/export`, { method: "POST" }).catch(() => {});
    }
    const dl = await fetch(`/api/projects/${params.projectId}/download`);
    if (!dl.ok) return;
    const blob = await dl.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${params.projectId}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-6">
        <div className="mb-4 text-sm text-muted-foreground">导出替换素材后的 H5（示意）。</div>
        <Button onClick={exportZip}>下载 ZIP</Button>
        <Button asChild variant="secondary" className="ml-3">
          <Link href={`/editor/${params.projectId}/preview?templateId=${templateId}&name=${encodeURIComponent(name)}`}>返回预览</Link>
        </Button>
      </div>
    </div>
  );
}



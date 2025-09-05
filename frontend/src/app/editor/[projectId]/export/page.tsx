"use client";

import { useParams, useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ExportPage() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const templateId = sp.get("templateId");
  const name = sp.get("name") || "我的项目";

  async function exportZip() {
    const zip = new JSZip();
    zip.file("README.txt", `Template: ${templateId}\nProject: ${name}`);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${params.projectId}.zip`);
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



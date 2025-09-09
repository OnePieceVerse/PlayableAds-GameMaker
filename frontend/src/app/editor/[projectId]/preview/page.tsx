"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useCallback } from "react";
import { DeviceFrame } from "@/components/device-frame";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const templateId = sp.get("templateId");
  const name = sp.get("name");
  const onLoaded = useCallback(() => {
    fetch(`/api/projects/${params.projectId}/status?status=preview_ready`, { method: "POST" }).catch(() => {});
  }, [params.projectId]);
  return (
    <div className="space-y-4">
      <DeviceFrame>
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/projects-static/${templateId}-${params.projectId}/index.html`}
          title="预览"
          className="w-full h-full bg-white"
          onLoad={onLoaded}
        />
      </DeviceFrame>
      <div className="flex gap-3">
        <Button asChild variant="secondary">
          <Link href={`/editor/${params.projectId}?templateId=${templateId}&name=${encodeURIComponent(name || "")}`}>返回</Link>
        </Button>
        <Button asChild>
          <Link href={`/editor/${params.projectId}/export?templateId=${templateId}&name=${encodeURIComponent(name || "")}`}>导出</Link>
        </Button>
      </div>
    </div>
  );
}



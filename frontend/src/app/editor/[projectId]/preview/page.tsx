"use client";

import { useSearchParams, useParams } from "next/navigation";
import { DeviceFrame } from "@/components/device-frame";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const templateId = sp.get("templateId");
  const name = sp.get("name");
  return (
    <div className="space-y-4">
      <DeviceFrame>
        <iframe src={`/templates/${templateId}/index.html`} title="预览" className="w-full h-full bg-white" />
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



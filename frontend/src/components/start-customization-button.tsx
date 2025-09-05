"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function StartCustomizationButton({
  templateId,
  templateName,
  className,
  label = "去定制",
}: {
  templateId: string;
  templateName: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (loading) return;
    setLoading(true);
    const projectId = `p_${Math.random().toString(36).slice(2, 10)}`;
    const href = `/editor/${projectId}?templateId=${templateId}&name=${encodeURIComponent(templateName)}`;
    try {
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("templateId", templateId);
      fd.set("projectName", templateName);
      await fetch(`/api/projects`, { method: "POST", body: fd });
      await fetch(`/api/templates/${templateId}/stats/edit`, { method: "POST" });
    } catch (e) {
      // ignore for now
    } finally {
      router.push(href);
    }
  }

  return (
    <Button className={className} onClick={onClick} disabled={loading}>
      {label}
    </Button>
  );
}



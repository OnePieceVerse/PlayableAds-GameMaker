"use client";

import { useEffect } from "react";

export function IncrementStat({ templateId, kind }: { templateId: string; kind: "preview" | "edit" | "export" }) {
  useEffect(() => {
    fetch(`/api/templates/${templateId}/stats/${kind}`, { method: "POST" }).catch(() => {});
  }, [templateId, kind]);
  return null;
}



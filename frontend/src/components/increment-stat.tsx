"use client";

import { useEffect } from "react";

export function IncrementStat({ templateId, kind }: { templateId: string; kind: "preview" | "edit" | "export" }) {
  // Prevent double increment in React 18 StrictMode (dev): throttle identical calls briefly
  const key = `${kind}:${templateId}`;
  // Module-scoped cache for recent increments
  const g = globalThis as unknown as { __recentTplStat__?: Set<string> };
  if (!g.__recentTplStat__) g.__recentTplStat__ = new Set<string>();
  const recent = g.__recentTplStat__;

  useEffect(() => {
    if (recent.has(key)) return;
    recent.add(key);
    const t = setTimeout(() => {
      recent.delete(key);
    }, 2000);
    fetch(`/api/templates/${templateId}/stats/${kind}`, { method: "POST" }).catch(() => {});
    return () => clearTimeout(t);
  }, [key, recent]);
  return null;
}



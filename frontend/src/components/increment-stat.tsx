"use client";

import { useEffect } from "react";

export function IncrementStat({ templateId, kind }: { templateId: string; kind: "preview" | "edit" | "export" }) {
  // Prevent double increment in React 18 StrictMode (dev): throttle identical calls briefly
  const key = `${kind}:${templateId}`;
  // Module-scoped cache for recent increments
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!(globalThis as any).__recentTplStat__) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (globalThis as any).__recentTplStat__ = new Set<string>();
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const recent: Set<string> = (globalThis as any).__recentTplStat__;

  useEffect(() => {
    if (recent.has(key)) return;
    recent.add(key);
    const t = setTimeout(() => {
      recent.delete(key);
    }, 2000);
    fetch(`/api/templates/${templateId}/stats/${kind}`, { method: "POST" }).catch(() => {});
    return () => clearTimeout(t);
  }, [templateId, kind]);
  return null;
}



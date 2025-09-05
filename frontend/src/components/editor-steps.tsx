"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Step = "edit" | "preview" | "export";

export function EditorSteps({
  projectId,
  templateId,
  projectName,
  active,
}: {
  projectId: string;
  templateId: string | null;
  projectName: string | null;
  active: Step;
}) {
  const base = (step: Step) => {
    const suffix = step === "edit" ? "" : `/${step}`;
    return `/editor/${projectId}${suffix}?templateId=${templateId ?? ""}&name=${encodeURIComponent(
      projectName ?? ""
    )}`;
  };
  const StepLink = ({ step, label }: { step: Step; label: string }) => (
    <Link
      href={base(step)}
      className={cn(
        "px-3 py-2 rounded-md text-sm border",
        active === step ? "bg-foreground text-background" : "bg-background hover:bg-muted"
      )}
    >
      {label}
    </Link>
  );
  return (
    <div className="flex gap-2 items-center">
      <StepLink step="edit" label="编辑素材" />
      <span className="text-muted-foreground">→</span>
      <StepLink step="preview" label="预览试玩" />
      <span className="text-muted-foreground">→</span>
      <StepLink step="export" label="导出广告" />
    </div>
  );
}



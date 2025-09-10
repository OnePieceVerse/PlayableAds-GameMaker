"use client";

import { EditorSteps } from "@/components/editor-steps";
import { useParams, usePathname, useSearchParams } from "next/navigation";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const pathname = usePathname();
  const templateId = sp.get("templateId");
  const name = sp.get("name");
  const active = (pathname?.endsWith("/export") ? "export" : pathname?.endsWith("/preview") ? "preview" : "edit") as
    | "edit"
    | "preview"
    | "export";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      <EditorSteps projectId={params.projectId} templateId={templateId} projectName={name} active={active} />
      {children}
    </div>
  );
}



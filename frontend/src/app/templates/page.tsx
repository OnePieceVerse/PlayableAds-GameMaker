import Image from "next/image";
import Link from "next/link";
// import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, Download } from "lucide-react";


async function fetchTemplates(q?: string, cat?: string) {
  // Fetch from backend
  type Item = {
    templateId: string;
    templateName: string;
    description: string;
    thumbnailUrl: string;
    category?: string;
    analytics?: { editCount?: number; previewCount?: number; exportCount?: number };
  };
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/templates`, { cache: "no-store" });
  if (!res.ok) return [] as Item[];
  const payload = await res.json().catch(() => ({ data: [] }));
  let templates: Item[] = Array.isArray(payload.data) ? payload.data : [];
  if (q) templates = templates.filter((t) => t.templateName.includes(q) || t.description.includes(q));
  if (cat && cat !== "全部") templates = templates.filter((t) => (t.category || "通用") === cat);
  return templates;
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[]; cat?: string | string[] }>;
}) {
  const sp = (await searchParams) || {};
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const cat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const templates = await fetchTemplates(q, cat);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">全部模板</h2>
        <form className="flex gap-3" action="/templates">
          <Input placeholder="搜索模板名称或描述" name="q" defaultValue={q} className="w-64" />
        </form>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["全部", ...Array.from(new Set(templates.map((t) => t.category || "通用")))].map((c) => (
          <Link key={c} href={{ pathname: "/templates", query: { q: q || "", cat: c } }}>
            <Badge variant={cat === c || (!cat && c === "全部") ? "default" : "secondary"}>{c}</Badge>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {templates.map((t, i) => (
          <Card key={t.templateId} className="h-full overflow-hidden group gap-0 py-0">
            <div className="relative aspect-video">
              <Image
                src={t.thumbnailUrl}
                alt={t.templateName}
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/40 transition-all">
                <Button asChild size="sm">
                  <Link href={`/templates/${t.templateId}`}>预览试玩</Link>
                </Button>
              </div>
            </div>
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-base font-medium truncate">{t.templateName}</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-2 text-sm text-muted-foreground line-clamp-2">
              {t.description}
            </CardContent>
            <CardFooter className="p-2 pt-0 pb-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <Edit3 className="size-4" aria-hidden="true" />
                  <span>{t.analytics?.editCount ?? 0}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-4" aria-hidden="true" />
                  <span>{t.analytics?.previewCount ?? 0}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="size-4" aria-hidden="true" />
                  <span>{t.analytics?.exportCount ?? 0}</span>
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}



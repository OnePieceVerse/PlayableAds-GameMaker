import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { headers } from "next/headers";


async function fetchTemplates(q?: string, cat?: string) {
  // Fetch from backend
  type Item = { templateId: string; templateName: string; description: string; thumbnailUrl: string; category?: string };
  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/templates`, { cache: "no-store" });
  let templates: Item[] = (await res.json()).data;
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
        {["全部", ...Array.from(new Set(templates.map((t: any) => t.category || "通用")))].map((c) => (
          <Link key={c} href={{ pathname: "/templates", query: { q: q || "", cat: c } }}>
            <Badge variant={cat === c || (!cat && c === "全部") ? "default" : "secondary"}>{c}</Badge>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {templates.map((t) => (
          <Link key={t.templateId} href={`/templates/${t.templateId}`}>
            <Card className="h-full overflow-hidden">
              <div className="relative aspect-video">
                <Image src={t.thumbnailUrl} alt={t.templateName} fill className="object-cover" />
              </div>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base font-medium truncate">{t.templateName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-sm text-muted-foreground line-clamp-2">
                {t.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}



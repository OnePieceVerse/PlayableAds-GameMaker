import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">H5 游戏模板平台</h1>
          <p className="text-muted-foreground">
            通过可视化方式快速定制并导出 H5 游戏模板，适用于广告和活动推广。
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/templates">查看全部模板</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl border bg-muted aspect-video" />
      </section>
    </div>
  );
}

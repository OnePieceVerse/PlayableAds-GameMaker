import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">H5 游戏定制平台</h1>
          <p className="text-muted-foreground">
            选择游戏模板，通过可视化方式快速定制并导出 H5 游戏，适用于广告和活动推广。
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/templates">查看全部模板</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl border bg-muted overflow-hidden">
          <Image src="/images/hero.png" alt="H5 游戏定制平台" width={1280} height={720} className="w-full h-auto object-contain" />
        </div>
      </section>
    </div>
  );
}

import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/projects/${id}/status`, { cache: "no-store" });
  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ ok: res.ok }, { status: res.status });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  // expects ?status=draft|preview_ready|exported in query
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "draft";
  const res = await fetch(`${base}/projects/${id}/status/${status}`, { method: "POST" });
  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ ok: res.ok }, { status: res.status });
  }
}



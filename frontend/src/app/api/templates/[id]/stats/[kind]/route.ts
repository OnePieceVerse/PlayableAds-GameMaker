import { NextResponse } from "next/server";

export async function POST(_: Request, context: { params: Promise<{ id: string; kind: string }> }) {
  const { id, kind } = await context.params;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/templates/${id}/stats/${kind}`, { method: "POST" });
  return NextResponse.json({ ok: res.ok }, { status: res.status });
}



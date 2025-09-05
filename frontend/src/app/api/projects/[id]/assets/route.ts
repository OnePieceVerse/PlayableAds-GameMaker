import { NextResponse } from "next/server";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const form = await req.formData();
  const res = await fetch(`${base}/projects/${id}/assets`, { method: "POST", body: form });
  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ ok: res.ok }, { status: res.status });
  }
}



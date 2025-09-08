import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/projects`, { cache: "no-store" });
  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ ok: res.ok }, { status: res.status });
  }
}

export async function POST(req: Request) {
  const form = await req.formData();
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/projects`, { method: "POST", body: form });
  const bodyText = await res.text();
  try {
    return NextResponse.json(JSON.parse(bodyText), { status: res.status });
  } catch {
    return NextResponse.json({ ok: res.ok }, { status: res.status });
  }
}



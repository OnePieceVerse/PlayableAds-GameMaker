import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    const res = await fetch(`${base}/templates`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ data: [] });
    }
    const data = await res.json().catch(() => []);
    return NextResponse.json({ data: Array.isArray(data) ? data : [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}



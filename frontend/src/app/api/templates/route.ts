import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/templates`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json({ data });
}



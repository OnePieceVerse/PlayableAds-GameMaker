import { NextResponse } from "next/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  // Stream the zip through Next proxy
  const res = await fetch(`${base}/projects/${id}/download`);
  if (!res.ok) return new NextResponse("Not found", { status: res.status });
  const arrayBuffer = await res.arrayBuffer();
  return new NextResponse(Buffer.from(arrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${id}.zip"`,
    },
  });
}



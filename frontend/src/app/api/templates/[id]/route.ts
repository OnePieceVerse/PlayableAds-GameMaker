import { NextResponse } from "next/server";
import { getTemplateById } from "@/mock/templates";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tpl = getTemplateById(id);
  if (!tpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: tpl });
}



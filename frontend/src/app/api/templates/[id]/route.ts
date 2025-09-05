import { NextResponse } from "next/server";
import { getTemplateById } from "@/mock/templates";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const tpl = getTemplateById(params.id);
  if (!tpl) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: tpl });
}



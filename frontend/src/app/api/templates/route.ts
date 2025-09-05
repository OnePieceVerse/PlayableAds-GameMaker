import { NextResponse } from "next/server";
import { getTemplateList } from "@/mock/templates";

export async function GET() {
  return NextResponse.json({ data: getTemplateList() });
}



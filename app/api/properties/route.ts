import { NextResponse } from "next/server";
import { getPropertiesByIds } from "@/lib/data/properties";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => UUID_RE.test(id))
    .slice(0, 50);

  const properties = await getPropertiesByIds(ids);
  return NextResponse.json(properties);
}

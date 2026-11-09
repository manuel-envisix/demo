import { loadToday } from "@/lib/today";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const today = await loadToday();
  return Response.json(today, { headers: { "cache-control": "no-store" } });
}

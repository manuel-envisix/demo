import { readState } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readState();
  return Response.json(state, { headers: { "cache-control": "no-store" } });
}

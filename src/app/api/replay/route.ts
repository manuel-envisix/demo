import { rejectUnauthorized } from "@/lib/auth";
import { replay, tooFast } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = rejectUnauthorized(request);
  if (denied) return denied;
  if (tooFast()) return Response.json({ error: "Zu schnell." }, { status: 429 });
  const state = await replay();
  if (!state) return Response.json({ error: "Noch kein Satz auf der Bühne." }, { status: 409 });
  return Response.json(state, { headers: { "cache-control": "no-store" } });
}

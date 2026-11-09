import { cueFromBody } from "@/lib/cue";
import { rejectUnauthorized } from "@/lib/auth";
import { publishCue, tooFast } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = rejectUnauthorized(request);
  if (denied) return denied;
  if (tooFast()) return Response.json({ error: "Zu schnell." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Kein JSON." }, { status: 400 });
  }

  const draft = cueFromBody(body);
  if ("error" in draft) return Response.json({ error: draft.error }, { status: 400 });
  return Response.json(await publishCue(draft), { headers: { "cache-control": "no-store" } });
}

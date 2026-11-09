import { rejectUnauthorized } from "@/lib/auth";
import { arm, tooFast } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = rejectUnauthorized(request);
  if (denied) return denied;
  if (tooFast()) return Response.json({ error: "Zu schnell." }, { status: 429 });
  return Response.json(await arm(), { headers: { "cache-control": "no-store" } });
}

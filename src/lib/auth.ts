import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function rejectUnauthorized(request: Request): Response | null {
  const expected = process.env.INGEST_TOKEN?.trim() ?? "";
  if (expected === "") {
    return Response.json(
      { error: "Die Bühne hat noch kein Kennwort. INGEST_TOKEN fehlt." },
      { status: 503 },
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!timingSafeEqual(digest(token), digest(expected))) {
    return Response.json({ error: "Kennwort stimmt nicht." }, { status: 401 });
  }
  return null;
}

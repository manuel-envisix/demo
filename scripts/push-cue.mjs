const url = (process.env.STAGE_URL ?? "").replace(/\/$/, "");
const token = process.env.INGEST_TOKEN ?? "";

if (!url || !token) {
  console.error("STAGE_URL und INGEST_TOKEN müssen gesetzt sein.");
  process.exit(1);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const body = raw.trim().startsWith("{") ? JSON.parse(raw) : { text: raw };
const response = await fetch(`${url}/api/cue`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  },
  body: JSON.stringify(body),
});

const payload = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(typeof payload.error === "string" ? payload.error : `HTTP ${response.status}`);
  process.exit(1);
}

console.log("auf der wand");

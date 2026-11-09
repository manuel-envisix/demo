const MAX_HTML = 180_000;
const MAX_PROMPT = 500;
const MAX_LINE = 80;
const MAX_SPAN = 60 * 60 * 1000;

export const SPEAKING_LINES = [
  "Bau eine Seite für diesen Saal. Eine Aufgabe, ein Ergebnis, sonst nichts.",
  "Bau eine Seite, die zeigt, was eine Megawattstunde Strom heute kostet. Eine Zahl, groß, die Quelle darunter.",
  "Der Engpass ist nicht die Technik. Bau daraus eine Seite, die man hinten im Saal noch lesen kann.",
];

export const COMPOSER_BRIEF = `Lies die letzte Vocci-Aufnahme des Rings (sessionType recording). Öffne sie mit session_get, includeEvents true, projection transcript_text.

Wenn kein Transkript da ist, antworte nur: NOCH KEIN TEXT

Baue aus dem Satz eine einzelne HTML-Seite. Vorlage: templates/seite.html. Dunkler Grund #14120e, Schrift #f4f0e6, Orange #f39500. Große Schrift, von Reihe 20 lesbar, alles in einer Bildschirmhöhe, kein Scrollbalken. Kein Build, keine externen Skripte.

Eine heutige Zahl nur, wenn die Aufgabe danach fragt. Dann diese Adressen selbst lesen und Quelle und Zeitpunkt nennen. Erfinde keine Zahl.
Strom: https://api.awattar.at/v1/marketdata (marketprice ist Euro je MWh)
Euro: https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?lastNObservations=1&format=csvdata (USD je EUR)

Schreibe den Block in eine Datei und führe im Ordner dieser Seite aus:
python3 uebernehmen.py block.txt

Das ersetzt gebaut.html und state.json. Die Leinwand liest state.json jede Sekunde. gebaut.html ist die öffentliche Seite.

Alles nach HTML: ist die Seite.

SATZ: <wortgetreu, eine Zeile>
GESPROCHEN_MS: <durationMillis>
START: <createTime, ISO mit Z>
ENDE: <createTime plus Dauer, ISO mit Z>
TRANSKRIPT: <updateTime, ISO mit Z, nur wenn nach ENDE>
SESSION: <sessionId>
HTML:
<!doctype html>
...`;

export const PROBE_CUE = {
  id: "probe",
  source: "probe",
  prompt: "Das ist eine Probe. Am Donnerstag steht hier der Satz vom Ring.",
  spokenMs: 5400,
  transcriptLagMs: 900,
  speechEndedAt: "2026-11-12T09:25:00.000Z",
  receivedAt: "2026-11-12T09:25:02.400Z",
  lines: null,
  brief: null,
};

export const PROBE_HTML = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Beispiel</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #14120e; color: #f4f0e6; font-family: Georgia, sans-serif; }
  main { height: 100%; display: grid; align-content: center; padding: 8vh; box-sizing: border-box; gap: 1vh; }
  p { margin: 0; letter-spacing: 0.16em; text-transform: uppercase; color: #f39500; }
  h1 { font-size: clamp(3rem, 10vw, 7rem); line-height: 0.9; margin: 0; }
  small { color: #b7b0a4; letter-spacing: 0.08em; text-transform: uppercase; }
</style>
</head>
<body>
<main>
  <p>Beispiel</p>
  <h1>Die Seite.</h1>
  <small>Keine Live-Zahl</small>
</main>
</body>
</html>`;

export function parseCueText(raw) {
  const trimmed = stripFence(String(raw ?? "")).replace(/^\uFEFF/, "").trim();
  if (trimmed === "") return { error: "Der Satz fehlt." };
  if (/^NOCH KEIN TEXT\b/i.test(trimmed)) {
    return { error: "Der Ring hat noch kein Transkript. Kurz warten, dann noch einmal holen." };
  }
  if (trimmed.startsWith("{")) {
    try {
      return cueFromRecord(JSON.parse(trimmed));
    } catch {
      return { error: "Das JSON ist ungültig." };
    }
  }
  const parts = splitHtml(trimmed);
  const html = normalizeHtml(parts.html);
  if (isError(html)) return html;
  const head = parts.head;
  if (/^SATZ\s*:/im.test(head)) {
    const fields = new Map();
    const facts = [];
    for (const line of head.split(/\r?\n/)) {
      const match = /^([A-ZÄÖÜ0-9_]+)\s*:\s*(.*)$/.exec(line.trim());
      if (!match) continue;
      if (match[1] === "FAKT" || /^FAKT\d+$/.test(match[1])) facts.push(match[2].trim());
      else fields.set(match[1], match[2].trim());
    }
    const spokenMs = fields.get("GESPROCHEN_MS");
    const spokenSeconds = fields.get("GESPROCHEN_S");
    const cue = finalize({
      prompt: fields.get("SATZ"),
      spokenMs: spokenMs ?? (spokenSeconds ? Number(spokenSeconds.replace(",", ".")) * 1000 : undefined),
      speechStartedAt: fields.get("START"),
      speechEndedAt: fields.get("ENDE"),
      transcriptReadyAt: fields.get("TRANSKRIPT"),
      sessionId: fields.get("SESSION"),
      lines: fields.get("ZEILEN"),
      title: fields.get("TITEL"),
      answer: fields.get("ANTWORT"),
      facts,
      source: fields.get("QUELLE"),
      code: fields.get("CODE"),
    });
    if (cue.error) return cue;
    return { cue, html };
  }
  const cue = finalize({ prompt: head });
  if (cue.error) return cue;
  return { cue, html };
}

export function blockHead(raw) {
  const trimmed = stripFence(String(raw ?? "")).replace(/^\uFEFF/, "").trim();
  if (trimmed.startsWith("{")) {
    try {
      const record = JSON.parse(trimmed);
      delete record.html;
      return JSON.stringify(record);
    } catch {
      return trimmed;
    }
  }
  const match = /^HTML:\s*/im.exec(trimmed);
  return match ? trimmed.slice(0, match.index).trim() : trimmed;
}

export function liveState(raw, previous) {
  const parsed = parseCueText(raw);
  if (parsed.error) return parsed;
  const receivedAt = new Date().toISOString();
  return {
    updatedAt: receivedAt,
    mode: "live",
    armedAt: previous?.armedAt ?? null,
    replay: previous?.replay ?? 0,
    receivedAt,
    page: parsed.html != null,
    block: blockHead(raw),
    html: parsed.html,
  };
}

export function normalizeState(raw) {
  if (!raw || typeof raw !== "object") return null;
  const mode = raw.mode === "armed" || raw.mode === "live" ? raw.mode : "idle";
  const block = typeof raw.block === "string" ? raw.block : "";
  const html = typeof raw.html === "string" && raw.html.trim() !== "" ? raw.html : null;
  const page = raw.page === true || html != null;
  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : "";
  return {
    updatedAt,
    mode: mode === "live" && block.trim() === "" ? "idle" : mode,
    armedAt: typeof raw.armedAt === "string" ? raw.armedAt : null,
    replay: Number(raw.replay) || 0,
    receivedAt: typeof raw.receivedAt === "string" ? raw.receivedAt : updatedAt,
    page,
    block,
    html,
  };
}

function cueFromRecord(record) {
  const html = normalizeHtml(record.html);
  if (isError(html)) return html;
  const cue = finalize(record);
  if (cue.error) return cue;
  return { cue, html };
}

function finalize(input) {
  const prompt = cleanPrompt(typeof input.prompt === "string" ? input.prompt : "");
  if (prompt === "") return { error: "Der Satz fehlt." };
  if (prompt.length > MAX_PROMPT) return { error: "Der Satz ist zu lang für die Wand." };

  const speechEndedAt = isoOrNull(input.speechEndedAt);
  const speechStartedAt = isoOrNull(input.speechStartedAt);
  const transcriptReadyAt = isoOrNull(input.transcriptReadyAt);

  let spokenMs = msOrNull(input.spokenMs);
  if (spokenMs == null && speechStartedAt && speechEndedAt) {
    spokenMs = Date.parse(speechEndedAt) - Date.parse(speechStartedAt);
  }
  if (spokenMs != null && (spokenMs < 0 || spokenMs > MAX_SPAN)) spokenMs = null;

  let transcriptLagMs = null;
  if (speechEndedAt && transcriptReadyAt) {
    transcriptLagMs = Date.parse(transcriptReadyAt) - Date.parse(speechEndedAt);
    if (transcriptLagMs < 0 || transcriptLagMs > MAX_SPAN) transcriptLagMs = null;
  }

  return {
    prompt,
    spokenMs,
    transcriptLagMs,
    speechEndedAt,
    sessionId: sessionOrNull(input.sessionId),
    lines: linesOrNull(input.lines),
    brief: briefOrNull(input),
  };
}

function splitHtml(raw) {
  const match = /^HTML:\s*/im.exec(raw);
  if (!match || match.index == null) return { head: raw, html: null };
  const html = raw.slice(match.index + match[0].length).trim();
  return { head: raw.slice(0, match.index).trim(), html: html === "" ? null : html };
}

function normalizeHtml(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return { error: "Die Seite ist kein Text." };
  const trimmed = value.replace(/^\uFEFF/, "").trim();
  if (trimmed === "") return null;
  if (trimmed.length > MAX_HTML) return { error: "Die Seite ist zu groß." };
  if (!trimmed.includes("<")) return { error: "Die Seite braucht HTML." };
  if (/<(?:html|!doctype)\b/i.test(trimmed)) return trimmed;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Gebaut</title></head><body>${trimmed}</body></html>`;
}

function isError(value) {
  return value != null && typeof value === "object";
}

function stripFence(raw) {
  const match = /^```[a-z]*\n([\s\S]*?)\n```$/i.exec(raw.trim());
  return match ? match[1] : raw;
}

function cleanPrompt(input) {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isoOrNull(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function msOrNull(value) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(number)) return null;
  return number;
}

function sessionOrNull(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9:_-]{1,80}$/.test(trimmed) ? trimmed : null;
}

function briefOrNull(input) {
  const nested = input.brief && typeof input.brief === "object" ? input.brief : null;
  const sourceRecord = nested ?? input;
  const answer = cleanPrompt(typeof sourceRecord.answer === "string" ? sourceRecord.answer : "").slice(0, 220);
  if (answer === "") return null;
  const title = cleanPrompt(typeof sourceRecord.title === "string" ? sourceRecord.title : "").slice(0, 40);
  const source = cleanPrompt(typeof sourceRecord.source === "string" ? sourceRecord.source : "").slice(0, 90);
  const code = cleanPrompt(typeof sourceRecord.code === "string" ? sourceRecord.code : "").slice(0, 60);
  return {
    title: title === "" ? null : title,
    answer,
    facts: factsOrNull(sourceRecord.facts),
    source: source === "" ? null : source,
    code: code === "" ? null : code,
  };
}

function factsOrNull(value) {
  const source = Array.isArray(value) ? value : [];
  const facts = [];
  for (const item of source) {
    if (facts.length === 2) break;
    if (typeof item === "string") {
      const fact = factFromLine(item);
      if (fact) facts.push(fact);
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const valueText = cleanPrompt(typeof item.value === "string" ? item.value : "").slice(0, 16);
    const label = cleanPrompt(typeof item.label === "string" ? item.label : "").slice(0, 32);
    if (valueText !== "" && label !== "") facts.push({ value: valueText, label });
  }
  return facts;
}

function factFromLine(line) {
  const [rawValue, rawLabel] = line.split("|");
  if (rawLabel == null) return null;
  const value = cleanPrompt(rawValue).slice(0, 16);
  const label = cleanPrompt(rawLabel).slice(0, 32);
  if (value === "" || label === "") return null;
  return { value, label };
}

function linesOrNull(value) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split("|") : [];
  const lines = source
    .filter((line) => typeof line === "string")
    .map((line) => cleanPrompt(line).slice(0, MAX_LINE))
    .filter((line) => line !== "")
    .slice(0, 3);
  return lines.length > 0 ? lines : null;
}

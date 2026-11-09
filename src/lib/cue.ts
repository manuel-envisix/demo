import type { Brief, Fact } from "@/lib/live";

export type { Brief, Fact };

export type StoredCue = {
  id: string;
  source: "ring" | "probe";
  prompt: string;
  spokenMs: number | null;
  transcriptLagMs: number | null;
  speechEndedAt: string | null;
  receivedAt: string;
  sessionId: string | null;
  lines: string[] | null;
  brief: Brief | null;
};

export type PublicState = {
  mode: "idle" | "armed" | "live";
  armedAt: string | null;
  replay: number;
  cue: StoredCue | null;
};

export type CueDraft = Omit<StoredCue, "id" | "source" | "receivedAt">;

const MAX_PROMPT = 500;
const MAX_LINE = 80;
const MAX_SPAN = 60 * 60 * 1000;

export const PROBE_CUE: StoredCue = {
  id: "probe",
  source: "probe",
  prompt: "Das ist eine Probe. Am Donnerstag steht hier der Satz vom Ring.",
  spokenMs: 5400,
  transcriptLagMs: 900,
  speechEndedAt: "2026-11-12T09:25:00.000Z",
  receivedAt: "2026-11-12T09:25:02.400Z",
  sessionId: null,
  lines: null,
  brief: {
    title: "Entscheidungsvorlage",
    answer: "Hier steht der Text, der aus dem Satz geschrieben wurde.",
    facts: [
      { value: "18", label: "Zeilen" },
      { value: "Beispiel", label: "keine Live-Zahl" },
    ],
    source: null,
    code: "18 Zeilen, Beispiel",
  },
};

export const SPEAKING_LINES = [
  "Fass diesen Vormittag in eine Entscheidungsvorlage. Eine Seite. Für ein Unternehmen hier im Saal.",
  "Was kostet der Strom heute auf dem Spotmarkt, und was heißt das in einem Satz für einen Betrieb in Vorarlberg?",
  "Der Engpass ist nicht die Technik. Schreib das so, dass man es hinten im Saal noch lesen kann.",
];

export const COMPOSER_BRIEF = `Lies die letzte Vocci-Aufnahme des Rings (sessionType recording). Öffne sie mit session_get, includeEvents true, projection transcript_text.

Wenn kein Transkript da ist, antworte nur: NOCH KEIN TEXT

Schreibe aus dem Satz eine Entscheidungsvorlage, die man in Reihe 20 noch lesen kann. Ein oder zwei Sätze, keine Aufzählung, keine Floskeln.

Eine heutige Zahl nur, wenn der Satz danach fragt. Dann /api/today auf derselben Adresse wie die Leinwand lesen. Erfinde keine Zahl. Steht sie dort nicht, lass FAKT und QUELLE weg. Nenne bei einer Zahl immer Quelle und Zeitpunkt aus /api/today.

Antworte ausschließlich mit diesem Block:

SATZ: <wortgetreu, eine Zeile>
GESPROCHEN_MS: <durationMillis>
START: <createTime als ISO>
ENDE: <createTime plus Dauer, ISO>
TRANSKRIPT: <updateTime als ISO, nur wenn nach ENDE>
SESSION: <sessionId>
TITEL: Entscheidungsvorlage
ANTWORT: <der geschriebene Text>
FAKT: <kurzer Wert> | <kurze Bezeichnung>
QUELLE: <nur bei einer Zahl aus /api/today>
CODE: <Anzahl> Zeilen geschrieben`;

export function cueFromBody(body: unknown): CueDraft | { error: string } {
  if (!body || typeof body !== "object") return { error: "Der Satz fehlt." };
  const record = body as Record<string, unknown>;
  if (typeof record.text === "string" && record.text.trim() !== "") {
    return parseCueText(record.text);
  }
  return finalize(record);
}

export function parseCueText(raw: string): CueDraft | { error: string } {
  const trimmed = stripFence(raw).replace(/^\uFEFF/, "").trim();
  if (trimmed === "") return { error: "Der Satz fehlt." };
  if (/^NOCH KEIN TEXT\b/i.test(trimmed)) {
    return { error: "Der Ring hat noch kein Transkript. Kurz warten, dann noch einmal holen." };
  }
  if (trimmed.startsWith("{")) {
    try {
      return finalize(JSON.parse(trimmed) as Record<string, unknown>);
    } catch {
      return { error: "Das JSON ist ungültig." };
    }
  }
  if (/^SATZ\s*:/im.test(trimmed)) {
    const fields = new Map<string, string>();
    const facts: string[] = [];
    for (const line of trimmed.split(/\r?\n/)) {
      const match = /^([A-ZÄÖÜ0-9_]+)\s*:\s*(.*)$/.exec(line.trim());
      if (!match) continue;
      if (match[1] === "FAKT" || /^FAKT\d+$/.test(match[1])) facts.push(match[2].trim());
      else fields.set(match[1], match[2].trim());
    }
    const spokenMs = fields.get("GESPROCHEN_MS");
    const spokenSeconds = fields.get("GESPROCHEN_S");
    return finalize({
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
  }
  return finalize({ prompt: trimmed });
}

function finalize(input: Record<string, unknown>): CueDraft | { error: string } {
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

  let transcriptLagMs: number | null = null;
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

export function asCue(value: unknown): StoredCue | null {
  const cue = typeof value === "string" ? safeJson(value) : value;
  if (!cue || typeof cue !== "object") return null;
  const row = cue as Record<string, unknown>;
  if (typeof row.prompt !== "string" || typeof row.id !== "string") return null;
  const prompt = cleanPrompt(row.prompt);
  if (prompt === "") return null;
  return {
    id: row.id,
    source: row.source === "probe" ? "probe" : "ring",
    prompt,
    spokenMs: spanOrNull(row.spokenMs),
    transcriptLagMs: spanOrNull(row.transcriptLagMs),
    speechEndedAt: isoOrNull(row.speechEndedAt),
    receivedAt: typeof row.receivedAt === "string" ? row.receivedAt : "",
    sessionId: sessionOrNull(row.sessionId),
    lines: linesOrNull(row.lines),
    brief: briefOrNull(row.brief && typeof row.brief === "object" ? (row.brief as Record<string, unknown>) : row),
  };
}

function stripFence(raw: string): string {
  const match = /^```[a-z]*\n([\s\S]*?)\n```$/i.exec(raw.trim());
  return match ? match[1] : raw;
}

function cleanPrompt(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function msOrNull(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(number)) return null;
  return number;
}

function spanOrNull(value: unknown): number | null {
  const number = msOrNull(value);
  if (number == null || number < 0 || number > MAX_SPAN) return null;
  return number;
}

function sessionOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9:_-]{1,80}$/.test(trimmed) ? trimmed : null;
}

function briefOrNull(input: Record<string, unknown>): Brief | null {
  const nested = input.brief && typeof input.brief === "object" ? (input.brief as Record<string, unknown>) : null;
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

function factsOrNull(value: unknown): Fact[] {
  const source = Array.isArray(value) ? value : [];
  const facts: Fact[] = [];
  for (const item of source) {
    if (facts.length === 2) break;
    if (typeof item === "string") {
      const fact = factFromLine(item);
      if (fact) facts.push(fact);
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const factValue = cleanPrompt(typeof record.value === "string" ? record.value : "").slice(0, 16);
    const label = cleanPrompt(typeof record.label === "string" ? record.label : "").slice(0, 32);
    if (factValue !== "" && label !== "") facts.push({ value: factValue, label });
  }
  return facts;
}

function factFromLine(line: string): Fact | null {
  const [rawValue, rawLabel] = line.split("|");
  if (rawLabel == null) return null;
  const value = cleanPrompt(rawValue).slice(0, 16);
  const label = cleanPrompt(rawLabel).slice(0, 32);
  if (value === "" || label === "") return null;
  return { value, label };
}

function linesOrNull(value: unknown): string[] | null {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split("|")
      : [];
  const lines = source
    .filter((line): line is string => typeof line === "string")
    .map((line) => cleanPrompt(line).slice(0, MAX_LINE))
    .filter((line) => line !== "")
    .slice(0, 3);
  return lines.length > 0 ? lines : null;
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

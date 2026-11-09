const VIENNA = "Europe/Vienna";

export function formatDuration(ms) {
  const safe = Math.max(0, ms);
  if (safe < 60_000) return { value: (safe / 1000).toFixed(1).replace(".", ","), unit: "s" };
  const total = Math.round(safe / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return { value: `${minutes}:${seconds.toString().padStart(2, "0")}`, unit: "min" };
}

export function formatStopwatch(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function wallMs(speechEndedAt, receivedAt) {
  if (!speechEndedAt || !receivedAt) return null;
  const end = Date.parse(speechEndedAt);
  const got = Date.parse(receivedAt);
  if (!Number.isFinite(end) || !Number.isFinite(got)) return null;
  const delta = got - end;
  if (delta < 0 || delta > 60 * 60 * 1000) return null;
  return delta;
}

export function viennaLabel(date) {
  const parts = new Intl.DateTimeFormat("de-AT", {
    timeZone: VIENNA,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  const when = `${part("weekday").replace(".", "")} ${part("day")}. ${part("month").replace(".", "")} · ${part("hour")}:${part("minute")}`;
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIENNA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return { when, event: key === "2026-11-12" };
}

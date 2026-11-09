import { viennaLabel } from "@/lib/format";
import type { LiveFigure, Today } from "@/lib/live";

const ECB_URL =
  "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?lastNObservations=1&format=csvdata";
const AWATTAR_URL = "https://api.awattar.at/v1/marketdata";

let cached: { at: number; data: Today } | null = null;
let pending: Promise<Today> | null = null;

export function loadToday(): Promise<Today> {
  const now = Date.now();
  if (cached && now - cached.at < cacheFor(cached.data)) return Promise.resolve(cached.data);
  pending ??= fetchToday()
    .then((data) => {
      cached = { at: Date.now(), data };
      pending = null;
      return data;
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

function cacheFor(data: Today): number {
  return data.euroDollar || data.power ? 5 * 60 * 1000 : 30 * 1000;
}

async function fetchToday(): Promise<Today> {
  const [euroDollar, power] = await Promise.all([readEuro(), readPower()]);
  return {
    fetchedAt: new Date().toISOString(),
    vienna: viennaLabel(new Date()).when,
    euroDollar,
    power,
  };
}

async function readEuro(): Promise<LiveFigure | null> {
  try {
    const csv = await readText(ECB_URL);
    const match = /SP00\.A,D,USD,EUR,SP00,A,(\d{4}-\d{2}-\d{2}),([0-9.]+),/.exec(csv);
    if (!match) return null;
    const value = Number(match[2]);
    if (!Number.isFinite(value)) return null;
    return {
      value: value.toFixed(4).replace(".", ","),
      label: "Dollar je Euro",
      asOf: shortDay(match[1]),
      source: "EZB-Referenzkurs",
    };
  } catch {
    return null;
  }
}

async function readPower(): Promise<LiveFigure | null> {
  try {
    const payload = JSON.parse(await readText(AWATTAR_URL)) as {
      data?: { start_timestamp?: number; end_timestamp?: number; marketprice?: number }[];
    };
    const slots = payload.data ?? [];
    const now = Date.now();
    const slot =
      slots.find(
        (item) =>
          typeof item.start_timestamp === "number" &&
          typeof item.end_timestamp === "number" &&
          now >= item.start_timestamp &&
          now < item.end_timestamp,
      ) ?? slots.find((item) => typeof item.start_timestamp === "number" && item.start_timestamp > now);
    if (!slot || typeof slot.marketprice !== "number" || !Number.isFinite(slot.marketprice)) return null;
    const start = typeof slot.start_timestamp === "number" ? slot.start_timestamp : now;
    const end = typeof slot.end_timestamp === "number" ? slot.end_timestamp : start;
    return {
      value: (Math.round(slot.marketprice * 10) / 10).toFixed(1).replace(".", ","),
      label: "Euro / MWh",
      asOf: hourSpan(start, end),
      source: "Awattar Spot",
    };
  } catch {
    return null;
  }
}

async function readText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { accept: "text/plain, application/json" },
    signal: AbortSignal.timeout(4000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.text();
}

function shortDay(isoDay: string): string {
  const date = new Date(`${isoDay}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("de-AT", {
    timeZone: "Europe/Vienna",
    day: "numeric",
    month: "short",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value.replace(".", "") ?? "";
  return `${part("day")}. ${part("month")}`;
}

function hourSpan(startMs: number, endMs: number): string {
  const format = new Intl.DateTimeFormat("de-AT", {
    timeZone: "Europe/Vienna",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${format.format(startMs)}–${format.format(endMs)}`;
}

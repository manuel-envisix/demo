import { asCue, type CueDraft, type PublicState, type StoredCue } from "@/lib/cue";
import { sql } from "@/lib/db";

type Row = {
  mode: string;
  armed_at: Date | string | null;
  cue: unknown;
  replay: number | string | null;
};

const RETURNING = "returning mode, armed_at, cue, replay";

export async function readState(): Promise<PublicState> {
  const rows = await sql<Row>("select mode, armed_at, cue, replay from stage_state where id = 1");
  if (rows.length === 0) {
    await sql(
      "insert into stage_state (id, mode) values (1, 'idle') on conflict (id) do nothing",
    );
    return { mode: "idle", armedAt: null, replay: 0, cue: null };
  }
  return toPublic(rows[0]);
}

export async function arm(): Promise<PublicState> {
  const rows = await sql<Row>(
    `update stage_state
     set mode = 'armed', armed_at = now(), cue = null, updated_at = now()
     where id = 1
     ${RETURNING}`,
  );
  return toPublic(rows[0]);
}

export async function reset(): Promise<PublicState> {
  const rows = await sql<Row>(
    `update stage_state
     set mode = 'idle', armed_at = null, cue = null, updated_at = now()
     where id = 1
     ${RETURNING}`,
  );
  return toPublic(rows[0]);
}

export async function replay(): Promise<PublicState | null> {
  const rows = await sql<Row>(
    `update stage_state
     set replay = replay + 1, updated_at = now()
     where id = 1 and mode = 'live' and cue is not null
     ${RETURNING}`,
  );
  return rows[0] ? toPublic(rows[0]) : null;
}

export async function publishCue(draft: CueDraft): Promise<PublicState> {
  const cue: StoredCue = {
    ...draft,
    id: crypto.randomUUID(),
    source: "ring",
    receivedAt: new Date().toISOString(),
  };
  const rows = await sql<Row>(
    `update stage_state
     set mode = 'live', cue = $1::jsonb, updated_at = now()
     where id = 1
     ${RETURNING}`,
    [JSON.stringify(cue)],
  );
  return toPublic(rows[0]);
}

let lastWrite = 0;

export function tooFast(): boolean {
  const now = Date.now();
  if (now - lastWrite < 350) return true;
  lastWrite = now;
  return false;
}

function toPublic(row: Row | undefined): PublicState {
  if (!row) return { mode: "idle", armedAt: null, replay: 0, cue: null };
  const mode = row.mode === "armed" || row.mode === "live" ? row.mode : "idle";
  return {
    mode,
    armedAt: iso(row.armed_at),
    replay: Number(row.replay ?? 0),
    cue: asCue(row.cue),
  };
}

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

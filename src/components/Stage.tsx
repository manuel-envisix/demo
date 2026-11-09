"use client";

import { useEffect, useState } from "react";
import { RingMark, type Energy } from "@/components/RingMark";
import { PROBE_CUE, type Brief, type StoredCue } from "@/lib/cue";
import { formatDuration, formatStopwatch, viennaLabel, wallMs } from "@/lib/format";
import { useStageState } from "@/lib/useStageState";

type Phase = "idle" | "armed" | "live" | "probe";

export function Stage() {
  const { state, online } = useStageState();
  const [probeToken, setProbeToken] = useState(0);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "Escape") setProbeToken(0);
      if (event.shiftKey && (event.key === "P" || event.key === "p") && state?.mode !== "live") {
        setProbeToken((value) => value + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state?.mode]);

  useEffect(() => {
    if (state?.mode === "live") setProbeToken(0);
  }, [state?.mode]);

  const phase: Phase =
    probeToken > 0 && state?.mode !== "live" ? "probe" : (state?.mode ?? "idle");
  const cue = phase === "probe" ? PROBE_CUE : phase === "live" ? (state?.cue ?? null) : null;
  const playKey = cue ? `${cue.id}:${phase === "probe" ? probeToken : (state?.replay ?? 0)}` : "";
  const energy: Energy = phase === "live" || phase === "probe" ? "settle" : phase === "armed" ? "listen" : "rest";
  const clock = now == null ? null : viennaLabel(new Date(now));
  const armedMs =
    phase === "armed" && state?.armedAt && now != null
      ? Math.max(0, now - Date.parse(state.armedAt))
      : null;

  return (
    <main className="stage" data-phase={phase}>
      {phase === "probe" ? <p className="probe">Probe · Beispielzahlen · nicht der Ring</p> : null}
      <header className="top">
        <p className="brand">Getzner Werkstoffe</p>
        <p className={online ? "place" : "place is-offline"}>
          {online
            ? clock
              ? `${clock.when} · ${clock.event ? "Wirtschaftsforum" : "Festspielhaus"}`
              : "Festspielhaus"
            : "Keine Verbindung"}
        </p>
      </header>
      <section className="main">
        <div className="ring-col">
          <div className="ring-wrap">
            <RingMark energy={energy} />
          </div>
          {caption(phase) ? <p className="ring-caption">{caption(phase)}</p> : null}
        </div>
        <div className="copy">
          {cue ? (
            <LiveCopy cue={cue} playKey={playKey} />
          ) : (
            <div className="poster">
              <p className="kicker">Vocci Ring</p>
              <h1>
                Ein Satz.
                <br />
                Keine Folie.
              </h1>
              {armedMs != null ? (
                <p className="clock">
                  {formatStopwatch(armedMs)}
                  <small>seit dem Startzeichen</small>
                </p>
              ) : (
                <p className="ready">Bereit für den Ring</p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function LiveCopy({ cue, playKey }: { cue: StoredCue; playKey: string }) {
  const fit = cue.prompt.length > 260 ? "l" : cue.prompt.length > 140 ? "m" : "s";
  const wall = wallMs(cue.speechEndedAt, cue.receivedAt);
  const words = cue.prompt.split(" ");

  return (
    <div className="live" key={playKey} data-brief={cue.brief ? "true" : "false"}>
      <p className="kicker">{cue.source === "probe" ? "Probe" : "Der Satz vom Ring"}</p>
      <h1 className="sentence" data-fit={fit}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="word"
            style={{ animationDelay: `${Math.min(index * 26, 720)}ms` }}
          >
            {word}
          </span>
        ))}
      </h1>
      <div className="metrics">
        <Metric label="Gesprochen" ms={cue.spokenMs} delay={80} />
        <Metric label="Bis zum Text" ms={cue.transcriptLagMs} delay={180} />
        <Metric label="Bis auf die Wand" ms={wall} delay={280} />
      </div>
      {cue.brief ? (
        <BriefView brief={cue.brief} />
      ) : cue.lines && cue.lines.length > 0 ? (
        <ol className="plate">
          {cue.lines.map((line, index) => (
            <li key={`${line}-${index}`} style={{ animationDelay: `${520 + index * 120}ms` }}>
              <i>0{index + 1}</i>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="thesis">Nicht die Technik ist der Engpass, sondern die Vorstellungskraft.</p>
      )}
    </div>
  );
}

function BriefView({ brief }: { brief: Brief }) {
  return (
    <div className="brief">
      {brief.title ? <p className="brief-title">{brief.title}</p> : null}
      <p className="answer">{brief.answer}</p>
      {brief.facts.length > 0 ? (
        <div className="facts" data-count={brief.facts.length}>
          {brief.facts.map((fact, index) => (
            <p className="fact" key={`${fact.label}-${index}`}>
              <b>{fact.value}</b>
              <small>{fact.label}</small>
            </p>
          ))}
        </div>
      ) : null}
      {brief.source || brief.code ? (
        <p className="source">{[brief.code, brief.source].filter(Boolean).join(" · ")}</p>
      ) : null}
    </div>
  );
}

function Metric({ label, ms, delay }: { label: string; ms: number | null; delay: number }) {
  const shown = useCount(ms);
  const text = ms == null || shown == null ? { value: "—", unit: "" } : formatDuration(shown);
  return (
    <p className="metric">
      <b>
        {text.value}
        {text.unit ? <span className="unit">{text.unit}</span> : null}
      </b>
      <i className={ms == null ? "bar is-empty" : "bar"} style={{ animationDelay: `${delay}ms` }} />
      <small>{label}</small>
    </p>
  );
}

function useCount(target: number | null): number | null {
  const [value, setValue] = useState<number | null>(target == null ? null : 0);

  useEffect(() => {
    if (target == null) {
      setValue(null);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    let frame = 0;
    const step = (time: number) => {
      if (start == null) start = time;
      const progress = Math.min(1, (time - start) / 900);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    setValue(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

function caption(phase: Phase): string {
  if (phase === "probe") return "Probe";
  if (phase === "live") return "";
  if (phase === "armed") return "Nimmt auf";
  return "Bereit";
}

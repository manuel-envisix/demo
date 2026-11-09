"use client";

import { useEffect, useState } from "react";
import { COMPOSER_BRIEF, SPEAKING_LINES, cueFromBody } from "@/lib/cue";
import { formatDuration, wallMs } from "@/lib/format";
import type { Today } from "@/lib/live";
import { useStageState } from "@/lib/useStageState";

const TOKEN_KEY = "buehne.token";

export function Regie() {
  const { state, online } = useStageState();
  const [token, setToken] = useState("");
  const [stored, setStored] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [spoken, setSpoken] = useState<number | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY) ?? "";
    if (saved !== "") {
      setToken(saved);
      setStored(true);
    }
  }, []);

  const preview = text.trim() === "" ? null : cueFromBody({ text });
  const previewOk = preview != null && !("error" in preview);

  async function call(path: string, body?: unknown) {
    const current = window.localStorage.getItem(TOKEN_KEY) ?? "";
    if (current === "") {
      setMessage("Zuerst das Kennwort speichern.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: {
          authorization: `Bearer ${current}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body ?? {}),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Hat nicht geklappt.");
        return;
      }
      if (path === "/api/cue") {
        setText("");
        setMessage("Steht auf der Wand.");
      } else if (path === "/api/arm") {
        setSpoken(Date.now());
        setMessage("Die Wand hört zu. Jetzt in den Ring sprechen.");
      } else if (path === "/api/reset") {
        setSpoken(null);
        setMessage("Die Wand ist wieder bereit.");
      } else {
        setMessage("Läuft noch einmal.");
      }
    } catch {
      setMessage("Die Bühne ist nicht erreichbar.");
    } finally {
      setPending(false);
    }
  }

  function saveToken() {
    const next = token.trim();
    if (next === "") return;
    window.localStorage.setItem(TOKEN_KEY, next);
    setToken(next);
    setStored(true);
    setMessage("Kennwort bleibt in diesem Browser.");
  }

  async function paste() {
    try {
      setText(await navigator.clipboard.readText());
      setMessage("Eingefügt. Erst prüfen, dann auf die Wand.");
    } catch {
      setMessage("Zwischenablage nicht lesbar. Den Block von Hand einsetzen.");
    }
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(COMPOSER_BRIEF);
      setMessage("Auftrag ist in der Zwischenablage.");
    } catch {
      setMessage("Auftrag ist unten. Von Hand markieren.");
    }
  }

  async function copyLine(line: string) {
    try {
      await navigator.clipboard.writeText(line);
      setMessage("Satz zum Vorlesen kopiert. Nicht auf die Wand schicken.");
    } catch {
      setMessage(line);
    }
  }

  const cue = state?.cue;
  const sinceSpoken = spoken == null ? null : formatDuration(Date.now() - spoken);

  return (
    <main className="regie">
      <p className="regie-warn">Regie. Nicht auf die Leinwand.</p>
      <header className="regie-head">
        <h1>Ein Satz</h1>
        <p className={online ? "regie-status" : "regie-status is-offline"}>
          {online ? "Wand verbunden" : "Wand nicht erreichbar"}
          {state ? ` · ${label(state.mode)}` : ""}
        </p>
      </header>

      {cue ? (
        <p className="regie-now">
          {cue.prompt}
          {cue.sessionId ? <small>Aufnahme {cue.sessionId}</small> : null}
        </p>
      ) : null}

      <section className="regie-block">
        <h2>Kennwort</h2>
        {stored ? (
          <p className="regie-note">
            In diesem Browser gespeichert.{" "}
            <button type="button" className="text-button" onClick={() => setStored(false)}>
              Ändern
            </button>
          </p>
        ) : (
          <div className="regie-row">
            <input
              type="password"
              autoComplete="current-password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="INGEST_TOKEN"
              aria-label="Kennwort"
            />
            <button type="button" onClick={saveToken}>
              Speichern
            </button>
          </div>
        )}
        <p className="regie-note">
          Dasselbe Kennwort, das als INGEST_TOKEN für die Bühne hinterlegt ist.
        </p>
      </section>

      <section className="regie-block">
        <h2>Donnerstag</h2>
        <button type="button" className="primary" disabled={pending} onClick={() => call("/api/arm")}>
          Ich spreche jetzt
        </button>
        {sinceSpoken ? (
          <p className="regie-note">
            Startzeichen vor {sinceSpoken.value} {sinceSpoken.unit}. Die Uhr auf der Wand zählt mit.
          </p>
        ) : null}
        <ol className="steps">
          <li>Leinwand auf die Startseite, diese Seite am Telefon lassen.</li>
          <li>Startzeichen tippen, denselben Moment in den Ring sprechen.</li>
          <li>Auftrag an Composer. Den Block hier einfügen. Auf die Wand.</li>
        </ol>
        <button type="button" onClick={copyBrief}>
          Auftrag kopieren
        </button>
      </section>

      <section className="regie-block">
        <h2>Zum Vorlesen</h2>
        <p className="regie-note">Einer der drei Sätze in den Ring. Erst der Rücklauf kommt auf die Wand.</p>
        <div className="choices">
          {SPEAKING_LINES.map((line, index) => (
            <button type="button" key={line} onClick={() => copyLine(line)}>
              <i>0{index + 1}</i>
              {line}
            </button>
          ))}
        </div>
      </section>

      <section className="regie-block">
        <h2>Auf die Wand</h2>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="SATZ: …"
          aria-label="Block vom Ring"
          spellCheck={false}
        />
        <div className="regie-row">
          <button type="button" onClick={paste}>
            Einfügen
          </button>
          <button type="button" className="primary" disabled={pending || !previewOk} onClick={() => call("/api/cue", { text })}>
            Auf die Leinwand
          </button>
        </div>
        {preview && "error" in preview ? <p className="regie-error">{preview.error}</p> : null}
        {preview && !("error" in preview) ? (
          <div className="preview">
            <p>{preview.prompt}</p>
            {preview.brief ? <p>{preview.brief.answer}</p> : null}
            <p>
              Gesprochen {show(preview.spokenMs)} · Text {show(preview.transcriptLagMs)} · Wand{" "}
              {show(wallMs(preview.speechEndedAt, new Date().toISOString()))}
            </p>
          </div>
        ) : null}
        <p className="regie-note">
          „Bis auf die Wand“ misst der Server, vom Ende der Aufnahme bis zum Eintreffen. Die Vorschau
          rechnet bis jetzt und wird auf der Leinwand kleiner, sobald der Block ankommt.
        </p>
      </section>

      <section className="regie-actions">
        <button type="button" disabled={pending} onClick={() => call("/api/replay")}>
          Nochmal abspielen
        </button>
        <button type="button" disabled={pending} onClick={() => call("/api/reset")}>
          Zurück auf Bereit
        </button>
      </section>

      {message ? <p className="regie-message">{message}</p> : null}

      <TodayStrip />

      <section className="regie-block">
        <h2>Auftrag</h2>
        <pre>{COMPOSER_BRIEF}</pre>
        <p className="regie-note">
          Probe auf der Leinwand: Umschalttaste und P. Escape blendet sie aus. Eine echte Aufnahme
          ersetzt die Probe.
        </p>
      </section>
    </main>
  );
}

function TodayStrip() {
  const [today, setToday] = useState<Today | null>(null);

  useEffect(() => {
    let stop = false;
    fetch("/api/today")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Today | null) => {
        if (!stop) setToday(data);
      })
      .catch(() => {
        if (!stop) setToday(null);
      });
    return () => {
      stop = true;
    };
  }, []);

  return (
    <section className="regie-block">
      <h2>Heute, falls der Satz danach fragt</h2>
      {today ? (
        <div className="today">
          <p>
            <b>{today.euroDollar ? today.euroDollar.value : "—"}</b>
            <span>{today.euroDollar ? `${today.euroDollar.label}, ${today.euroDollar.asOf}` : "Kurs nicht da"}</span>
          </p>
          <p>
            <b>{today.power ? today.power.value : "—"}</b>
            <span>{today.power ? `${today.power.label}, ${today.power.asOf}` : "Strom nicht da"}</span>
          </p>
        </div>
      ) : (
        <p className="regie-note">Die Live-Zahlen laden.</p>
      )}
      <p className="regie-note">Quelle ist EZB und Awattar. Ohne diese Zahl im Block bleibt sie von der Leinwand.</p>
    </section>
  );
}

function label(mode: "idle" | "armed" | "live"): string {
  if (mode === "armed") return "hört zu";
  if (mode === "live") return "Satz steht";
  return "bereit";
}

function show(ms: number | null): string {
  if (ms == null) return "—";
  const formatted = formatDuration(ms);
  return `${formatted.value} ${formatted.unit}`;
}

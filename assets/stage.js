import { PROBE_CUE, PROBE_HTML, liveState, normalizeState, parseCueText } from "./cue.js";
import { formatDuration, formatStopwatch, viennaLabel, wallMs } from "./format.js";
import { startRing } from "./ring.js";

const IDLE = {
  updatedAt: "",
  mode: "idle",
  armedAt: null,
  replay: 0,
  receivedAt: "",
  page: false,
  block: "",
  html: null,
};

const channel = new BroadcastChannel("buehne");
const stage = document.querySelector("#stage");
const copy = document.querySelector("#copy");
let fileState = IDLE;
let overlay = readOverlay();
let online = true;
let probeToken = 0;
let paintedKey = "";
let energy = "rest";

startRing(document.querySelector("#ring-path"), () => energy);
channel.onmessage = (event) => {
  const next = normalizeState(event.data);
  if (!next) return;
  overlay = next;
  sessionStorage.setItem("buehne.overlay", JSON.stringify(next));
  paint();
};

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    probeToken = 0;
    paint();
  }
  if (event.key === "P" && event.shiftKey && current().mode !== "live") {
    probeToken += 1;
    paint();
  }
});

window.addEventListener("paste", (event) => {
  const text = event.clipboardData?.getData("text/plain") ?? "";
  const trimmed = text.trim();
  if (!/^SATZ\s*:/im.test(trimmed) && !trimmed.startsWith("{") && !/^NOCH KEIN TEXT/i.test(trimmed)) return;
  const next = normalizeState(liveState(trimmed, current()));
  if (!next || next.mode !== "live") return;
  event.preventDefault();
  overlay = next;
  sessionStorage.setItem("buehne.overlay", JSON.stringify(next));
  channel.postMessage(next);
  paint();
});

setInterval(updateClocks, 1000);
poll();
setInterval(() => {
  if (!document.hidden) poll();
}, 1000);

async function poll() {
  try {
    const response = await fetch(`state.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    const next = normalizeState(await response.json());
    online = true;
    if (next) fileState = next;
  } catch {
    online = false;
  }
  paint();
}

function current() {
  if (!overlay) return fileState;
  if (Date.parse(overlay.updatedAt) > Date.parse(fileState.updatedAt || 0)) return overlay;
  return fileState;
}

function readOverlay() {
  try {
    return normalizeState(JSON.parse(sessionStorage.getItem("buehne.overlay") || "null"));
  } catch {
    return null;
  }
}

function paint() {
  const state = current();
  if (state.mode === "live") probeToken = 0;
  const phase = probeToken > 0 && state.mode !== "live" ? "probe" : state.mode;
  energy = phase === "live" || phase === "probe" ? "settle" : phase === "armed" ? "listen" : "rest";
  const key = [phase, state.updatedAt, state.replay, state.page, state.html ? "doc" : "file", online, probeToken].join("|");
  stage.dataset.phase = phase;
  stage.dataset.page = phase === "probe" || (phase === "live" && state.page) ? "true" : "false";
  stage.classList.toggle("is-probe", phase === "probe");
  const probe = stage.querySelector(".probe");
  if (probe) probe.hidden = phase !== "probe";
  const caption = stage.querySelector(".ring-caption");
  const captionText = phase === "probe" ? "Probe" : phase === "armed" ? "Nimmt auf" : phase === "live" ? "" : "Bereit";
  caption.hidden = captionText === "";
  caption.textContent = captionText;
  updateClocks();
  if (key === paintedKey) return;
  paintedKey = key;
  copy.replaceChildren();
  if (phase === "probe") {
    copy.append(liveView(PROBE_CUE, `probe:${probeToken}`, true, PROBE_HTML, false));
    return;
  }
  if (phase !== "live") {
    copy.append(poster(phase, state));
    return;
  }
  const parsed = parseCueText(state.block);
  if (parsed.error) {
    const card = poster("idle", state);
    card.append(el("p", "thesis", parsed.error));
    copy.append(card);
    return;
  }
  copy.append(
    liveView(
      { ...parsed.cue, source: "ring", receivedAt: state.receivedAt },
      `${state.updatedAt}:${state.replay}`,
      state.page,
      state.html,
    ),
  );
}

function poster(phase, state) {
  const card = el("div", "poster");
  card.append(el("p", "kicker", "Vocci Ring"));
  const title = document.createElement("h1");
  title.append("Eine Aufgabe.", document.createElement("br"), "Eine Seite.");
  card.append(title);
  if (phase === "armed" && state.armedAt) {
    const clock = el("p", "clock");
    clock.append(el("span", "clock-value", formatStopwatch(Date.now() - Date.parse(state.armedAt))));
    clock.append(el("small", "", "seit dem Startzeichen"));
    card.append(clock);
  } else {
    card.append(el("p", "ready", "Bereit für den Ring"));
  }
  return card;
}

function liveView(cue, playKey, pageReady, srcdoc, showUrl = true) {
  const view = el("div", "live");
  view.dataset.brief = !pageReady && cue.brief ? "true" : "false";
  view.dataset.page = pageReady ? "true" : "false";
  view.append(el("p", "kicker", cue.source === "probe" ? "Probe" : "Der Satz vom Ring"));
  const fit = cue.prompt.length > 260 ? "l" : cue.prompt.length > 140 ? "m" : "s";
  const sentence = el("h1", "sentence");
  sentence.dataset.fit = fit;
  cue.prompt.split(" ").forEach((word, index) => {
    const span = el("span", "word", word);
    span.style.animationDelay = `${Math.min(index * 26, 720)}ms`;
    sentence.append(span);
  });
  view.append(sentence);
  const metrics = el("div", "metrics");
  metrics.append(metric("Gesprochen", cue.spokenMs, 80));
  metrics.append(metric("Bis zum Text", cue.transcriptLagMs, 180));
  metrics.append(metric("Bis auf die Wand", wallMs(cue.speechEndedAt, cue.receivedAt), 280));
  view.append(metrics);
  if (pageReady) {
    const wrap = el("div", "frame-wrap");
    const frame = document.createElement("iframe");
    frame.title = "Gebaute Seite";
    frame.setAttribute("sandbox", "allow-scripts allow-forms");
    frame.setAttribute("scrolling", "no");
    if (typeof srcdoc === "string") frame.srcdoc = srcdoc;
    else frame.src = `gebaut.html?v=${encodeURIComponent(playKey)}`;
    wrap.append(frame);
    view.append(wrap);
    const link = publicUrl();
    if (showUrl && link) view.append(el("p", "public-url", link));
  } else if (cue.brief) {
    view.append(briefView(cue.brief));
  } else if (cue.lines && cue.lines.length > 0) {
    const list = el("ol", "plate");
    cue.lines.forEach((line, index) => {
      const item = document.createElement("li");
      item.style.animationDelay = `${520 + index * 120}ms`;
      item.append(el("i", "", `0${index + 1}`), el("span", "", line));
      list.append(item);
    });
    view.append(list);
  } else {
    view.append(el("p", "thesis", "Die Seite wird geschrieben."));
  }
  return view;
}

function briefView(brief) {
  const view = el("div", "brief");
  if (brief.title) view.append(el("p", "brief-title", brief.title));
  view.append(el("p", "answer", brief.answer));
  if (brief.facts.length > 0) {
    const facts = el("div", "facts");
    facts.dataset.count = String(brief.facts.length);
    for (const fact of brief.facts) {
      const row = el("p", "fact");
      row.append(el("b", "", fact.value), el("small", "", fact.label));
      facts.append(row);
    }
    view.append(facts);
  }
  const source = [brief.code, brief.source].filter(Boolean).join(" · ");
  if (source) view.append(el("p", "source", source));
  return view;
}

function metric(label, ms, delay) {
  const row = el("p", "metric");
  const strong = document.createElement("b");
  const number = document.createTextNode("");
  const unit = el("span", "unit");
  strong.append(number, unit);
  const bar = el("i", ms == null ? "bar is-empty" : "bar");
  bar.style.animationDelay = `${delay}ms`;
  row.append(strong, bar, el("small", "", label));
  const write = (value) => {
    if (value == null) {
      number.nodeValue = "—";
      unit.textContent = "";
      return;
    }
    const text = formatDuration(value);
    number.nodeValue = text.value;
    unit.textContent = text.unit;
  };
  if (ms == null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    write(ms);
    return row;
  }
  const start = performance.now();
  const step = (time) => {
    const progress = Math.min(1, (time - start) / 900);
    const eased = 1 - (1 - progress) ** 3;
    write(ms * eased);
    if (progress < 1) requestAnimationFrame(step);
  };
  write(0);
  requestAnimationFrame(step);
  return row;
}

function updateClocks() {
  const place = stage.querySelector(".place");
  if (!online) {
    place.textContent = "Keine Verbindung";
    place.classList.add("is-offline");
  } else {
    const clock = viennaLabel(new Date());
    place.textContent = `${clock.when} · ${clock.event ? "Wirtschaftsforum" : "Festspielhaus"}`;
    place.classList.remove("is-offline");
  }
  const value = stage.querySelector(".clock-value");
  const state = current();
  if (value && state.armedAt) value.textContent = formatStopwatch(Date.now() - Date.parse(state.armedAt));
}

function publicUrl() {
  if (!location.host) return "";
  const url = new URL("gebaut.html", location.href);
  return `${url.host}${url.pathname}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

import { COMPOSER_BRIEF, SPEAKING_LINES, liveState, normalizeState, parseCueText } from "./cue.js";

const channel = new BroadcastChannel("buehne");
const lines = document.querySelector("#lines");
const brief = document.querySelector("#brief");
const text = document.querySelector("#block");
const preview = document.querySelector("#preview");
const message = document.querySelector("#message");
const status = document.querySelector("#status");
const pageLink = document.querySelector("#page-link");
let fileState = null;
let lastSent = null;

brief.textContent = COMPOSER_BRIEF;
SPEAKING_LINES.forEach((line, index) => {
  const button = document.createElement("button");
  button.type = "button";
  const mark = document.createElement("i");
  mark.textContent = `0${index + 1}`;
  const label = document.createElement("span");
  label.textContent = line;
  button.append(mark, label);
  button.addEventListener("click", () => copy(line, "Satz zum Vorlesen kopiert. Nicht auf die Wand schicken."));
  lines.append(button);
});

document.querySelector("#copy-brief").addEventListener("click", () => {
  copy(COMPOSER_BRIEF, "Auftrag ist in der Zwischenablage.");
});
document.querySelector("#paste").addEventListener("click", async () => {
  try {
    text.value = await navigator.clipboard.readText();
    renderPreview();
    say("Eingefügt. Erst prüfen, dann auf die Wand.");
  } catch {
    say("Zwischenablage nicht lesbar. Den Block von Hand einsetzen.");
  }
});
document.querySelector("#arm").addEventListener("click", () => {
  const now = new Date().toISOString();
  send({
    updatedAt: now,
    mode: "armed",
    armedAt: now,
    replay: fileState?.replay ?? 0,
    receivedAt: "",
    page: false,
    block: "",
    html: null,
  });
  say("Startzeichen in diesem Browser. Auf dem Server: python3 uebernehmen.py --aufnahme");
});
document.querySelector("#go").addEventListener("click", () => {
  const next = liveState(text.value, lastSent ?? fileState);
  if (next.error) {
    say(next.error);
    return;
  }
  lastSent = next;
  send(next);
  say("In diesem Browser auf der Wand. Öffentlich wird es mit python3 uebernehmen.py");
});
document.querySelector("#replay").addEventListener("click", () => {
  const base = lastSent ?? (fileState?.mode === "live" ? fileState : null);
  if (!base || base.mode !== "live") {
    say("Noch kein Satz auf der Bühne.");
    return;
  }
  send({ ...base, updatedAt: new Date().toISOString(), replay: (base.replay ?? 0) + 1 });
});
document.querySelector("#reset").addEventListener("click", () => {
  const now = new Date().toISOString();
  lastSent = null;
  send({
    updatedAt: now,
    mode: "idle",
    armedAt: null,
    replay: 0,
    receivedAt: "",
    page: false,
    block: "",
    html: null,
  });
  say("Dieser Browser ist wieder bereit. Auf dem Server: python3 uebernehmen.py --bereit");
});
text.addEventListener("input", renderPreview);
renderPreview();
poll();
setInterval(poll, 2000);

function send(state) {
  channel.postMessage(state);
}

function renderPreview() {
  preview.replaceChildren();
  const raw = text.value.trim();
  if (raw === "") {
    document.querySelector("#go").disabled = true;
    return;
  }
  const parsed = parseCueText(raw);
  if (parsed.error) {
    preview.append(note(parsed.error, "regie-error"));
    document.querySelector("#go").disabled = true;
    return;
  }
  document.querySelector("#go").disabled = false;
  preview.append(note(parsed.cue.prompt, ""));
  preview.append(
    note(
      parsed.html ? `Seite: ${parsed.html.length.toLocaleString("de-AT")} Zeichen` : "Noch keine Seite im Block.",
      "",
    ),
  );
  const spoken = show(parsed.cue.spokenMs);
  const lag = show(parsed.cue.transcriptLagMs);
  preview.append(note(`Gesprochen ${spoken} · Text ${lag}`, ""));
}

async function poll() {
  try {
    const response = await fetch(`state.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    fileState = normalizeState(await response.json());
    const label = fileState?.mode === "live" ? "Satz liegt in state.json" : fileState?.mode === "armed" ? "Aufnahme" : "Bereit";
    status.textContent = label;
    status.classList.remove("is-offline");
    pageLink.hidden = !fileState?.page;
  } catch {
    status.textContent = "state.json nicht erreichbar";
    status.classList.add("is-offline");
  }
}

async function copy(value, ok) {
  try {
    await navigator.clipboard.writeText(value);
    say(ok);
  } catch {
    say(value);
  }
}

function say(value) {
  message.textContent = value;
}

function show(ms) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

function note(value, className) {
  const node = document.createElement("p");
  if (className) node.className = className;
  node.textContent = value;
  return node;
}

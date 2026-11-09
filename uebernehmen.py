#!/usr/bin/env python3
"""Schreibt state.json und gebaut.html aus dem Composer-Block. Kein Server."""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATE = ROOT / "state.json"
DEMO_STATE = ROOT / "demo-state.json"
PAGE = ROOT / "gebaut.html"
WAITING = ROOT / "assets" / "warten.html"
MAX_HTML = 180_000


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def load():
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"replay": 0, "armedAt": None}


def save(state):
    temporary = Path(str(STATE) + ".tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(STATE)


def write_page(html):
    temporary = Path(str(PAGE) + ".tmp")
    temporary.write_text(html, encoding="utf-8")
    temporary.replace(PAGE)


def waiting():
    return WAITING.read_text(encoding="utf-8")


def strip_fence(raw):
    match = re.fullmatch(r"```[a-z]*\n([\s\S]*?)\n```", raw.strip(), re.I)
    return match.group(1) if match else raw


def split_html(raw):
    match = re.search(r"(?im)^HTML:\s*", raw)
    if not match:
        return raw.strip(), None
    head = raw[: match.start()].strip()
    html = raw[match.end() :].strip()
    return head, html or None


def normalize(html):
    if html is None:
        return None
    if len(html) > MAX_HTML:
        sys.exit("Die Seite ist zu groß.")
    if "<" not in html:
        sys.exit("Die Seite braucht HTML.")
    if re.search(r"(?i)<(?:html|!doctype)\b", html):
        return html
    return (
        "<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\"><title>Gebaut</title></head><body>"
        + html
        + "</body></html>"
    )


def write_demo_state(*, live_demo: bool, experience: str):
    payload = {
        "live-demo": live_demo,
        "experience": experience,
        "updatedAt": now(),
        "note": "live-demo=false → Ring-Standard · live-demo=true + live → 3D-Erlebnis",
    }
    temporary = Path(str(DEMO_STATE) + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(DEMO_STATE)
    print(f"demo-state: live-demo={live_demo} experience={experience}")


def live_demo_off():
    write_demo_state(live_demo=False, experience="start")


def live_demo_on():
    write_demo_state(live_demo=True, experience="live")


def demo_start():
    live_demo_off()


def demo_working():
    write_demo_state(live_demo=True, experience="working")


def demo_live():
    live_demo_on()


def bereit():
    write_page(waiting())
    save(
        {
            "updatedAt": now(),
            "mode": "idle",
            "armedAt": None,
            "replay": 0,
            "receivedAt": "",
            "page": False,
            "block": "",
        }
    )
    print("bereit")


def aufnahme():
    current = load()
    write_page(waiting())
    save(
        {
            "updatedAt": now(),
            "mode": "armed",
            "armedAt": now(),
            "replay": int(current.get("replay") or 0),
            "receivedAt": "",
            "page": False,
            "block": "",
        }
    )
    print("aufnahme")


def nochmal():
    current = load()
    if current.get("mode") != "live" or not str(current.get("block") or "").strip():
        sys.exit("Noch kein Satz auf der Bühne.")
    current["replay"] = int(current.get("replay") or 0) + 1
    current["updatedAt"] = now()
    save(current)
    print("nochmal")


def uebernehmen(raw):
    text = strip_fence(raw.replace("\ufeff", "")).strip()
    if text == "":
        sys.exit("Der Satz fehlt.")
    if re.match(r"(?i)^NOCH KEIN TEXT\b", text):
        sys.exit("Der Ring hat noch kein Transkript.")
    head, html = split_html(text)
    if head == "":
        sys.exit("Der Satz fehlt.")
    page = normalize(html)
    if page is None:
        write_page(waiting())
    else:
        write_page(page)
    current = load()
    received = now()
    save(
        {
            "updatedAt": received,
            "mode": "live",
            "armedAt": current.get("armedAt"),
            "replay": int(current.get("replay") or 0),
            "receivedAt": received,
            "page": page is not None,
            "block": head,
        }
    )
    print("gebaut.html öffentlich" if page is not None else "satz ohne seite")


def main():
    args = sys.argv[1:]
    if "--bereit" in args:
        bereit()
        return
    if "--aufnahme" in args:
        aufnahme()
        return
    if "--nochmal" in args:
        nochmal()
        return
    if "--demo-start" in args:
        demo_start()
        return
    if "--demo-working" in args:
        demo_working()
        return
    if "--demo-live" in args:
        demo_live()
        return
    if "--live-demo-off" in args:
        live_demo_off()
        return
    if "--live-demo-on" in args:
        live_demo_on()
        return
    files = [arg for arg in args if not arg.startswith("--")]
    if files:
        raw = Path(files[0]).read_text(encoding="utf-8")
    else:
        raw = sys.stdin.read()
    uebernehmen(raw)


if __name__ == "__main__":
    main()

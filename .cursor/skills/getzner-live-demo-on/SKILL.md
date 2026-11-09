---
name: getzner-live-demo-on
description: >-
  Aktiviert die Getzner-3D-Live-Demo auf ring-demo.envisix.at (Feature-Flag live-demo=true).
  Standard-Vocci-Trigger: Aufnahme mit „Getzner“ und „Zug“ → nur diesen Skill ausführen,
  keinen Seiten-Inhalt aus dem Transkript übernehmen. Commit, Push, Deploy Pflicht.
---

# Getzner — Live-Demo aktivieren (`live-demo`)

## Ziel

Root-URL zeigt die **3D-Erlebniswelt** (React/Three.js). Feature-Flag `live-demo: true`, `experience: live`.

## Vocci / Engineer Bot (verbindlich)

Wenn eine Ring-Aufnahme **sowohl „Getzner“ als auch „Zug“** enthält (oder der Nutzer explizit sagt: *Feature-Flag live-demo aktivieren*):

1. **Nur** diesen Skill ausführen — **kein** `uebernehmen.py` mit SATZ/HTML aus dem Transkript.
2. Den gesprochenen Inhalt **nicht** als neue öffentliche Seite interpretieren.
3. Dem Nutzer in einem Satz bestätigen: Live-Demo wird freigeschaltet und deployt.

## Ablauf (strikt in dieser Reihenfolge)

1. Im Repo-Root:
   ```bash
   python3 uebernehmen.py --live-demo-on
   ```
   Erwartet: `demo-state: live-demo=True experience=live`

2. Commit und Push:
   ```bash
   git add demo-state.json
   git commit -m "Demo: live-demo on — 3D-Erlebniswelt freigeben"
   git push -u origin "$(git branch --show-current)"
   ```

3. **Deploy abwarten** — Workflow „Deploy ring-demo“ muss erfolgreich sein.

4. Optional `experience: working` nur während laufender Agent-Pipeline:
   ```bash
   python3 uebernehmen.py --demo-working
   ```
   Danach wieder `--live-demo-on`, wenn die Demo fertig ist.

## Alternative

GitHub → Actions → **Demo experience mode** → `activate-live-demo`.

## Arbeitsmodus / Reset

- Standardansicht ohne Demo: Skill `getzner-live-demo-reset` (`--live-demo-off`).

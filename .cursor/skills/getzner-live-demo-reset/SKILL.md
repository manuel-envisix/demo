---
name: getzner-live-demo-reset
description: >-
  Setzt ring-demo.envisix.at auf die Ring-Standardansicht zurück (ohne 3D-Live-Demo).
  Feature-Flag live-demo bleibt im Code, wird auf false gesetzt. Commit, Push und
  Deploy sind Pflicht. Nutzen bei Vocci-Formulierungen außer der Live-Demo-Freigabe
  oder wenn ausdrücklich Standard/Bühne gewünscht ist.
---

# Getzner — Standardansicht (live-demo aus)

## Ziel

Öffentliche Root-URL zeigt wieder die **Vocci-Ring-Bühne** (`/buehne/index.html`), nicht die 3D-Erlebniswelt. Die 3D-App bleibt im Repo und im Build — nur das Feature-Flag `live-demo` steuert die Sichtbarkeit.

## Ablauf (strikt in dieser Reihenfolge)

1. Im Repo-Root (Ordner mit `uebernehmen.py` und `demo-state.json`):
   ```bash
   python3 uebernehmen.py --live-demo-off
   ```
   Erwartet: `demo-state: live-demo=False experience=start`

2. Nur `demo-state.json` committen (keine unrelated Änderungen):
   ```bash
   git add demo-state.json
   git commit -m "Demo: live-demo off — Ring-Standardansicht"
   git push -u origin "$(git branch --show-current)"
   ```

3. **Deploy abwarten:** Jeder Push startet „Deploy ring-demo“. CI muss grün sein:
   ```bash
   gh run list -R manuel-envisix/demo -L 3
   ```
   Optional `cursor-subscriptions` → `subscribe_github_ci` auf den Branch, statt Polling.

4. Kurz bestätigen: `demo-state.json` enthält `"live-demo": false` und `"experience": "start"`.

## Vocci / Engineer Bot

Wenn die Aufnahme **nicht** die Live-Demo-Freigabe ist und stattdessen Standard/Bühne/Reset verlangt → diesen Skill ausführen.

**Nicht** den Inhalt einer Getzner/Zug-Aufnahme als neue Seite bauen, wenn die Projektregel nur Live-Demo-Freigabe vorsieht (siehe `getzner-live-demo-on`).

## Alternative (ohne Shell auf dem Server)

GitHub → Actions → **Demo experience mode** → `reset-standard` → Commit löst Deploy aus.

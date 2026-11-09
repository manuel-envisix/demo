import { useEffect, useState } from 'react';
import App from './App.jsx';

const POLL_MS = 1500;

export function DemoGate() {
  const [mode, setMode] = useState('loading');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/buehne/demo-state.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (alive) setMode(data.experience ?? 'live');
      } catch {
        if (alive) setMode('live');
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (mode === 'loading') {
    return (
      <div className="demo-working">
        <h1>Getzner Digital Twin</h1>
        <p>Demo-Status wird geladen…</p>
      </div>
    );
  }

  if (mode === 'start') {
    return (
      <div className="demo-gate">
        <iframe title="Vocci Ring — Eine Aufgabe. Eine Seite." src="/buehne/index.html" />
      </div>
    );
  }

  if (mode === 'working') {
    return (
      <div className="demo-working">
        <h1>Agent arbeitet an der Erlebniswelt</h1>
        <p>
          Die 3D-Anwendung bleibt im Repository bereit. Dieser Modus zeigt den echten Pipeline-Status
          — kein simuliertes Ergebnis.
        </p>
        <p className="illus-note">
          Freigabe über <code>python3 uebernehmen.py --demo-live</code> oder GitHub Workflow
          „Demo-Modus“.
        </p>
      </div>
    );
  }

  return <App />;
}

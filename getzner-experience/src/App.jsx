import { useMemo, useState } from 'react';
import { GETZNER, PRODUCTS } from './assets.js';
import { Experience } from './scene/Experience.jsx';

function formatDb(v) {
  return `${v.toFixed(1)} dB`;
}

function formatMm(v) {
  return `${v.toFixed(2)} mm/s`;
}

export default function App() {
  const [protectedTrack, setProtectedTrack] = useState(true);
  const [speed, setSpeed] = useState(0.55);
  const [productId, setProductId] = useState('sylodyn');

  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

  const metrics = useMemo(() => {
    const baseStructure = protectedTrack ? 42 : 78;
    const baseResident = protectedTrack ? 28 : 61;
    const velocity = protectedTrack ? 0.35 : 2.85;
    const reduction = protectedTrack ? 68 : 0;
    return {
      structure: baseStructure + speed * 8,
      resident: baseResident + speed * 6,
      velocity,
      reduction,
      buildings: [
        { name: 'Wohnhaus A', v: protectedTrack ? 12 + speed * 5 : 48 + speed * 12 },
        { name: 'Hotel', v: protectedTrack ? 18 + speed * 4 : 55 + speed * 10 },
        { name: 'Werkstatt', v: protectedTrack ? 9 + speed * 3 : 38 + speed * 8 },
        { name: 'Schule', v: protectedTrack ? 14 + speed * 4 : 52 + speed * 11 },
      ],
    };
  }, [protectedTrack, speed]);

  return (
    <div className="app-shell">
      <div className="canvas-layer">
        <Experience protectedTrack={protectedTrack} speed={speed} />
      </div>
      <div className="ui-layer">
        <header className="top-bar">
          <div className="brand">
            <img src={GETZNER.logo} alt="Getzner Werkstoffe" width={140} height={28} />
            <div className="brand-text">
              <h1>Engineering a quiet future</h1>
              <p>Alpine-Bahn · Schwingungsausbreitung im Boden · Live-Simulation</p>
            </div>
          </div>
          <div className="mode-pills" role="tablist" aria-label="Schutzmodus">
            <button
              type="button"
              role="tab"
              aria-selected={protectedTrack}
              className={`pill ${protectedTrack ? 'active' : ''}`}
              onClick={() => setProtectedTrack(true)}
            >
              Mit Getzner-Schutz
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!protectedTrack}
              className={`pill warn ${!protectedTrack ? 'active' : ''}`}
              onClick={() => setProtectedTrack(false)}
            >
              Ohne Isolation
            </button>
          </div>
        </header>

        <aside className="side-panel" aria-label="Messwerte und Produkte">
          <section className="card">
            <h2>Strukturphysik · Messpunkt</h2>
            <div className="metric-row">
              <div className="metric">
                <label>Körperschall Oberbau</label>
                <strong className={protectedTrack ? 'good' : 'bad'}>
                  {formatDb(metrics.structure)}
                </strong>
              </div>
              <div className="metric">
                <label>Im Gebäude (Δ)</label>
                <strong className={protectedTrack ? 'good' : 'bad'}>
                  {formatDb(metrics.resident)}
                </strong>
              </div>
            </div>
            <div className="metric-row">
              <div className="metric">
                <label>Bodenschwinggeschw.</label>
                <strong className={protectedTrack ? 'good' : 'bad'}>
                  {formatMm(metrics.velocity)}
                </strong>
              </div>
              <div className="metric">
                <label>Dämpfung Getzner</label>
                <strong className={protectedTrack ? 'good' : 'bad'}>
                  {metrics.reduction > 0 ? `${metrics.reduction}%` : '—'}
                </strong>
              </div>
            </div>
            <div className="bar-chart">
              {metrics.buildings.map((b) => (
                <div className="bar-item" key={b.name}>
                  <span>{b.name}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(100, b.v)}%`,
                        background: protectedTrack
                          ? 'linear-gradient(90deg, #007a3d, #00c96e)'
                          : 'linear-gradient(90deg, #b33a22, #ff6b4a)',
                      }}
                    />
                  </div>
                  <span>{Math.round(b.v)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Produktvisualisierungen · getzner.com</h2>
            <div className="product-grid">
              {PRODUCTS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`product-tile ${p.id === productId ? 'selected' : ''}`}
                  onClick={() => setProductId(p.id)}
                >
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <p className="product-detail">
              {product.blurb}{' '}
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                Produktdetails →
              </a>
            </p>
          </section>
        </aside>

        <footer className="bottom-bar">
          <div className="timeline">
            <label htmlFor="speed">Zuggeschwindigkeit · ICE-Alpenkorridor</label>
            <input
              id="speed"
              type="range"
              min={0.15}
              max={1}
              step={0.01}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>
          <p className="hint">
            <kbd>Drag</kbd> Kamera drehen · <kbd>Scroll</kbd> Zoom · Schwingungsringe breiten sich im
            Untergrund aus — mit Sylodyn®/Sylomer® gedämpft.
          </p>
        </footer>
      </div>
    </div>
  );
}

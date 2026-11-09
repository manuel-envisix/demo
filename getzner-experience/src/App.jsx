import { useMemo, useRef, useState, useCallback } from 'react';

import { GETZNER, PRODUCTS } from './assets.js';
import { Experience } from './scene/Experience.jsx';
import { WaveformChart } from './components/WaveformChart.jsx';
import { TrackTimeline } from './components/TrackTimeline.jsx';
import { kmFromU, uFromKm } from './track.js';

const CAMERAS = [
  { id: 'follow', label: 'Verfolgung' },
  { id: 'side', label: 'Seite' },
  { id: 'inside', label: 'Innen' },
  { id: 'free', label: 'Freie Kamera' },
  { id: 'ground', label: 'Boden' },
  { id: 'product', label: 'Produkt' },
];

const VIEWS = [
  { id: 'overview', label: 'Gesamt' },
  { id: 'ground', label: 'Boden' },
  { id: 'product', label: 'Produkt' },
];

function kmh(speed) {
  return Math.round(80 + speed * 120);
}

export default function App() {
  const [protectedTrack, setProtectedTrack] = useState(true);
  const [speed, setSpeed] = useState(0.55);
  const [playing, setPlaying] = useState(true);
  const [productId, setProductId] = useState('sylomer');
  const [cameraMode, setCameraMode] = useState('follow');
  const [viewMode, setViewMode] = useState('overview');
  const [trainKm, setTrainKm] = useState(0.15);

  const trainURef = useRef(8);
  const timeRef = useRef(0);

  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

  const metrics = useMemo(() => {
    const baseDb = protectedTrack ? 38 : 72;
    const building = protectedTrack ? -34 : 42;
    const vibPct = protectedTrack ? -68 : 28;
    const calm = protectedTrack ? 'Deutlich höher' : 'Eingeschränkt';
    return { baseDb, building, vibPct, calm };
  }, [protectedTrack]);

  const seekKm = useCallback((km) => {
    const u = uFromKm(km);
    trainURef.current = u;
    timeRef.current = Math.max(0, u - 8);
    setTrainKm(km);
  }, []);

  const onTrainProgress = useCallback((u) => {
    setTrainKm((prev) => {
      const next = kmFromU(u);
      return Math.abs(prev - next) > 0.02 ? next : prev;
    });
  }, []);

  const simulation = useMemo(
    () => ({
      protectedTrack,
      speed,
      playing,
      cameraMode,
      viewMode,
      productHighlight: productId,
      trainURef,
      timeRef,
      seekKm,
      onTrainProgress,
    }),
    [
      protectedTrack,
      speed,
      playing,
      cameraMode,
      viewMode,
      productId,
      seekKm,
      onTrainProgress,
    ]
  );

  return (
    <div className="app-shell">
      <div className="canvas-layer">
        <Experience simulation={simulation} />
      </div>

      <div className="ui-grid" aria-live="polite">
        <header className="top-bar glass">
          <div className="brand">
            <img src={GETZNER.logo} alt="Getzner Werkstoffe" width={150} height={30} />
            <div>
              <p className="eyebrow">engineering a quiet future</p>
              <h1>Alpine-Bahn — Schwingungsschutz im Boden</h1>
              <p className="sub">Interaktive 3D-Simulation · illustrative Demo-Werte</p>
            </div>
          </div>
          <div className="toggle-getzner" role="group" aria-label="Vorher-Nachher">
            <button
              type="button"
              className={protectedTrack ? 'on' : ''}
              onClick={() => setProtectedTrack(true)}
            >
              Mit Getzner®
            </button>
            <button
              type="button"
              className={!protectedTrack ? 'on warn' : ''}
              onClick={() => setProtectedTrack(false)}
            >
              Ohne Isolation
            </button>
          </div>
        </header>

        <aside className="panel panel-left glass">
          <h2>Wirkung auf das Umfeld</h2>
          <div className="impact-grid">
            <article>
              <span>Körperschall im Gebäude</span>
              <strong className={protectedTrack ? 'pos' : 'neg'}>
                {protectedTrack ? '−34 dB*' : '+42 dB*'}
              </strong>
            </article>
            <article>
              <span>Gebäudeschwingung</span>
              <strong className={protectedTrack ? 'pos' : 'neg'}>
                {protectedTrack ? '−68 %*' : '+28 %*'}
              </strong>
            </article>
            <article className="wide">
              <span>Wahrgenommene Ruhe</span>
              <strong>{metrics.calm}</strong>
            </article>
          </div>
          <h3>Live-Messpunkt (Simulation)</h3>
          <WaveformChart protectedTrack={protectedTrack} playing={playing} speed={speed} />
          <p className="illus-note">* Beispielwerte zur Visualisierung, keine Messung.</p>
        </aside>

        <aside className="panel panel-right glass">
          <h2>Getzner Produktwelt</h2>
          <ul className="product-list">
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={p.id === productId ? 'selected' : ''}
                  onClick={() => setProductId(p.id)}
                >
                  <img src={p.thumb} alt="" />
                  <span>{p.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="product-hero">
            <img src={product.image} alt={product.name} />
          </div>
          <p className="placement">{product.placement}</p>
          <p className="product-copy">{product.blurb}</p>
          {product.illustrativeOnly && (
            <p className="illus-note">Nur Produktfamilie — nicht als Gleisdetail modelliert.</p>
          )}
          <a className="product-link" href={product.url} target="_blank" rel="noopener noreferrer">
            Offizielle Produktseite →
          </a>
        </aside>

        <footer className="control-bar glass">
          <button
            type="button"
            className="play-btn"
            aria-pressed={playing}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <div className="speed-block">
            <label htmlFor="speed">Zuggeschwindigkeit</label>
            <input
              id="speed"
              type="range"
              min={0.15}
              max={1}
              step={0.01}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <strong>{kmh(speed)} km/h*</strong>
          </div>
          <TrackTimeline
            trainKm={trainKm}
            onSeek={seekKm}
            protectedTrack={protectedTrack}
          />
          <div className="camera-block">
            <span>Kameramodi</span>
            <div className="chip-row">
              {CAMERAS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cameraMode === c.id ? 'active' : ''}
                  onClick={() => setCameraMode(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="view-block">
            <span>Ansicht</span>
            <div className="chip-row">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={viewMode === v.id ? 'active' : ''}
                  onClick={() => {
                    setViewMode(v.id);
                    if (v.id === 'ground') setCameraMode('ground');
                    if (v.id === 'product') setCameraMode('product');
                    if (v.id === 'overview') setCameraMode('follow');
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

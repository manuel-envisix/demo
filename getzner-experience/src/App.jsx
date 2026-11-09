import { useMemo, useRef, useState, useCallback } from 'react';
import { GETZNER, PRIMARY_PRODUCT, ALTERNATIVE_PRODUCTS } from './assets.js';
import { Experience } from './scene/Experience.jsx';
import { CanvasErrorBoundary } from './components/CanvasErrorBoundary.jsx';
import { WaveformChart } from './components/WaveformChart.jsx';
import { TrackTimeline } from './components/TrackTimeline.jsx';
import { kmFromU, uFromKm } from './track.js';

const CAMERAS = [
  { id: 'follow', label: 'Verfolgung' },
  { id: 'side', label: 'Seite' },
  { id: 'ground', label: 'Boden' },
  { id: 'product', label: 'Produkt' },
  { id: 'free', label: 'Frei' },
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
  const [productId, setProductId] = useState('sleeper-boot');
  const [explodeTrack, setExplodeTrack] = useState(false);
  const [cameraMode, setCameraMode] = useState('follow');
  const [viewMode, setViewMode] = useState('overview');
  const [trainKm, setTrainKm] = useState(0.15);
  const [altOpen, setAltOpen] = useState(false);

  const trainURef = useRef(8);
  const timeRef = useRef(0);

  const product =
    productId === PRIMARY_PRODUCT.id
      ? PRIMARY_PRODUCT
      : ALTERNATIVE_PRODUCTS.find((p) => p.id === productId) ?? PRIMARY_PRODUCT;

  const metrics = useMemo(() => {
    const calm = protectedTrack ? 'Deutlich höher' : 'Eingeschränkt';
    return { calm };
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

  const highlightPads = protectedTrack && productId === 'sleeper-boot';
  const focusTrack = productId === 'sleeper-boot' && viewMode === 'product';

  const selectProduct = useCallback(
    (id) => {
      setProductId(id);
      const p = id === PRIMARY_PRODUCT.id ? PRIMARY_PRODUCT : ALTERNATIVE_PRODUCTS.find((x) => x.id === id);
      if (p?.sceneFocus) {
        setViewMode('product');
        setCameraMode('product');
        setExplodeTrack(true);
      } else {
        setExplodeTrack(false);
        if (viewMode === 'product') {
          setViewMode('overview');
          setCameraMode('follow');
        }
      }
    },
    [viewMode]
  );

  const simulation = useMemo(
    () => ({
      protectedTrack,
      speed,
      playing,
      cameraMode,
      viewMode,
      productHighlight: productId,
      highlightPads,
      explodeTrack,
      focusTrack,
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
      highlightPads,
      explodeTrack,
      focusTrack,
      seekKm,
      onTrainProgress,
    ]
  );

  return (
    <div className="app-shell">
      <div className="canvas-layer">
        <CanvasErrorBoundary>
          <Experience simulation={simulation} />
        </CanvasErrorBoundary>
      </div>

      <header className="site-header">
        <div className="header-brand">
          <img src={GETZNER.logo} alt="Getzner Werkstoffe" width={156} height={32} />
          <p className="claim">engineering a quiet future</p>
        </div>
        <div className="header-center">
          <h1>Schwingungen verstehen. Ruhe erleben.</h1>
          <p>Interaktive 3D-Erlebniswelt für den Bahnbereich</p>
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
            className={!protectedTrack ? 'on neutral' : ''}
            onClick={() => setProtectedTrack(false)}
          >
            Ohne Isolation
          </button>
        </div>
      </header>

      <aside className="panel panel-left" aria-label="Wirkung auf das Umfeld">
        <h2>Weniger Schwingungen. Mehr Lebensqualität.</h2>
        <div className="kpi-row">
          <article>
            <span>Körperschall</span>
            <strong className={protectedTrack ? 'pos' : 'neg'}>
              {protectedTrack ? '−34 dB*' : '+42 dB*'}
            </strong>
          </article>
          <article>
            <span>Gebäudeschwingungen</span>
            <strong className={protectedTrack ? 'pos' : 'neg'}>
              {protectedTrack ? '−68 %*' : '+28 %*'}
            </strong>
          </article>
          <article>
            <span>Wahrgenommene Ruhe</span>
            <strong>{metrics.calm}</strong>
          </article>
        </div>
        <p className="chart-label">Vergleich · illustrative Simulation</p>
        <WaveformChart protectedTrack={protectedTrack} playing={playing} speed={speed} />
        <p className="illus-note">* Beispielwerte, keine Messung.</p>
      </aside>

      <aside className="panel panel-right" aria-label="Produktwelt">
        <h2>Getzner Schwellensohle</h2>
        <div className="product-hero">
          <img src={PRIMARY_PRODUCT.image} alt={PRIMARY_PRODUCT.name} />
        </div>
        <p className="material-tag">Werkstoff: Sylomer®</p>
        <p className="product-lead">{PRIMARY_PRODUCT.blurb}</p>
        <p className="placement">{PRIMARY_PRODUCT.placement}</p>
        {protectedTrack && (
          <p className="badge-live">In der 3D-Szene: orange Sohle unter jeder Schwelle</p>
        )}
        {productId === 'sleeper-boot' && (
          <button type="button" className="btn-secondary" onClick={() => setExplodeTrack((v) => !v)}>
            {explodeTrack ? 'Explosionsansicht schließen' : 'Explosionsansicht'}
          </button>
        )}
        <a className="btn-link" href={PRIMARY_PRODUCT.url} target="_blank" rel="noopener noreferrer">
          Offizielle Produktseite
        </a>

        <details className="alt-products" open={altOpen} onToggle={(e) => setAltOpen(e.target.open)}>
          <summary>Weitere Bahnlösungen</summary>
          <ul>
            {ALTERNATIVE_PRODUCTS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={p.id === productId ? 'selected' : ''}
                  onClick={() => selectProduct(p.id)}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
          {productId !== 'sleeper-boot' && (
            <div className="alt-detail">
              <p>{product.blurb}</p>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                Mehr zu {product.name}
              </a>
            </div>
          )}
        </details>
      </aside>

      <footer className="control-bar">
        <button
          type="button"
          className="play-btn"
          aria-pressed={playing}
          onClick={() => setPlaying((v) => !v)}
          title={playing ? 'Pause' : 'Play'}
        >
          <span className="play-icon" aria-hidden="true">
            {playing ? '❚❚' : '▶'}
          </span>
          <span>{playing ? 'Pause' : 'Play'}</span>
        </button>

        <div className="control-group">
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
          <span className="control-value">{kmh(speed)} km/h*</span>
        </div>

        <div className="control-group control-group--wide">
          <TrackTimeline trainKm={trainKm} onSeek={seekKm} />
        </div>

        <div className="control-group">
          <span className="control-label">Kamera</span>
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

        <div className="control-group">
          <span className="control-label">Ansicht</span>
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
  );
}

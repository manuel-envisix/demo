export function TrackTimeline({ trainKm, onSeek, protectedTrack }) {
  return (
    <div className="track-timeline">
      <div className="track-labels">
        <span>0 km</span>
        <span>1 km</span>
        <span>2 km</span>
      </div>
      <div className="track-rail" aria-hidden="true">
        <div className="track-zone track-zone--raw" />
        <div className="track-zone track-zone--iso" />
        <div className="track-marker" style={{ left: `${(trainKm / 2) * 100}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={0.01}
        value={trainKm}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Streckenfortschritt"
      />
      <p className="illus-note">
        Ab 1 km:{' '}
        {protectedTrack ? 'Getzner-Lagerung aktiv (illustrativ)' : 'ohne Isolation — illustrativ'}
      </p>
    </div>
  );
}

export function MetaLabel({ protectedTrack }) {
  return (
    <div
      style={{
        fontFamily: 'IBM Plex Sans, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: protectedTrack ? '#00c96e' : '#ff8a6a',
        background: 'rgba(8,12,16,0.75)',
        padding: '6px 12px',
        borderRadius: '4px',
        border: `1px solid ${protectedTrack ? 'rgba(0,201,110,0.35)' : 'rgba(255,107,74,0.35)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      Alpenkorridor · Slab Track
      {protectedTrack ? ' · Getzner elastisch gelagert' : ' · ohne Schwingungsschutz'}
    </div>
  );
}

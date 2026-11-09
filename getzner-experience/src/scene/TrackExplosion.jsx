import { Html } from '@react-three/drei';

/** Illustrative layer stack neben der Strecke */
export function TrackExplosion({ position, visible }) {
  if (!visible) return null;

  const layers = [
    { y: 1.2, color: '#c5cdd6', label: 'Schienen', h: 0.12 },
    { y: 0.55, color: '#a8b2bc', label: 'Beton-Schwelle', h: 0.22 },
    { y: 0.15, color: '#f39200', label: 'Getzner Schwellensohle (Sylomer®)', h: 0.1 },
    { y: -0.35, color: '#322a22', label: 'Schotterbett', h: 0.28 },
  ];

  return (
    <group position={position}>
      {layers.map((layer) => (
        <group key={layer.label} position={[0, layer.y, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.2, layer.h, 1.1]} />
            <meshStandardMaterial
              color={layer.color}
              emissive={layer.color === '#f39200' ? '#ff8800' : '#000000'}
              emissiveIntensity={layer.color === '#f39200' ? 0.5 : 0}
            />
          </mesh>
          <Html distanceFactor={10} position={[1.6, 0, 0]} style={{ pointerEvents: 'none' }}>
            <span
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: 10,
                color: '#f4f0e8',
                background: 'rgba(8,10,16,0.85)',
                padding: '3px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
                border: '1px solid rgba(243,146,0,0.35)',
              }}
            >
              {layer.label}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

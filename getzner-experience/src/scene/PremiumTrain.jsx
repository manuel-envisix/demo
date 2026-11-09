import { useMemo } from 'react';

/** Zugmodell: Länge entlang lokaler +Z-Achse (Fahrtrichtung), Räder auf Schienenhöhe y=0 */
export function PremiumTrain({ xray }) {
  const windows = useMemo(() => Array.from({ length: 6 }, (_, i) => -2.4 + i * 0.9), []);

  const bodyMat = (color, opacity = 1) => ({
    color,
    metalness: xray ? 0.15 : 0.42,
    roughness: 0.38,
    transparent: xray,
    opacity: xray ? 0.25 : opacity,
  });

  return (
    <group>
      <mesh castShadow position={[0, 0.88, 0]}>
        <boxGeometry args={[1.32, 1.5, 6.6]} />
        <meshStandardMaterial {...bodyMat('#e8ecf2')} />
      </mesh>
      <mesh castShadow position={[0, 1.58, 0]}>
        <boxGeometry args={[1.22, 0.36, 6.2]} />
        <meshStandardMaterial {...bodyMat('#dfe6ee')} />
      </mesh>
      <mesh castShadow position={[0, 0.85, -3.45]}>
        <boxGeometry args={[1.28, 1.35, 0.55]} />
        <meshStandardMaterial color="#f39200" metalness={0.35} roughness={0.4} />
      </mesh>
      {windows.map((z, i) => (
        <mesh key={i} position={[0.66, 1.02, z]}>
          <boxGeometry args={[0.04, 0.44, 0.58]} />
          <meshStandardMaterial color="#1a2838" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {[-2.1, 2.1].map((z, zi) => (
        <group key={zi} position={[0, 0.34, z]}>
          {[-0.58, 0.58].map((x, wi) => (
            <mesh key={wi} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.18, 18]} />
              <meshStandardMaterial color="#181818" metalness={0.7} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {xray && (
        <group>
          {[-1.2, 0, 1.2].map((z, i) => (
            <mesh key={i} position={[0, 0.55, z]}>
              <boxGeometry args={[1.1, 0.1, 0.35]} />
              <meshStandardMaterial
                color="#f39200"
                emissive="#ff8800"
                emissiveIntensity={0.85}
                transparent
                opacity={0.9}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

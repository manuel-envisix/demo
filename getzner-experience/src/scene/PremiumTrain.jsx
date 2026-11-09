import { useMemo } from 'react';

export function PremiumTrain({ xray }) {
  const windows = useMemo(() => Array.from({ length: 6 }, (_, i) => -2.6 + i * 0.95), []);

  const bodyMat = (color, opacity = 1) => ({
    color,
    metalness: xray ? 0.1 : 0.45,
    roughness: 0.35,
    transparent: xray,
    opacity: xray ? 0.22 : opacity,
  });

  return (
    <group>
      <mesh castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[6.4, 1.55, 1.28]} />
        <meshStandardMaterial {...bodyMat('#e6eaef')} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <boxGeometry args={[6.1, 0.38, 1.18]} />
        <meshStandardMaterial {...bodyMat('#dfe5ec')} />
      </mesh>
      <mesh castShadow position={[-3.35, 0.55, 0]}>
        <boxGeometry args={[0.55, 1.25, 1.22]} />
        <meshStandardMaterial color="#f39200" metalness={0.35} roughness={0.4} />
      </mesh>
      {windows.map((x, i) => (
        <mesh key={i} position={[x, 0.82, 0.65]}>
          <boxGeometry args={[0.55, 0.42, 0.04]} />
          <meshStandardMaterial color="#1a2535" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {[-1.9, 1.9].map((z, zi) => (
        <group key={zi} position={[0, 0.14, z]}>
          {[-2.2, 0, 2.2].map((x, wi) => (
            <mesh key={wi} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.2, 20]} />
              <meshStandardMaterial color="#1c1c1c" metalness={0.65} roughness={0.45} />
            </mesh>
          ))}
        </group>
      ))}
      {xray && (
        <group>
          {[-1.5, 0, 1.5].map((x, i) => (
            <mesh key={i} position={[x, -0.05, 0]}>
              <boxGeometry args={[0.35, 0.12, 0.9]} />
              <meshStandardMaterial
                color="#f39200"
                emissive="#ff8800"
                emissiveIntensity={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
      )}
      <pointLight position={[0, 1.4, 1.1]} intensity={0.45} color="#ffd4a8" distance={7} />
    </group>
  );
}

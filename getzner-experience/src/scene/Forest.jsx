import { useMemo } from 'react';
import * as THREE from 'three';

export function Forest() {
  const trees = useMemo(() => {
    const rnd = (n) => {
      const s = Math.sin(n * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };
    const list = [];
    for (let i = 0; i < 140; i++) {
      const x = rnd(i) * 120 - 60;
      const z = rnd(i + 0.3) * 100 - 50;
      if (Math.abs(x) < 8) continue;
      const scale = 0.8 + rnd(i + 1) * 1.8;
      list.push([x, z, scale]);
    }
    return list;
  }, []);

  return (
    <group>
      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, -0.1, z]} scale={s}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.2, 6]} />
            <meshStandardMaterial color="#2a1f18" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <coneGeometry args={[0.75, 1.8, 7]} />
            <meshStandardMaterial color="#14352a" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

import { useMemo } from 'react';

export function Train() {
  const bodyColor = '#e8edf2';
  const accent = '#00a651';

  const windows = useMemo(() => {
    const w = [];
    for (let i = 0; i < 5; i++) w.push(-2.4 + i * 1.1);
    return w;
  }, []);

  return (
    <group>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[5.8, 1.35, 1.15]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0]}>
        <boxGeometry args={[5.4, 0.35, 1.05]} />
        <meshStandardMaterial color={bodyColor} metalness={0.3} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[-3.05, 0.55, 0]}>
        <boxGeometry args={[0.5, 1.2, 1.1]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.5} />
      </mesh>
      {windows.map((x, i) => (
        <mesh key={i} position={[x, 0.75, 0.58]}>
          <boxGeometry args={[0.65, 0.45, 0.05]} />
          <meshStandardMaterial color="#1a2838" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {[-1.8, 1.8].map((z, i) => (
        <group key={i} position={[0, 0.15, z]}>
          {[-2, 0, 2].map((x, j) => (
            <mesh key={j} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
              <meshStandardMaterial color="#222" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight position={[0, 1, 1.2]} intensity={0.6} color="#a8d4ff" distance={6} />
    </group>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RING_COUNT = 14;

export function VibrationField({
  protectedTrack,
  speed,
  getTrainPosition,
  getTrainU,
  intensity = 1,
}) {
  const anchor = useRef();
  const ringsGroup = useRef();
  const rings = useRef(
    Array.from({ length: RING_COUNT }, () => ({
      age: Math.random(),
      offset: Math.random() * Math.PI * 2,
    }))
  );

  const ringMaterials = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, () =>
        new THREE.MeshBasicMaterial({
          color: protectedTrack ? '#00c96e' : '#ff6b4a',
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      ),
    [protectedTrack]
  );

  useFrame((_, delta) => {
    if (!anchor.current || !ringsGroup.current) return;
    const train = getTrainPosition();
    anchor.current.position.set(train.x, train.y - 0.35, train.z);

    const u = getTrainU?.() ?? 0;
    const localOn = protectedTrack && u >= 60;
    const decay = localOn ? 2.8 : 0.65;
    const spread = (localOn ? 5.5 : 9.5) * intensity;

    ringsGroup.current.children.forEach((mesh, i) => {
      const r = rings.current[i];
      if (!r) return;

      r.age += delta * (0.55 + speed * 0.9);
      if (r.age > 1) r.age = 0;

      const radius = Math.max(r.age * spread, 0.001);
      const fade = Math.pow(1 - r.age, decay);
      mesh.scale.set(radius, radius, 1);
      const mat = ringMaterials[i];
      mat.opacity = fade * (localOn ? 0.32 : 0.52);
      mat.color.set(localOn ? '#00e07a' : '#f39200');
    });
  });

  return (
    <group ref={anchor}>
      <group ref={ringsGroup}>
        {rings.current.map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} material={ringMaterials[i]}>
            <ringGeometry args={[0.92, 1, 48]} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color={protectedTrack ? '#00e07a' : '#f39200'}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {[1, 2, 3].map((layer) => (
        <mesh
          key={`sub-${layer}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.15 * layer, 0]}
        >
          <ringGeometry args={[layer * 2.2, layer * 2.2 + 0.15, 64]} />
          <meshBasicMaterial
            color={protectedTrack ? '#004422' : '#551100'}
            transparent
            opacity={protectedTrack ? 0.12 : 0.22}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Chalet({ position, rotationY, protectedTrack, trainRef, index }) {
  const group = useRef();
  const shake = useRef(0);

  useFrame((_, delta) => {
    if (!group.current || !trainRef.current) return;
    const dist = group.current.position.distanceTo(trainRef.current.position);
    const near = Math.exp(-dist * 0.12);
    const amp = protectedTrack ? 0.015 : 0.12;
    shake.current += delta * (8 + index);
    const wobble = Math.sin(shake.current * 3) * near * amp * (protectedTrack ? 0.35 : 1);
    group.current.rotation.z = wobble;
    group.current.position.y = position.y + Math.sin(shake.current * 2) * near * amp * 0.5;
  });

  const wall = index % 2 === 0 ? '#e8dcc8' : '#dfd0b8';
  const roof = '#6b4f4a';

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[3.2, 2.2, 2.8]} />
        <meshStandardMaterial color={wall} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 2.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.6, 1.2, 4]} />
        <meshStandardMaterial color={roof} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.1, 1.41]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshStandardMaterial
          color={protectedTrack ? '#a8d4f0' : '#ffc9a8'}
          emissive={protectedTrack ? '#223344' : '#553322'}
          emissiveIntensity={protectedTrack ? 0.08 : 0.22}
        />
      </mesh>
      <mesh position={[-0.9, 1.3, 1.41]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshStandardMaterial color="#1e2838" />
      </mesh>
      <mesh position={[0.9, 1.3, 1.41]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshStandardMaterial color="#1e2838" />
      </mesh>
    </group>
  );
}

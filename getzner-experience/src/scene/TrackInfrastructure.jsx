import { useMemo } from 'react';
import * as THREE from 'three';
import { trackFrame, TRACK_LEN } from '../track.js';

export function TrackInfrastructure({ protectedTrack, trainU }) {
  const sleepers = useMemo(() => {
    const items = [];
    for (let t = 0; t < TRACK_LEN; t += 2.1) {
      items.push(trackFrame(t));
    }
    return items;
  }, []);

  return (
    <group>
      {sleepers.map((f, i) => {
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),
          f.right
        );
        const localProtected = protectedTrack && f.u >= TRACK_LEN / 2;
        return (
          <group key={i} position={f.railTop} quaternion={quat}>
            <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.14, 0.42]} />
              <meshStandardMaterial color="#3a322c" roughness={0.95} />
            </mesh>
            <mesh position={[-0.72, 0.06, 0]} castShadow>
              <boxGeometry args={[0.11, 0.09, 2.4]} />
              <meshStandardMaterial color="#8a9199" metalness={0.7} roughness={0.28} />
            </mesh>
            <mesh position={[0.72, 0.06, 0]} castShadow>
              <boxGeometry args={[0.11, 0.09, 2.4]} />
              <meshStandardMaterial color="#8a9199" metalness={0.7} roughness={0.28} />
            </mesh>
            <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.8, 1.6]} />
              <meshStandardMaterial color="#2b2520" roughness={1} />
            </mesh>
            {localProtected && (
              <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[1.35, 0.05, 1.2]} />
                <meshStandardMaterial
                  color="#f39200"
                  emissive="#b86400"
                  emissiveIntensity={0.35}
                />
              </mesh>
            )}
          </group>
        );
      })}
      <BallastStrip trainU={trainU} />
    </group>
  );
}

function BallastStrip({ trainU }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(TRACK_LEN, 3.2, 1, 1), []);
  return (
    <mesh
      geometry={geo}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.22, 0]}
      receiveShadow
    >
      <meshStandardMaterial color="#1a1714" roughness={0.98} />
    </mesh>
  );
}

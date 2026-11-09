import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TrackExplosion } from './TrackExplosion.jsx';

export function TrackExplosionAnchor({ trainRef, visible, explode }) {
  const anchor = useRef();

  useFrame(() => {
    if (!anchor.current || !trainRef.current?.userData?.frame) return;
    const frame = trainRef.current.userData.frame;
    anchor.current.position.copy(trainRef.current.position);
    anchor.current.position.add(frame.right.clone().multiplyScalar(4.5));
    anchor.current.quaternion.copy(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), frame.right)
    );
  });

  return (
    <group ref={anchor}>
      <TrackExplosion visible={visible && explode} position={[0, 0, 0]} />
    </group>
  );
}

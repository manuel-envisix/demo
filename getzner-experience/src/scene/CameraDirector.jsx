import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MODES = {
  follow: { dist: 24, height: 8, side: 0.15 },
  side: { dist: 26, height: 5, side: 1 },
  free: null,
  ground: { dist: 14, height: 1.4, side: 0.75 },
  product: { dist: 9, height: 1.1, side: 0.85 },
  inside: { dist: 14, height: 5, side: 0.35 },
};

function lerpVec(a, b, t, out) {
  out.copy(a).lerp(b, t);
  return out;
}

export function CameraDirector({ mode, target, playing }) {
  const { camera } = useThree();
  const controls = useRef();
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const free = mode === 'free';

  useFrame((_, delta) => {
    if (!target.current) return;
    const pos = target.current.position;
    const frame = target.current.userData.frame;
    const t = Math.min(1, delta * (playing ? 2.8 : 4.5));

    if (free) {
      if (controls.current) controls.current.target.lerp(pos, t);
      return;
    }

    const spec = MODES[mode] ?? MODES.follow;
    const tangent = frame?.tangent ?? new THREE.Vector3(0, 0, 1);
    const right = frame?.right ?? new THREE.Vector3(1, 0, 0);
    const back = tangent.clone().multiplyScalar(-spec.dist);
    const lateral = right.clone().multiplyScalar(spec.side * spec.dist * 0.55);
    desired.current.copy(pos).add(back).add(lateral);
    desired.current.y = pos.y + spec.height;
    lerpVec(camera.position, desired.current, t, camera.position);
    const lift = mode === 'product' ? 0.35 : 1.5;
    look.current.copy(pos).y += lift;
    camera.lookAt(look.current);
  });

  if (free) {
    return (
      <OrbitControls
        ref={controls}
        enablePan={false}
        minDistance={8}
        maxDistance={70}
        maxPolarAngle={Math.PI / 2.05}
      />
    );
  }
  return null;
}

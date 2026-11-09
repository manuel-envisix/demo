import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Train } from './Train.jsx';
import { VibrationField } from './VibrationField.jsx';
import { Chalet } from './Chalet.jsx';
import { MetaLabel } from './MetaLabel.jsx';

const TRACK_LEN = 120;
const HOUSE_OFFSETS = [-32, -22, -14, 14, 22, 32, 42];

function trackPoint(t) {
  const x = Math.sin(t * 0.08) * 6;
  const z = t - TRACK_LEN / 2;
  const y = Math.sin(t * 0.15) * 0.4 + Math.cos(t * 0.05) * 0.3;
  return new THREE.Vector3(x, y, z);
}

function AlpineTerrain() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(140, 140, 80, 80);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h =
        Math.sin(x * 0.12) * 1.2 +
        Math.cos(y * 0.09) * 1.4 +
        Math.sin((x + y) * 0.06) * 2 +
        Math.abs(x) * 0.04;
      pos.setZ(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} geometry={geom} receiveShadow>
      <meshStandardMaterial color="#1e3a2f" roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

function SnowPeaks() {
  const peaks = useMemo(
    () =>
      [
        [-45, 18, -35],
        [50, 22, -40],
        [-55, 16, 25],
        [48, 20, 30],
      ].map((p, i) => ({ pos: p, scale: 8 + i * 2 })),
    []
  );
  return peaks.map((pk, i) => (
    <mesh key={i} position={pk.pos} scale={[pk.scale, pk.scale * 1.4, pk.scale]} castShadow>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color="#dce8f0" roughness={0.85} />
    </mesh>
  ));
}

function RailwayTrack({ protectedTrack }) {
  const points = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= TRACK_LEN; t += 1.5) pts.push(trackPoint(t));
    return pts;
  }, []);

  const railMat = protectedTrack ? '#3d7a52' : '#6a5040';
  const padColor = protectedTrack ? '#00a651' : '#55443a';

  return (
    <group position={[0, 0.05, 0]}>
      {points.map((p, i) => {
        if (i >= points.length - 1) return null;
        const p2 = points[i + 1];
        const mid = p.clone().add(p2).multiplyScalar(0.5);
        const dir = p2.clone().sub(p).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          dir
        );
        return (
          <group key={i} position={mid} quaternion={quat}>
            <mesh position={[-0.72, 0.08, 0]} castShadow>
              <boxGeometry args={[0.12, 0.1, 1.6]} />
              <meshStandardMaterial color={railMat} metalness={0.65} roughness={0.35} />
            </mesh>
            <mesh position={[0.72, 0.08, 0]} castShadow>
              <boxGeometry args={[0.12, 0.1, 1.6]} />
              <meshStandardMaterial color={railMat} metalness={0.65} roughness={0.35} />
            </mesh>
            {protectedTrack && i % 3 === 0 && (
              <mesh position={[0, -0.12, 0]}>
                <boxGeometry args={[1.5, 0.06, 1.4]} />
                <meshStandardMaterial
                  color={padColor}
                  emissive={padColor}
                  emissiveIntensity={0.25}
                />
              </mesh>
            )}
          </group>
        );
      })}
      <Line points={points} color={protectedTrack ? '#00c96e' : '#ff6b4a'} lineWidth={1} />
    </group>
  );
}

export function AlpineWorld({ protectedTrack, speed }) {
  const trainRef = useRef();
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * (0.35 + speed * 1.8);
    const t = (timeRef.current % TRACK_LEN) + 5;
    const pos = trackPoint(t);
    const posAhead = trackPoint(t + 2);
    if (trainRef.current) {
      trainRef.current.position.copy(pos.clone().add(new THREE.Vector3(0, 0.45, 0)));
      trainRef.current.lookAt(posAhead.x, posAhead.y + 0.45, posAhead.z);
    }
  });

  const trainPos = () => trainRef.current?.position ?? new THREE.Vector3(0, 0.5, 0);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[25, 40, 15]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <hemisphereLight args={['#8ec8ff', '#1a3028', 0.45]} />
      <Sky
        distance={450000}
        sunPosition={[100, 30, 100]}
        inclination={0.52}
        azimuth={0.22}
        mieCoefficient={0.008}
      />
      <OrbitControls
        enablePan={false}
        minDistance={12}
        maxDistance={55}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 2, 0]}
      />

      <AlpineTerrain />
      <SnowPeaks />
      <RailwayTrack protectedTrack={protectedTrack} />

      {HOUSE_OFFSETS.map((side, i) => {
        const t = 35 + i * 11;
        const base = trackPoint(t);
        const sign = side > 0 ? 1 : -1;
        const pos = new THREE.Vector3(base.x + sign * Math.abs(side) * 0.55, base.y, base.z);
        return (
          <Chalet
            key={i}
            position={pos}
            rotationY={side > 0 ? -Math.PI / 2 : Math.PI / 2}
            protectedTrack={protectedTrack}
            trainRef={trainRef}
            index={i}
          />
        );
      })}

      <group ref={trainRef}>
        <Train />
      </group>

      <VibrationField
        protectedTrack={protectedTrack}
        speed={speed}
        getTrainPosition={trainPos}
      />

      <Html position={[0, 6, -48]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <MetaLabel protectedTrack={protectedTrack} />
      </Html>
    </>
  );
}

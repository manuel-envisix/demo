import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { trackFrame, trackOrientation, TRACK_LEN } from '../track.js';
import { TrackExplosionAnchor } from './TrackExplosionAnchor.jsx';
import { useSimulation } from '../context/SimulationContext.jsx';
import { PremiumTrain } from './PremiumTrain.jsx';
import { VibrationField } from './VibrationField.jsx';
import { Chalet } from './Chalet.jsx';
import { TrackInfrastructure } from './TrackInfrastructure.jsx';
import { Forest } from './Forest.jsx';
import { CameraDirector } from './CameraDirector.jsx';

const HOUSE_SLOTS = [
  { t: 28, side: -18 },
  { t: 38, side: -24 },
  { t: 48, side: -16 },
  { t: 62, side: 18 },
  { t: 72, side: 26 },
  { t: 82, side: 16 },
];

function AlpineTerrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
      <planeGeometry args={[160, 160, 1, 1]} />
      <meshStandardMaterial color="#121820" roughness={0.98} metalness={0.02} />
    </mesh>
  );
}

function Mountains() {
  const peaks = [
    [-48, 20, -42, 11],
    [52, 24, -38, 13],
    [-58, 18, 32, 10],
    [44, 21, 36, 12],
    [-20, 16, -55, 9],
  ];
  return peaks.map(([x, y, z, s], i) => (
    <mesh key={i} position={[x, y, z]} scale={[s, s * 1.35, s]} castShadow>
      <coneGeometry args={[1, 1, 5]} />
      <meshStandardMaterial color="#3d4d5c" roughness={0.88} />
    </mesh>
  ));
}

export function AlpineWorld() {
  const {
    speed,
    playing,
    protectedTrack,
    cameraMode,
    viewMode,
    productHighlight,
    highlightPads,
    explodeTrack,
    focusTrack,
    trainURef,
    timeRef,
    onTrainProgress,
  } = useSimulation();
  const trainRef = useRef();

  useFrame((_, delta) => {
    if (!trainURef || !timeRef) return;
    if (playing) {
      timeRef.current += delta * (0.28 + speed * 1.6);
      trainURef.current = 8 + timeRef.current;
      if (trainURef.current > TRACK_LEN - 4) {
        trainURef.current = 8;
        timeRef.current = 0;
      }
    }
    onTrainProgress?.(trainURef.current);
    const frame = trackFrame(trainURef.current);
    if (trainRef.current) {
      trainRef.current.position.copy(frame.railTop);
      trainRef.current.quaternion.copy(trackOrientation(frame));
      trainRef.current.userData.frame = frame;
      trainRef.current.userData.u = trainURef.current;
    }
  });

  const trainPos = () => trainRef.current?.position ?? new THREE.Vector3();
  const xray = viewMode === 'product' && productHighlight === 'sleeper-boot';
  const emissiveVibration = viewMode === 'ground' ? 1.35 : 1;

  return (
    <>
      <color attach="background" args={['#070a10']} />
      <fog attach="fog" args={['#070a10', 28, 110]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        position={[-30, 45, 20]}
        intensity={1.1}
        color="#ffb070"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={140}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[40, 20, -30]} intensity={0.35} color="#6a8cff" />
      <hemisphereLight args={['#3a4a6a', '#0a1018', 0.55]} />
      <Sky
        distance={450000}
        sunPosition={[-1, 0.15, -0.8]}
        inclination={0.49}
        azimuth={0.25}
        mieCoefficient={0.01}
        turbidity={8}
      />
      <Stars radius={120} depth={50} count={1200} factor={3} saturation={0.2} fade speed={0.3} />

      <CameraDirector mode={cameraMode} target={trainRef} playing={playing} />

      <AlpineTerrain />
      <Mountains />
      <Forest />

      <TrackInfrastructure
        protectedTrack={protectedTrack}
        highlightPads={highlightPads}
        explode={explodeTrack}
      />

      {HOUSE_SLOTS.map((slot, i) => {
        const f = trackFrame(slot.t);
        const sign = slot.side > 0 ? 1 : -1;
        const pos = f.railTop
          .clone()
          .add(f.right.clone().multiplyScalar(sign * Math.abs(slot.side) * 0.35));
        return (
          <Chalet
            key={i}
            position={pos}
            rotationY={slot.side > 0 ? -Math.PI / 2 : Math.PI / 2}
            protectedTrack={protectedTrack}
            trainRef={trainRef}
            index={i}
          />
        );
      })}

      <group ref={trainRef}>
        <PremiumTrain xray={xray} />
      </group>

      <VibrationField
        protectedTrack={protectedTrack}
        speed={speed}
        getTrainPosition={trainPos}
        intensity={emissiveVibration}
      />

      <TrackExplosionAnchor trainRef={trainRef} visible={focusTrack} explode={explodeTrack} />
    </>
  );
}

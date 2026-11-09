import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
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
      <meshStandardMaterial color="#7a9b62" roughness={0.92} metalness={0.02} />
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
      <meshStandardMaterial color="#8fa3b8" roughness={0.82} />
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
      <color attach="background" args={['#c8ddf0']} />
      <fog attach="fog" args={['#d4e4f4', 55, 180]} />
      <ambientLight intensity={0.62} />
      <directionalLight
        position={[-28, 52, 24]}
        intensity={1.55}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={140}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[35, 28, -40]} intensity={0.45} color="#e8f0ff" />
      <hemisphereLight args={['#b8daf8', '#5a6b48', 0.72]} />
      <Sky
        distance={450000}
        sunPosition={[0.8, 0.55, -0.4]}
        inclination={0.52}
        azimuth={0.18}
        mieCoefficient={0.004}
        turbidity={2.5}
      />

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

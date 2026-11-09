import { Canvas } from '@react-three/fiber';
import { AlpineWorld } from './AlpineWorld.jsx';

export function Experience({ protectedTrack, speed }) {
  return (
    <Canvas
      shadows
      camera={{ position: [-18, 14, 22], fov: 48, near: 0.1, far: 200 }}
      gl={{ antialias: true, toneMappingExposure: 1.05 }}
    >
      <color attach="background" args={['#0a1018']} />
      <fog attach="fog" args={['#0a1018', 35, 95]} />
      <AlpineWorld protectedTrack={protectedTrack} speed={speed} />
    </Canvas>
  );
}

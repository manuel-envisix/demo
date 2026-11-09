import { Canvas } from '@react-three/fiber';
import { SimulationContext } from '../context/SimulationContext.jsx';
import { AlpineWorld } from './AlpineWorld.jsx';

export function Experience({ simulation }) {
  return (
    <SimulationContext.Provider value={simulation}>
      <Canvas
        shadows
        camera={{ position: [-28, 16, 32], fov: 40, near: 0.1, far: 220 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.75]}
      >
        <AlpineWorld />
      </Canvas>
    </SimulationContext.Provider>
  );
}

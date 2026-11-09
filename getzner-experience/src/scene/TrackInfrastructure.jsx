import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { trackFrame, trackOrientation, TRACK_LEN } from '../track.js';

const STEP = 2.0;
const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _offset = new THREE.Vector3();

function setInstance(mesh, index, frame, ox, oy, oz, explode = 0) {
  if (!mesh) return;
  _quat.copy(trackOrientation(frame));
  _offset.set(ox, oy - explode * Math.abs(oy) * 0.5, oz).applyQuaternion(_quat);
  _pos.copy(frame.railTop).add(_offset);
  _matrix.compose(_pos, _quat, _scale);
  mesh.setMatrixAt(index, _matrix);
}

export function TrackInfrastructure({ protectedTrack, highlightPads, explode }) {
  const frames = useMemo(() => {
    const list = [];
    for (let t = 0; t < TRACK_LEN; t += STEP) list.push(trackFrame(t));
    return list;
  }, []);

  const sleeperRef = useRef();
  const padRef = useRef();
  const railLRef = useRef();
  const railRRef = useRef();
  const ballastRef = useRef();

  const sleeperGeo = useMemo(() => new THREE.BoxGeometry(2.55, 0.18, 0.48), []);
  const padGeo = useMemo(() => new THREE.BoxGeometry(2.35, 0.07, 0.42), []);
  const railGeo = useMemo(() => new THREE.BoxGeometry(0.11, 0.1, 2.15), []);
  const ballastGeo = useMemo(() => new THREE.BoxGeometry(2.9, 0.14, 1.7), []);

  const padMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f39200',
        emissive: highlightPads ? '#ffaa33' : '#c07000',
        emissiveIntensity: highlightPads ? 0.85 : 0.45,
        roughness: 0.5,
      }),
    [highlightPads]
  );

  const count = frames.length;
  const ex = explode ? 1 : 0;

  useLayoutEffect(() => {
    frames.forEach((frame, i) => {
      setInstance(sleeperRef.current, i, frame, 0, -0.05, 0, ex);
      if (protectedTrack && padRef.current) {
        setInstance(padRef.current, i, frame, 0, -0.175, 0, ex * 1.2);
      }
      setInstance(railLRef.current, i, frame, -0.72, 0.09, 0, ex * 2);
      setInstance(railRRef.current, i, frame, 0.72, 0.09, 0, ex * 2);
      setInstance(ballastRef.current, i, frame, 0, -0.3, 0, ex * 1.5);
    });
    sleeperRef.current.instanceMatrix.needsUpdate = true;
    if (padRef.current) padRef.current.instanceMatrix.needsUpdate = true;
    railLRef.current.instanceMatrix.needsUpdate = true;
    railRRef.current.instanceMatrix.needsUpdate = true;
    ballastRef.current.instanceMatrix.needsUpdate = true;
  }, [frames, protectedTrack, highlightPads, explode, count, ex]);

  return (
    <group>
      <instancedMesh
        ref={sleeperRef}
        args={[sleeperGeo, undefined, count]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#a8b2bc" roughness={0.78} metalness={0.1} />
      </instancedMesh>
      {protectedTrack && (
        <instancedMesh ref={padRef} args={[padGeo, padMat, count]} castShadow receiveShadow />
      )}
      <instancedMesh ref={railLRef} args={[railGeo, undefined, count]} castShadow>
        <meshStandardMaterial color="#c5cdd6" metalness={0.78} roughness={0.22} />
      </instancedMesh>
      <instancedMesh ref={railRRef} args={[railGeo, undefined, count]} castShadow>
        <meshStandardMaterial color="#c5cdd6" metalness={0.78} roughness={0.22} />
      </instancedMesh>
      <instancedMesh ref={ballastRef} args={[ballastGeo, undefined, count]} receiveShadow>
        <meshStandardMaterial color="#322a22" roughness={1} />
      </instancedMesh>
    </group>
  );
}

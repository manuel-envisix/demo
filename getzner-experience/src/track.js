import * as THREE from 'three';

/** Streckenlänge in Modell-Einheiten (~ 2 km illustrativ) */
export const TRACK_LEN = 120;
export const KM_MARK = TRACK_LEN / 2;

const curve = new THREE.CatmullRomCurve3(
  Array.from({ length: 13 }, (_, i) => {
    const t = (i / 12) * TRACK_LEN;
    return sampleRaw(t);
  }),
  false,
  'catmullrom',
  0.35
);

const _forward = new THREE.Vector3(0, 0, 1);

function sampleRaw(t) {
  const x = Math.sin(t * 0.08) * 6;
  const z = t - TRACK_LEN / 2;
  const y = Math.sin(t * 0.15) * 0.35 + Math.cos(t * 0.05) * 0.25 - 0.05;
  return new THREE.Vector3(x, y, z);
}

/** Position auf Gleisoberkante, Tangente, Rechtsvektor */
export function trackFrame(u) {
  const clamped = ((u % TRACK_LEN) + TRACK_LEN) % TRACK_LEN;
  const uNorm = clamped / TRACK_LEN;
  const position = curve.getPointAt(uNorm);
  const tangent = curve.getTangentAt(uNorm).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
  const binormal = new THREE.Vector3().crossVectors(right, tangent).normalize();
  const railTop = position.clone().add(new THREE.Vector3(0, 0, 0));
  return { u: clamped, uNorm, position, railTop, tangent, right, binormal };
}

/** Ausrichtung: Modell +Z = Fahrtrichtung entlang Tangente */
export function trackOrientation(frame) {
  return new THREE.Quaternion().setFromUnitVectors(_forward, frame.tangent.clone());
}

export function trackSamples(step = 1.2) {
  const pts = [];
  for (let t = 0; t <= TRACK_LEN; t += step) {
    pts.push(trackFrame(t).railTop);
  }
  return pts;
}

export function kmFromU(u) {
  return (u / TRACK_LEN) * 2;
}

export function uFromKm(km) {
  return (km / 2) * TRACK_LEN;
}

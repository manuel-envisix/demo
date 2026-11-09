const TARGET = { rest: 1.3, listen: 3.8, settle: 0.15 };
const SPEED = { rest: 0.45, listen: 1.25, settle: 0.2 };

export function startRing(path, getEnergy) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    path.setAttribute("d", ringPath(0.15, 0));
    return;
  }

  let amplitude = TARGET[getEnergy()] ?? 1.3;
  let phase = 0;
  let last = performance.now();

  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const current = getEnergy();
    amplitude += (TARGET[current] - amplitude) * Math.min(1, dt * 2.4);
    phase += dt * SPEED[current] * Math.PI * 2;
    path.setAttribute("d", ringPath(amplitude, phase));
    requestAnimationFrame(tick);
  };

  path.setAttribute("d", ringPath(amplitude, phase));
  requestAnimationFrame(tick);
}

function ringPath(amplitude, phase) {
  const steps = 140;
  const radius = 96;
  let path = "";
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const wobble =
      Math.sin(angle * 8 + phase) * amplitude + Math.sin(angle * 15 - phase * 1.4) * amplitude * 0.55;
    const current = radius + wobble;
    const x = Math.cos(angle) * current;
    const y = Math.sin(angle) * current;
    path += `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${path}Z`;
}

"use client";

import { useEffect, useRef } from "react";

export type Energy = "rest" | "listen" | "settle";

const TARGET: Record<Energy, number> = { rest: 1.3, listen: 3.8, settle: 0.15 };
const SPEED: Record<Energy, number> = { rest: 0.45, listen: 1.25, settle: 0.2 };

export function RingMark({ energy }: { energy: Energy }) {
  const pathRef = useRef<SVGPathElement>(null);
  const energyRef = useRef(energy);
  energyRef.current = energy;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      path.setAttribute("d", ringPath(0.15, 0));
      return;
    }

    let amplitude = TARGET[energyRef.current];
    let phase = 0;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const current = energyRef.current;
      amplitude += (TARGET[current] - amplitude) * Math.min(1, dt * 2.4);
      phase += dt * SPEED[current] * Math.PI * 2;
      path.setAttribute("d", ringPath(amplitude, phase));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg className="ring" viewBox="-150 -150 300 300" role="img" aria-label="Ring">
      <circle cx="0" cy="0" r="112" className="ring-guide" />
      <path ref={pathRef} d={ringPath(1.3, 0)} className="ring-wave" />
      <circle cx="0" cy="0" r="3.5" className="ring-core" />
    </svg>
  );
}

function ringPath(amplitude: number, phase: number): string {
  const steps = 140;
  const radius = 96;
  let path = "";
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const wobble =
      Math.sin(angle * 8 + phase) * amplitude +
      Math.sin(angle * 15 - phase * 1.4) * amplitude * 0.55;
    const current = radius + wobble;
    const x = Math.cos(angle) * current;
    const y = Math.sin(angle) * current;
    path += `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${path}Z`;
}

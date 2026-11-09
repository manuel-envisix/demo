import { useEffect, useRef } from 'react';

export function WaveformChart({ protectedTrack, playing, speed }) {
  const canvas = useRef(null);
  const phase = useRef(0);

  useEffect(() => {
    let raf;
    const draw = () => {
      const el = canvas.current;
      if (!el) return;
      const ctx = el.getContext('2d');
      const w = el.width;
      const h = el.height;
      ctx.clearRect(0, 0, w, h);
      if (playing) phase.current += 0.04 + speed * 0.08;

      const mid = h / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      for (const [color, amp, freq] of [
        ['#f39200', protectedTrack ? 0.35 : 1, 0.09],
        ['#00e07a', protectedTrack ? 0.95 : 0.28, 0.07],
      ]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const t = x / w;
          const y =
            mid +
            Math.sin(t * Math.PI * 14 + phase.current * freq * 40) *
              amp *
              28 *
              Math.sin(t * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [protectedTrack, playing, speed]);

  return (
    <canvas
      ref={canvas}
      className="wave-canvas"
      width={360}
      height={100}
      aria-label="Illustrative Schwingungskurve mit und ohne Getzner"
    />
  );
}

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
      ctx.strokeStyle = 'rgba(107, 117, 128, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      ctx.font = '11px Source Sans 3, sans-serif';
      ctx.fillStyle = '#6b7580';
      ctx.fillText('Ohne Isolation', 8, 16);
      ctx.fillStyle = '#2e9d62';
      ctx.fillText('Mit Getzner®', 8, h - 8);

      for (const [color, amp, freq] of [
        ['#f39200', protectedTrack ? 0.32 : 1, 0.09],
        ['#2e9d62', protectedTrack ? 0.92 : 0.26, 0.07],
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

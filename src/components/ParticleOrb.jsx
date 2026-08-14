import { useEffect, useRef } from "react";

/**
 * Particle-sphere orb: points distributed evenly on a sphere (Fibonacci
 * sphere), rotated over time, with a flowing sine-based ridge distortion
 * on top so it reads as "plasma" rather than a static ball of dots.
 * Rendered on canvas — a CSS-only approach can't do the depth/perspective.
 */
export default function ParticleOrb({ size = 160, pulse = true, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COUNT = size > 100 ? 1800 : 900;
    const radius = size * 0.42;
    const cx = size / 2;
    const cy = size / 2;

    // Fibonacci sphere distribution — even point spacing, no clustering at poles
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }

    let frame;
    let t = 0;

    function draw() {
      t += reduceMotion ? 0 : 0.006;
      ctx.clearRect(0, 0, size, size);

      const rotY = t * 0.6;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const projected = points.map((p) => {
        // rotate around Y axis
        const x = p.x * cosY + p.z * sinY;
        const z = -p.x * sinY + p.z * cosY;
        const y = p.y;

        // flowing ridge distortion — pushes points in/out along their
        // own normal based on a moving sine field, this is the "plasma flow"
        const wave =
          Math.sin(x * 3 + t * 1.4) * 0.12 +
          Math.sin(y * 4 - t * 1.1) * 0.1;
        const rr = radius * (1 + wave);

        return { x: x * rr, y: y * rr, z, depth: (z + 1) / 2 };
      });

      // back-to-front so front particles draw on top
      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        if (p.z < -0.15) continue; // cull far-back points, keeps it a sphere not a ball of yarn
        const screenX = cx + p.x;
        const screenY = cy + p.y;
        const size_ = 0.6 + p.depth * 1.6;
        const alpha = 0.15 + p.depth * 0.75;

        // colour ramp across the visible face — signal-red family
        const mix = (p.x / radius + 1) / 2;
        const r = 232 + mix * 23;   // 232 -> 255
        const g = 18 + mix * 100;   // 18  -> 118 (warms toward highlight)
        const b = 29 + mix * 60;

        ctx.beginPath();
        ctx.arc(screenX, screenY, size_, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [size]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {pulse && (
        <span
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--color-signal-bright) 0%, transparent 70%)",
            opacity: 0.35,
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, filter: "drop-shadow(0 0 24px rgba(232,18,29,0.5))" }}
      />
    </div>
  );
}
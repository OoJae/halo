import { useEffect, useRef } from "react";

// Backdrop particle field ported from the brand exports: a glowing ring (torus) + a depth
// "tunnel" field of indigo/green sprites, perspective-projected with additive blending. Gentle
// auto-rotation; with `scrollDriven` the camera pulls forward as you scroll (the landing hero).
export default function HaloCanvas({
  ringN = 1300,
  tunnelN = 1100,
  tilt = 0.5,
  cx = 0.5,
  cy = 0.5,
  scrollDriven = false,
}: {
  ringN?: number;
  tunnelN?: number;
  tilt?: number;
  cx?: number;
  cy?: number;
  scrollDriven?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 720;
    const RN = mobile ? Math.round(ringN * 0.62) : ringN;
    const TN = mobile ? Math.round(tunnelN * 0.6) : tunnelN;

    // pre-render 3 glow sprites
    const COLORS = ["183,184,255", "126,126,242", "86,230,170"];
    const sprites = COLORS.map((rgb) => {
      const s = document.createElement("canvas");
      s.width = s.height = 48;
      const g = s.getContext("2d")!;
      const rad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      rad.addColorStop(0, `rgba(${rgb},1)`);
      rad.addColorStop(0.4, `rgba(${rgb},0.5)`);
      rad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = rad;
      g.fillRect(0, 0, 48, 48);
      return s;
    });

    const pickColor = () => (Math.random() < 0.06 ? 2 : Math.random() < 0.53 ? 0 : 1);
    type P = { x: number; y: number; z: number; ci: number; br: number; sz: number };
    const R = 235, rt = 16;
    const ring: P[] = Array.from({ length: RN }, () => {
      const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
      const rr = R + rt * Math.cos(v);
      return { x: rr * Math.cos(u), y: rt * Math.sin(v), z: rr * Math.sin(u), ci: pickColor(), br: 0.5 + Math.random() * 0.5, sz: 0.7 + Math.random() * 1.4 };
    });
    const tunnel: P[] = Array.from({ length: TN }, () => {
      const a = Math.random() * Math.PI * 2, rad = 70 + Math.random() * 470;
      return { x: Math.cos(a) * rad, y: Math.sin(a) * rad, z: -950 + Math.random() * 1900, ci: pickColor(), br: 0.4 + Math.random() * 0.6, sz: 0.6 + Math.random() * 1.5 };
    });

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const fov = 560, camStart = -560, camEnd = 250;
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    let rot = 0, p = 0, raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const ox = W * cx, oy = H * cy;
      let camZ = camStart + (camEnd - camStart) * 0.5;
      if (scrollDriven) {
        const target = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 1.25)));
        p += (target - p) * 0.12;
        camZ = camStart + (camEnd - camStart) * ease(p);
      }
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const render = (arr: P[], spin: boolean) => {
        for (const pt of arr) {
          let x = pt.x, y = pt.y, z = pt.z;
          if (spin) { const nx = x * cosR - z * sinR; z = x * sinR + z * cosR; x = nx; }
          const ny = y * cosT - z * sinT; z = y * sinT + z * cosT; y = ny;
          z -= camZ;
          if (z < 9) continue;
          const k = fov / z;
          const sx = ox + x * k, sy = oy + y * k;
          if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
          const fadeFar = Math.max(0, 1 - z / 1500);
          const a = Math.min(1, pt.br * fadeFar * 0.9);
          if (a <= 0.01) continue;
          const sz = Math.max(1, pt.sz * k * 2.2);
          ctx.globalAlpha = a;
          ctx.drawImage(sprites[pt.ci], sx - sz / 2, sy - sz / 2, sz, sz);
        }
      };
      render(tunnel, false);
      render(ring, true);
      ctx.globalAlpha = 1;
    };

    if (reduce) { draw(); }
    else {
      const loop = () => { rot += 0.0009; draw(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [ringN, tunnelN, tilt, cx, cy, scrollDriven]);

  return <canvas ref={ref} className="halo-canvas" aria-hidden="true" />;
}

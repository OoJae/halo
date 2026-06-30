import { useEffect, useRef } from "react";

// Faithful port of the brand subpage backdrop (brand/Halo - *.dc.html → setupHalo):
// a static torus ring (fixed camera) + a faint ambient field, the ring centered at
// (cx*w, cyBase*h) and drifting up on scroll. Distinct from the home fly-through.
export default function RingCanvas({
  R = 250,
  rt = 15,
  ringN = 1400,
  tilt = 0.5,
  cxDesktop = 0.5,
  cyBase = 0.4,
  cyFactor = 0.12,
  cyMax = 0.4,
}: {
  R?: number;
  rt?: number;
  ringN?: number;
  tilt?: number;
  cxDesktop?: number;
  cyBase?: number;
  cyFactor?: number;
  cyMax?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const mk = (rgb: string) => {
      const s = 48, c = document.createElement("canvas");
      c.width = c.height = s;
      const g = c.getContext("2d")!;
      const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      r.addColorStop(0, `rgba(${rgb},1)`);
      r.addColorStop(0.28, `rgba(${rgb},0.42)`);
      r.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = r;
      g.fillRect(0, 0, s, s);
      return c;
    };
    const sprites = [mk("183,184,255"), mk("126,126,242"), mk("86,230,170")];

    let w = 0, h = 0, mobile = false;
    const resize = () => {
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      mobile = w < 720;
    };
    resize();
    window.addEventListener("resize", resize);

    const RN = mobile ? Math.round(ringN * 0.6) : ringN;
    type Rp = { u: number; v: number; ci: number; br: number; sz: number };
    const ring: Rp[] = [];
    for (let i = 0; i < RN; i++) {
      ring.push({
        u: Math.random() * Math.PI * 2,
        v: Math.random() * Math.PI * 2,
        ci: Math.random() < 0.05 ? 2 : Math.random() < 0.5 ? 0 : 1,
        br: 0.5 + Math.random() * 0.45,
        sz: 0.7 + Math.random() * 1.0,
      });
    }
    const ambN = mobile ? 220 : 420;
    const amb = Array.from({ length: ambN }, () => ({
      x: Math.random() * 2 - 1, y: Math.random() * 2 - 1,
      sz: 0.5 + Math.random() * 1.2, br: 0.2 + Math.random() * 0.4,
    }));

    const fov = 560, camZ = -560;
    const t0 = performance.now();
    const render = (time: number) => {
      const cy = h * cyBase - Math.min(window.scrollY * cyFactor, h * cyMax);
      const cx = w * (w < 820 ? 0.5 : cxDesktop);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < amb.length; i++) {
        const a = amb[i];
        const d = 1.2 + a.sz * 1.4;
        ctx.globalAlpha = a.br * 0.5;
        ctx.drawImage(sprites[1], cx + a.x * w * 0.55 - d, cy + a.y * h * 0.6 - d, d * 2, d * 2);
      }

      const ax = tilt + Math.sin(time * 0.0002) * 0.05;
      const az = time * 0.00006;
      const ca = Math.cos(ax), sa = Math.sin(ax), cz = Math.cos(az), sz = Math.sin(az);
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i];
        const cvv = Math.cos(p.v), svv = Math.sin(p.v), cuu = Math.cos(p.u), suu = Math.sin(p.u);
        const x0 = (R + rt * cvv) * cuu, y0 = (R + rt * cvv) * suu, z0 = rt * svv;
        const y1 = y0 * ca - z0 * sa, z1 = y0 * sa + z0 * ca;
        const x2 = x0 * cz - y1 * sz, y2 = x0 * sz + y1 * cz;
        const zc = z1 - camZ;
        if (zc <= 9) continue;
        const sc = fov / zc;
        const px = cx + x2 * sc, py = cy + y2 * sc;
        const d = (2.2 + 2.3 * p.sz) * sc;
        ctx.globalAlpha = p.br * Math.min(1, Math.max(0.15, (sc - 0.72) / 0.7)) * 0.92;
        ctx.drawImage(sprites[p.ci], px - d, py - d, d * 2, d * 2);
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    if (reduce) {
      render(0);
      const onScroll = () => render(0);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", resize); };
    }
    const loop = (now: number) => { render(now - t0); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [R, rt, ringN, tilt, cxDesktop, cyBase, cyFactor, cyMax]);

  return (
    <>
      <canvas ref={ref} className="halo-canvas" aria-hidden="true" />
      <div className="halo-vignette-amb" />
      <div className="halo-noise" />
    </>
  );
}

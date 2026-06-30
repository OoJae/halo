import { useEffect, useRef } from "react";

// Faithful port of the brand hero fly-through canvas (brand/Halo.dc.html → setupHero).
// A glowing torus "ring" of additive sprites + a depth "tunnel" field, perspective-projected.
// Auto-spins slowly; with `scrollDriven` the camera eases forward as you scroll (the landing
// hero). Static pages hold the camera at `staticP`. Center is (cx*w, cy*h).
export default function HaloCanvas({
  ringN = 1700,
  tunnelN = 1500,
  tilt = 0.5,
  cx = 0.5,
  cy = 0.5,
  scrollDriven = false,
  staticP = 0,
}: {
  ringN?: number;
  tunnelN?: number;
  tilt?: number;
  cx?: number;
  cy?: number;
  scrollDriven?: boolean;
  staticP?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    // pre-rendered radial glow sprites (indigo-bright, indigo, green)
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

    // geometry — torus ring + tunnel field
    const R = 235, rt = 16;
    const RN = mobile ? Math.min(ringN, 1000) : ringN;
    const TN = mobile ? Math.min(tunnelN, 800) : tunnelN;
    type Rp = { u: number; v: number; ci: number; br: number; sz: number };
    type Tp = { x: number; y: number; z: number; ci: number; br: number; sz: number };
    const ring: Rp[] = [];
    for (let i = 0; i < RN; i++) {
      ring.push({
        u: Math.random() * Math.PI * 2,
        v: Math.random() * Math.PI * 2,
        ci: Math.random() < 0.05 ? 2 : Math.random() < 0.5 ? 0 : 1,
        br: 0.55 + Math.random() * 0.45,
        sz: 0.7 + Math.random() * 1.1,
      });
    }
    const tun: Tp[] = [];
    for (let i = 0; i < TN; i++) {
      const a = Math.random() * Math.PI * 2;
      const rad = 70 + Math.random() * 470;
      tun.push({
        x: Math.cos(a) * rad,
        y: Math.sin(a) * rad,
        z: -950 + Math.random() * 1900,
        ci: Math.random() < 0.04 ? 2 : Math.random() < 0.6 ? 1 : 0,
        br: 0.4 + Math.random() * 0.5,
        sz: 0.6 + Math.random() * 1.0,
      });
    }

    const fov = 560, camStart = -560, camEnd = 250, near = 9;
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const targetP = () => {
      const span = window.innerHeight * 1.25;
      return Math.max(0, Math.min(1, window.scrollY / span));
    };

    const ox = () => w * cx, oy = () => h * cy;
    const drawPoint = (px: number, py: number, zc: number, sp: HTMLCanvasElement, brAlpha: number, szf: number) => {
      if (zc <= near) return;
      const sc = fov / zc;
      const sx = ox() + px * sc;
      const sy = oy() + py * sc;
      if (sx < -200 || sx > w + 200 || sy < -200 || sy > h + 200) return;
      let d = (2.2 + 2.4 * szf) * sc;
      if (d > 340) d = 340;
      const fadeFar = Math.max(0.12, Math.min(1, 1 - (zc - 320) / 1500));
      const fadeNear = Math.max(0, Math.min(1, zc / 55));
      const a = brAlpha * fadeFar * fadeNear;
      if (a <= 0.01) return;
      ctx.globalAlpha = a;
      ctx.drawImage(sp, sx - d, sy - d, d * 2, d * 2);
    };

    let p = scrollDriven ? targetP() : staticP;
    const t0 = performance.now();
    const render = (time: number) => {
      const camZ = camStart + (camEnd - camStart) * ease(p);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const ca = Math.cos(tilt), sa = Math.sin(tilt);
      const spin = time * 0.05;
      const cz = Math.cos(spin), sz = Math.sin(spin);
      for (let i = 0; i < tun.length; i++) {
        const q = tun[i];
        drawPoint(q.x, q.y, q.z - camZ, sprites[q.ci], q.br, q.sz);
      }
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        const cvv = Math.cos(pt.v), svv = Math.sin(pt.v), cuu = Math.cos(pt.u), suu = Math.sin(pt.u);
        const x0 = (R + rt * cvv) * cuu;
        const y0 = (R + rt * cvv) * suu;
        const z0 = rt * svv;
        const y1 = y0 * ca - z0 * sa;
        const z1 = y0 * sa + z0 * ca;
        const x2 = x0 * cz - y1 * sz;
        const y2 = x0 * sz + y1 * cz;
        drawPoint(x2, y2, z1 - camZ, sprites[pt.ci], pt.br, pt.sz);
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    if (reduce) {
      render(0);
      if (scrollDriven) {
        const onScroll = () => { p = targetP(); render(0); };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", resize); };
      }
      return () => window.removeEventListener("resize", resize);
    }
    const loop = (now: number) => {
      if (scrollDriven) p += (targetP() - p) * 0.12;
      render((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [ringN, tunnelN, tilt, cx, cy, scrollDriven, staticP]);

  return (
    <>
      <canvas ref={ref} className="halo-canvas" aria-hidden="true" />
      <div className="halo-vignette" />
      <div className="halo-noise" />
    </>
  );
}

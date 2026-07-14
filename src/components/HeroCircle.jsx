import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/masonry.js';

/* Hero 主視覺：白噴點粒子圓（Figma 255-2 版）。
   確定性渲染——亮度不靠逐幀累積（低幀率環境也不會變暗）：
   - 底圖（offscreen 預繪一次）：柔邊白圓盤 + 內部細顆粒 + 弧緣密集噴點。
   - 每幀：畫底圖 → 疊動態噴點（弧緣帶漂移、閃爍）→ 完成。
   - 開場：圓盤 60 幀淡入、噴點自四散處向弧緣匯聚（聚集敘事）。
   - 上下漂浮由外層 .lp-float CSS 動畫負責，與幀率無關。
   - prefers-reduced-motion：畫一張靜態底圖＋靜態噴點。
   純 canvas 零相依；顏色一律近白（#F4F3EF）。 */
export default function HeroCircle() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');

    let base = null;          // 預繪底圖（offscreen canvas）
    let sprays = [];          // 動態噴點
    let w = 0, h = 0, dpr = 1, raf = 0, running = false;
    let cx = 0, cy = 0, R = 0;
    let t0 = 0;               // 開場起點（時間基準：低幀率環境下進場仍準時完成）
    let entranceDone = false;

    const FADE_IN_MS = 900;   // 圓盤淡入
    const GATHER_MS = 1400;   // 噴點匯聚

    // 弧緣帶取一點：密度向外遞減（冪次偏內側）
    const edgePoint = () => {
      const a = Math.random() * Math.PI * 2;
      const d = R * (0.94 + Math.pow(Math.random(), 2) * 0.24);
      return { a, d };
    };

    function buildBase() {
      base = document.createElement('canvas');
      base.width = canvas.width;
      base.height = canvas.height;
      const b = base.getContext('2d');
      b.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 柔邊白圓盤：亮核心、外緣漸消
      const g = b.createRadialGradient(cx, cy, 0, cx, cy, R * 1.02);
      g.addColorStop(0, 'rgba(244, 243, 239, 0.92)');
      g.addColorStop(0.78, 'rgba(244, 243, 239, 0.86)');
      g.addColorStop(0.94, 'rgba(244, 243, 239, 0.4)');
      g.addColorStop(1, 'rgba(244, 243, 239, 0)');
      b.fillStyle = g;
      b.fillRect(cx - R * 1.1, cy - R * 1.1, R * 2.2, R * 2.2);

      // 內部細顆粒：讓圓盤有紙感而非平滑漸層
      b.fillStyle = '#0C0C0C';
      const grain = Math.round((R * R) / 30);
      for (let i = 0; i < grain; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * R;
        b.globalAlpha = 0.04 + Math.random() * 0.1;
        b.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1, 1);
      }

      // 弧緣靜態噴點：密集的白點向外散逸（Figma 的噴灑質感主體）
      b.fillStyle = '#F4F3EF';
      const spray = Math.round(R * 26);
      for (let i = 0; i < spray; i++) {
        const { a, d } = edgePoint();
        b.globalAlpha = 0.2 + Math.random() * 0.6;
        const s = Math.random() < 0.85 ? 1 : 1.6;
        b.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s);
      }
      b.globalAlpha = 1;
    }

    function spawnSprays() {
      // 動態噴點：數量適中，負責「弧緣是活的」
      const count = Math.min(700, Math.max(240, Math.round(R * 1.6)));
      sprays = [];
      for (let i = 0; i < count; i++) {
        const { a, d } = edgePoint();
        sprays.push({
          a, d,
          // 聚集開場的出發點：畫布四散
          sx: Math.random() * w, sy: Math.random() * h,
          drift: (Math.random() - 0.5) * 0.0022,  // 弧向緩慢漂移
          tw: Math.random() * Math.PI * 2,        // 閃爍相位
          tws: 0.03 + Math.random() * 0.05,       // 閃爍速度
          size: Math.random() < 0.8 ? 1 : 1.7,
        });
      }
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w, h) * 0.44;
      buildBase();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0, w, h);
    }

    function step() {
      const t = performance.now() - t0;
      const ease = entranceDone ? 1 : Math.min(1, t / FADE_IN_MS);
      const gather = entranceDone ? 1 : Math.min(1, t / GATHER_MS);
      const gEase = 1 - Math.pow(1 - gather, 3); // ease-out-cubic
      if (gather >= 1) entranceDone = true;

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = ease;
      ctx.drawImage(base, 0, 0, w, h);

      ctx.fillStyle = '#F4F3EF';
      for (const p of sprays) {
        p.a += p.drift;
        p.tw += p.tws;
        const tx = cx + Math.cos(p.a) * p.d;
        const ty = cy + Math.sin(p.a) * p.d;
        // 聚集開場：從四散出發點滑向弧緣定位
        const x = p.sx + (tx - p.sx) * gEase;
        const y = p.sy + (ty - p.sy) * gEase;
        ctx.globalAlpha = ease * (0.25 + (Math.sin(p.tw) + 1) * 0.3);
        ctx.fillRect(x, y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    }

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(step); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    size();
    const reduced = prefersReducedMotion();
    if (reduced) {
      drawStatic();
    } else {
      spawnSprays();
      t0 = performance.now();
      start();
    }

    // 捲出視窗就暫停，省電也避免背景無謂重繪
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(canvas);

    const onResize = () => {
      stop();
      size();
      if (reduced) {
        drawStatic();
      } else {
        spawnSprays();
        entranceDone = true; // resize 後不重播開場
        start();
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

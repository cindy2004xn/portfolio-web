import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/masonry.js';

/* Hero 背景：森林綠粒子流場（nirnor 式織物質感）。
   數千顆次像素微點、單點極低透明度，靠軌跡「累積」形成細絲狀流紋——
   質感來自密度而非單點；殘影用紙色低透明度覆蓋緩慢淡出。
   離開視窗自動暫停（IntersectionObserver）；尊重 prefers-reduced-motion
   （關閉動態則畫一張靜態點陣）。純 canvas 無相依套件。 */
export default function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let w = 0, h = 0, dpr = 1, raf = 0, t = 0, running = false;

    const reset = (p, fresh = false) => {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.maxLife = 240 + Math.random() * 360;
      p.life = fresh ? Math.random() * p.maxLife : p.maxLife;
      p.speed = 0.22 + Math.random() * 0.3;   // 慢速漂移，讓絲紋緩緩生長
      p.alpha = 0.06 + Math.random() * 0.09;  // 單點仍淡，但足以累積出可見絲紋
    };

    function spawn() {
      // nirnor 級密度：隨面積自適應（1440×800 約 4400 顆）
      const count = Math.min(5000, Math.max(700, Math.round((w * h) / 260)));
      particles = [];
      for (let i = 0; i < count; i++) {
        const p = {};
        reset(p, true);
        particles.push(p);
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
      ctx.clearRect(0, 0, w, h);
    }

    // 雙頻流場：低頻定大勢、高頻添細節，隨 t 極緩演化
    const angleAt = (x, y) =>
      (Math.sin(x * 0.0011 + t) + Math.cos(y * 0.0013 - t * 0.8)) * Math.PI
      + Math.sin((x + y) * 0.0032 + t * 1.6) * 0.6;

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#35431F';
      const n = Math.min(1400, Math.round((w * h) / 900));
      for (let i = 0; i < n; i++) {
        ctx.globalAlpha = 0.04 + Math.random() * 0.06;
        ctx.fillRect(Math.random() * w, Math.random() * h, 0.9, 0.9);
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      t += 0.0006;
      // 極低透明度的紙色覆蓋：殘影淡得慢，絲紋才能累積成形
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(217, 213, 199, 0.038)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#35431F';
      for (const p of particles) {
        const a = angleAt(p.x, p.y);
        p.x += Math.cos(a) * p.speed;
        p.y += Math.sin(a) * p.speed;
        p.life -= 1;
        if (p.x < -2 || p.x > w + 2 || p.y < -2 || p.y > h + 2 || p.life <= 0) reset(p);
        // 生命週期首尾淡入淡出，避免微點突現/突滅
        const k = Math.min(1, Math.min(p.maxLife - p.life, p.life) / (p.maxLife * 0.1));
        ctx.globalAlpha = p.alpha * k;
        ctx.fillRect(p.x, p.y, 0.85, 0.85);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    size();
    const reduced = prefersReducedMotion();
    if (reduced) {
      drawStatic();
    } else {
      spawn();
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
      if (reduced) drawStatic();
      else { spawn(); start(); }
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

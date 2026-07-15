import { NOISE_SEEDS } from './NoiseDefs.jsx';

/* Hero 主視覺：白噴點粒子圓。正本 Figma 266:183。
   圓 964×964、r=482，漸層 #D3D3D3 → #D3D3D3 @82.69% → 近白 30% @100%；
   噴點質感來自 NoiseDefs 的 feTurbulence + feDisplacementMap（與 Figma 同參數）。

   viewBox 用 1164 而非 964：feDisplacementMap 的 scale=200 讓圖形向外擴 100px（各邊），
   viewBox 不留這 100px 餘裕的話最外圈噴點會被裁掉。圓心因此在 (582, 582)。

   雜訊動態：3 層同圓、各掛不同 seed 的濾鏡，用 CSS 短交叉淡出輪流現身。
   濾鏡各只算一次（瀏覽器會快取），切換純合成 → 低階機器也不掉幀。
   上下浮動由外層 .lp-float 負責，與本元件無關。 */

export default function HeroCircle() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
      {NOISE_SEEDS.map((seed, i) => (
        <svg
          key={seed}
          className="lp-noise-layer"
          viewBox="0 0 1164 1164"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animationDelay: `calc(var(--ju-noise-interval) * ${i})`,
          }}
        >
          <defs>
            <radialGradient
              id={`ju-hero-disc-${i}`}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(582 582) rotate(90) scale(482)"
            >
              <stop stopColor="var(--ju-hero-disc)" />
              <stop offset="0.826923" stopColor="var(--ju-hero-disc)" />
              <stop offset="1" stopColor="var(--ju-text)" stopOpacity="0.3" />
            </radialGradient>
          </defs>
          <circle cx="582" cy="582" r="482" fill={`url(#ju-hero-disc-${i})`} filter={`url(#ju-noise-${i})`} />
        </svg>
      ))}
    </div>
  );
}

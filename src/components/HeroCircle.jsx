/* Hero 主視覺：白噴點粒子圓。正本 Figma 266:183。
   圓 964×964、r=482，漸層 #D3D3D3 → #D3D3D3 @82.69% → 近白 30% @100%；
   噴點質感來自 NoiseDefs 的 feTurbulence + feDisplacementMap（與 Figma 同參數）。

   viewBox 用 1164 而非 964：feDisplacementMap 的 scale=200 讓圖形向外擴 100px（各邊），
   viewBox 不留這 100px 餘裕的話最外圈噴點會被裁掉。圓心因此在 (582, 582)。

   靜態單層：早期版本用 3 層不同 seed 的濾鏡每 0.9s 硬切輪替製造躁動感，
   但那個離散瞬跳在大面積淺色圓上讀起來像閃爍（一閃一閃），已改為單層靜止。
   這裡用 Figma 原 seed（ju-noise-0），與光暈同源。
   唯一的動態是外層 .lp-float 的緩慢上下浮動，與本元件無關。 */

export default function HeroCircle() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
      <svg
        viewBox="0 0 1164 1164"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient
            id="ju-hero-disc-0"
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
        <circle cx="582" cy="582" r="482" fill="url(#ju-hero-disc-0)" filter="url(#ju-noise-0)" />
      </svg>
    </div>
  );
}

/* 區塊光暈。正本 Figma 266:176–266:182。
   三種直徑（894 標題／1038 區段中段／844 收尾），共用同一組漸層；
   噴點質感與 Hero 圓同源（NoiseDefs 的 ju-noise-0，即 Figma 原 seed 3124）。
   全部靜態——7 顆光暈若都動，濾鏡成本會壓垮低階機器。

   Figma 是絕對座標（標題光暈圓心固定在 x=99）；網頁是流式排版，
   因此改成掛在區塊上、用 align 表達「壓左緣／靠右／置中」的關係。
   1440 基準：左 → 圓心 x=99；右 → 圓心 x≈1305；中 → 圓心 x=720。 */

/* 這裡減的是「容器的一半」不是「圓的半徑」——容器為了裝下濾鏡外擴的 100px
   比圓大一圈（size + 200），圓心在容器正中。用半徑會讓每顆光暈都偏 100px。 */
const ALIGN_X = {
  left:   'calc(99px - var(--glow-half))',          // 圓心壓在視窗左緣內 99px，大半溢出
  right:  'calc(100% - 135px - var(--glow-half))',  // 1440-1305=135，圓心靠右緣內側
  center: 'calc(50% - var(--glow-half))',
};

export default function Glow({ size, align = 'left', top }) {
  /* 濾鏡把圖形向外推 100px，容器與 viewBox 都要留這個餘裕 */
  const box = size + 200;
  const r = size / 2;
  const id = `ju-glow-${size}-${align}`;
  return (
    <div
      aria-hidden="true"
      style={{
        '--glow-half': `${box / 2}px`,
        position: 'absolute',
        width: box,
        height: box,
        left: ALIGN_X[align],
        top: `calc(${top} - ${box / 2}px)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg viewBox={`0 0 ${box} ${box}`} width="100%" height="100%">
        <defs>
          <radialGradient
            id={id}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${box / 2} ${box / 2}) rotate(90) scale(${r})`}
          >
            <stop stopColor="var(--ju-glow-1)" stopOpacity="0.5" />
            <stop offset="0.493652" stopColor="var(--ju-glow-2)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--ju-glow-3)" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle cx={box / 2} cy={box / 2} r={r} fill={`url(#${id})`} fillOpacity="0.6" filter="url(#ju-noise-0)" />
      </svg>
    </div>
  );
}

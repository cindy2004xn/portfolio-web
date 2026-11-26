/* Figma 的「噴點」質感正本（節點 266:183 圓 / 266:176-182 光暈）。
   質感 = feTurbulence(fractalNoise) 打出雜訊 → feDisplacementMap 依雜訊位移圖形，
   位移量 200 讓圓的輪廓整個被打散成噴灑的點，而不只是邊緣模糊。
   baseFrequency / numOctaves / scale 三個值是 Figma 原值，改動即偏離設計稿。

   單一 seed 3124（Figma 原值）：Hero 圓與光暈共用這個靜態濾鏡（ju-noise-0）。
   早期為了讓 Hero 圓輪替躁動而加的 4218/5307 兩個 seed，在改為靜止後已無用途，移除。
   濾鏡只算一次、瀏覽器快取。 */

export const NOISE_SEEDS = [3124];

export default function NoiseDefs() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        {NOISE_SEEDS.map((seed, i) => (
          /* filter region 放大到 124%：位移 200 會把圖形推出原本的 bounding box，
             用預設的 120% 會把最外圈噴點裁掉 */
          <filter
            key={seed}
            id={`ju-noise-${i}`}
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="200" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

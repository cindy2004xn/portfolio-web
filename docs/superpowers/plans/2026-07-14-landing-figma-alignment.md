# Landing 對齊 Figma 實作計畫（v3.3）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Landing 的 Hero 排版與粒子圓做到與 Figma `266-175` 一致（第一屏須露出 What make me different 卡 128px），全站導入 7 顆光暈，新增專業證書區，並同步設計系統文件。

**Architecture:** Hero 圓與光暈的「噴點」質感改用瀏覽器原生 SVG 濾鏡（`feTurbulence` + `feDisplacementMap`），與 Figma 同參數；現行 canvas 逐點手繪實作退場。濾鏡定義集中在一個 `NoiseDefs` 元件，Hero 與光暈共用。Hero 全部尺寸由圓直徑 `--ju-hero-d` 推導，維持 Figma 的比例關係。

**Tech Stack:** React 18 + Vite，JSX inline style + `var(--ju-*)` token + 字體 helper class。零新增相依。

**規格正本：** [docs/superpowers/specs/2026-07-14-landing-figma-alignment-design.md](../specs/2026-07-14-landing-figma-alignment-design.md)

## Global Constraints

- **顏色一律用 `var(--ju-*)` token**，不寫死色碼（AGENTS.md 鐵則 5）
- **禁用 `#FFFFFF` 與 `#000000`**（DESIGN.md No-Pure-Ink Rule）。Figma 稿的純白/純黑一律換 `#F4F3EF` / `#141414`
- **零彩度**：新增色值必須 R=G=B
- **零新增 runtime 相依**：runtime 只有 react、react-dom、react-router-dom
- **UI 文案與註解用繁體中文**
- **可點擊的東西必須是 `<a>` 或 `<button>`**；純圖示按鈕加 `aria-label`；裝飾性元素加 `aria-hidden`
- **`prefers-reduced-motion` 必須處理**，且版面不得因此破掉
- **commit 規矩**：本專案使用者說 commit 才提交、**絕不主動 push**。各 Task 的 commit 步驟一律先回報、等她指示

## 驗證方式（本專案無測試框架）

`package.json` 沒有 test script，runtime 也沒有測試相依。AGENTS.md 定義的品質關卡是 **build + 瀏覽器實測**，本計畫依此執行，不寫單元測試：

- `npm run dev` → Browser 工具（`read_console_messages` / `read_page` / `javascript_tool` / `computer` 截圖）
- `npm run build` 需 `.env`（Notion API key），**只在最後一個 Task 跑一次**
- 量測用 `javascript_tool` 讀 `getBoundingClientRect()`，不靠目測

---

### Task 1: Design token、字體、濾鏡定義（地基）

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `index.html:17`
- Modify: `src/index.css:147-148`
- Create: `src/components/NoiseDefs.jsx`

**Interfaces:**
- Produces: CSS 變數 `--ju-hero-disc` / `--ju-pill-bg` / `--ju-pill-border` / `--ju-hairline` / `--ju-glow-1` / `--ju-glow-2` / `--ju-glow-3`
- Produces: `NoiseDefs` 預設匯出（無 props）；濾鏡 id `ju-noise-0` ~ `ju-noise-3`
- Produces: `.ju-hand-en` 改用 Nothing You Could Do

- [ ] **Step 1: 在 tokens.css 的 `:root` 補新色階**

接在 `--ju-border-card` 那行之後：

```css
  /* ── Figma 266-175 帶進的灰階（全部 R=G=B，零彩度不變） ── */
  --ju-hero-disc:    #D3D3D3;  /* Hero 粒子圓漸層主色 */
  --ju-pill-bg:      #2E2E2E;  /* Hero pill 底（≈ 近白 14.7% 疊近黑） */
  --ju-pill-border:  #4C4C4C;  /* Hero pill 邊 */
  --ju-hairline:     #B8B8B8;  /* Hero 中央垂線導引 */
  --ju-glow-1:       #D9D9D9;  /* 光暈漸層 0% */
  --ju-glow-2:       #A7A7A7;  /* 光暈漸層 49.37% */
  --ju-glow-3:       #737373;  /* 光暈漸層 100% */
```

- [ ] **Step 2: 換字體**

`index.html:17` 的 Google Fonts href：移除 `family=Caveat:wght@500;600&`、移除 `family=LXGW+WenKai+TC&`（全專案無使用處，`grep -rn "LXGW" src/` 零命中）、加入 `family=Nothing+You+Could+Do&`。改完的 href：

```html
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Nothing+You+Could+Do&family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
```

`src/index.css:147-148` 改成：

```css
/* ── 手寫簽名：英文行用 Nothing You Could Do（Figma 266:184 指定）；中文名用她提供的真跡 signature.png ── */
.ju-hand-en { font-family: 'Nothing You Could Do', cursive; }
```

- [ ] **Step 3: 建立濾鏡定義元件**

Create `src/components/NoiseDefs.jsx`：

```jsx
/* Figma 的「噴點」質感正本（節點 266:183 / 266:176 等）。
   質感 = feTurbulence(fractalNoise) 打出雜訊 → feDisplacementMap 依雜訊位移圖形，
   位移量 200 讓圓的輪廓整個被打散成噴灑的點，而不只是邊緣模糊。
   baseFrequency / numOctaves / scale 三個值是 Figma 原值，改動即偏離設計稿。

   4 個 seed 供 Hero 圓交替製造雜訊躁動感（濾鏡各只算一次，不逐幀重算）；
   seed 3124 是 Figma 原值，其餘三個是為了動態而生的同族亂數。
   光暈固定用 ju-noise-0（Figma 原 seed），保持靜態。 */

export const NOISE_SEEDS = [3124, 4218, 5307, 6491];

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
```

- [ ] **Step 4: 驗證 dev server 起得來、無 console 錯誤**

用 `preview_start` 起 dev server（`.claude/launch.json` 若不存在則建立，`runtimeExecutable: "npm"`、`runtimeArgs: ["run","dev"]`、`port: 5173`）。

Run: `read_console_messages`
Expected: 零 error（此時 `NoiseDefs` 還沒被掛上，畫面應與改動前一致，只有手寫字體換掉）

- [ ] **Step 5: 回報並等待 commit 指示**

回報「Task 1 完成：token、字體、濾鏡定義就位」。**等使用者說了才 commit。**

```bash
git add src/styles/tokens.css index.html src/index.css src/components/NoiseDefs.jsx
git commit -m "feat: 導入 Figma 噴點濾鏡定義與新灰階 token（Nothing You Could Do 取代 Caveat）"
```

---

### Task 2: Hero 粒子圓（SVG 濾鏡）← **驗證關卡**

**Files:**
- Rewrite: `src/components/HeroCircle.jsx`（canvas 實作整個退場）
- Modify: `src/index.css`（新增 `.lp-noise-layer` 與 keyframes）

**Interfaces:**
- Consumes: `NoiseDefs` 的濾鏡 id `ju-noise-0` ~ `ju-noise-3`；token `--ju-hero-disc` / `--ju-text`
- Produces: `HeroCircle` 預設匯出（無 props），自身 `position: absolute; inset: 0`，由父容器決定尺寸

- [ ] **Step 1: 重寫 HeroCircle.jsx**

`src/components/HeroCircle.jsx` 全檔取代：

```jsx
import { NOISE_SEEDS } from './NoiseDefs.jsx';

/* Hero 主視覺：白噴點粒子圓。正本 Figma 266:183。
   圓 964×964、r=482，漸層 #D3D3D3 → #D3D3D3 @82.69% → 近白 30% @100%；
   噴點質感來自 NoiseDefs 的 feTurbulence + feDisplacementMap（與 Figma 同參數）。

   viewBox 用 1164 而非 964：feDisplacementMap 的 scale=200 讓圖形向外擴 100px（各邊），
   viewBox 不留這 100px 餘裕的話最外圈噴點會被裁掉。圓心因此在 (582, 582)。

   雜訊動態：4 層同圓、各掛不同 seed 的濾鏡，用 CSS 輪流切換 opacity。
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
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animationDelay: `calc(var(--ju-noise-interval) * ${i})` }}
        >
          <defs>
            <radialGradient
              id={`ju-hero-disc-${i}`}
              cx="0" cy="0" r="1"
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
```

- [ ] **Step 2: 加入 seed 交替動畫**

`src/index.css`，接在 `.lp-float` 的 keyframes 之後：

```css
/* ── Hero 粒子圓的雜訊躁動：4 層不同 seed 的濾鏡輪流現身。
   steps(1) 硬切而非淡入淡出——雜訊本來就是跳的，交叉淡出會糊成一團。
   濾鏡各只算一次，這裡切的只是 opacity，成本趨近於零。 ── */
:root {
  --ju-noise-interval: 0.6s;   /* 每張 seed 停留時間；調快更躁、調慢更靜 */
  --ju-noise-count: 4;         /* 與 NoiseDefs 的 NOISE_SEEDS 長度一致 */
}
.lp-noise-layer {
  opacity: 0;
  animation: lp-noise-cycle calc(var(--ju-noise-interval) * var(--ju-noise-count)) steps(1, end) infinite;
}
@keyframes lp-noise-cycle {
  0%   { opacity: 1; }
  25%  { opacity: 0; }
  100% { opacity: 0; }
}

/* reduced-motion：全域規則會把動畫縮到 0.01ms/iteration 1，四層會全部停在 opacity 0
   （＝圓整個消失）。這裡必須明確讓第一層留下來，否則版面破。 */
@media (prefers-reduced-motion: reduce) {
  .lp-noise-layer { animation: none; opacity: 0; }
  .lp-noise-layer:first-child { opacity: 1; }
}
```

- [ ] **Step 3: 把 NoiseDefs 掛進 LandingPage**

`src/pages/LandingPage.jsx`，在 `return (` 的最外層 `<div>` 內第一行加入（import 一併加）：

```jsx
import NoiseDefs from '../components/NoiseDefs.jsx';
```

```jsx
      {/* SVG 濾鏡定義：Hero 圓與光暈共用，必須在使用前掛載 */}
      <NoiseDefs />
```

- [ ] **Step 4: 瀏覽器驗證濾鏡有生效**

Run: `read_console_messages`
Expected: 零 error

Run: `javascript_tool` → `document.querySelectorAll('.lp-noise-layer').length`
Expected: `4`

Run: `javascript_tool` → `getComputedStyle(document.querySelector('.lp-noise-layer')).animationName`
Expected: `"lp-noise-cycle"`

- [ ] **Step 5: 截圖並與 Figma 並排比對 → 交使用者確認**

Run: `computer {action: "screenshot"}`（視窗先 `resize_window` 到 1440×966）

把截圖與 Figma 的 hero 截圖（`266-175`）並排呈現給使用者。

**STOP。這是規格第二節載明的驗證關卡。**

`feTurbulence` 的顆粒分布由渲染引擎決定，Figma 與瀏覽器不保證逐點相同。**必須由使用者確認質感過關才往下做。** 若不過關，退路是把 Figma 的圓匯出 PNG 當靜態素材（但會失去雜訊動態感）——那是設計取捨，由使用者裁決，不要自行決定。

- [ ] **Step 6: 回報並等待 commit 指示**

```bash
git add src/components/HeroCircle.jsx src/components/NoiseDefs.jsx src/index.css src/pages/LandingPage.jsx
git commit -m "feat: Hero 粒子圓改用 SVG feTurbulence 濾鏡（canvas 手繪實作退場）"
```

---

### Task 3: Hero 排版對齊 Figma ← **驗證關卡（128px）**

**Files:**
- Modify: `src/pages/LandingPage.jsx:211-243`（hero section 整段重砌）
- Modify: `src/index.css`（新增 hero 尺寸變數與 `.lp-hero-*`）

**Interfaces:**
- Consumes: `HeroCircle`、token `--ju-pill-bg` / `--ju-pill-border` / `--ju-hairline` / `--ju-text` / `--ju-on-accent`
- Produces: hero section 高度 = `0.3537 × D + 226 + 46 + 183 + 42`（D = `--ju-hero-d`）

**幾何推導（全部相對圓直徑 D，1440 基準 D=964）：**

| 值 | 算式 | D=964 時 |
|----|------|---------|
| 濾鏡框 S | `D × 1.2074` | 1164 |
| 圓容器 top | `D × -0.6908` | −666 |
| 圓容器 left | `50% − S/2 − D×0.0114` | 127（圓心偏左 11px，Figma 原值） |
| 圓底（不含噴點） | `D × 0.4129` | 398 |
| pill 組 top | `D × 0.3537` | 341（pill 底緣正好貼齊圓底） |
| section 總高 | `D×0.3537 + 226 + 46 + 183 + 42` | 838 |
| 第一屏露出 | `966 − 838` | **128** |

- [ ] **Step 1: 加入 hero 尺寸變數**

`src/index.css` 的 `:root`（與 `--ju-noise-interval` 同區）：

```css
  /* ── Hero 幾何：全部由圓直徑推導，維持 Figma 266-175 的比例關係。
     66.94vw = 964/1440（Figma 基準）；下限 420px 讓窄視窗仍出血。 ── */
  --ju-hero-d: clamp(420px, 66.94vw, 964px);
  --ju-hero-s: calc(var(--ju-hero-d) * 1.2074);  /* 含噴點擴散的濾鏡框 */
```

- [ ] **Step 2: 重砌 hero section**

`src/pages/LandingPage.jsx` 的 hero `<section>`（含上方註解，即現行 207–243 行）整段取代：

```jsx
      {/* 1. Hero — 正本 Figma 266-175。
          圓心在視窗上方外（-84），只露下半弧；pill 底緣貼齊圓底（398），
          這個重疊是 Figma 的設計，也是第一屏能露出定位卡 128px 的關鍵。
          置中直落：簽名 → pill → UX Designer → 信任句 → 垂線導引 → 定位卡露頭。 */}
      <section
        className="lp-hero"
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: `calc(var(--ju-hero-d) * 0.3537) 24px 42px`,
          /* 圓在窄視窗會比視窗寬（出血是刻意的），不裁會產生橫向捲動。
             用 clip 不用 hidden：hidden 會讓 y 軸隱含變 auto、把 section 變成捲動容器。 */
          overflowX: 'clip',
        }}
      >
        {/* 圓與簽名一起浮動：簽名是寫在圓上的，分開浮會穿幫 */}
        <div
          className="lp-float"
          style={{
            position: 'absolute',
            width: 'var(--ju-hero-s)',
            height: 'var(--ju-hero-s)',
            left: 'calc(50% - var(--ju-hero-s) / 2 - var(--ju-hero-d) * 0.0114)',
            top: 'calc(var(--ju-hero-d) * -0.6908)',
            pointerEvents: 'none',
          }}
        >
          <HeroCircle />
          {/* 簽名落在圓的可見亮區：Figma 的 y=97 相對圓容器 = (97+666)/1164 = 65.5% */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '65.5%',
              boxSizing: 'border-box',
            }}
          >
            <span
              className="ju-hand-en lp-fade-up"
              style={{ animationDelay: '1.1s', fontSize: 'clamp(14px, 1.39vw, 20px)', color: 'var(--ju-on-accent)', lineHeight: 1.3 }}
            >
              Hi, I'm Cindy Ju
            </span>
            <img
              className="lp-fade-up"
              src="/signature.png"
              alt="朱千慧 手寫簽名"
              style={{ animationDelay: '1.3s', width: 'calc(var(--ju-hero-d) * 0.4066)', marginTop: 2, mixBlendMode: 'multiply' }}
            />
          </div>
        </div>

        {/* pill／主標／信任句：Figma Frame 1773，flex column gap 27 */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 27 }}>
          <span
            className="ju-sans lp-fade-up"
            style={{
              animationDelay: '0.3s',
              background: 'var(--ju-pill-bg)',
              border: '1px solid var(--ju-pill-border)',
              color: 'var(--ju-text)',
              padding: '14px 28px',
              borderRadius: 50,
              fontSize: 'clamp(16px, 1.67vw, 24px)',
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            5 年乙方與多元專案經驗
          </span>
          <h1
            className="ju-sans lp-fade-up"
            style={{ animationDelay: '0.45s', fontSize: 'clamp(40px, 4.44vw, 64px)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}
          >
            UX Designer
          </h1>
          <p
            className="ju-sans lp-fade-up"
            style={{ animationDelay: '0.6s', fontSize: 'clamp(20px, 2.22vw, 32px)', fontWeight: 700, margin: 0, lineHeight: 1.2 }}
          >
            信任，是體驗與記憶的接軌
          </p>
        </div>

        {/* 中央垂線導引：Figma y=613→796，距信任句 46px */}
        <div
          aria-hidden="true"
          style={{ position: 'relative', width: 1, height: 183, background: 'var(--ju-hairline)', margin: '46px auto 0' }}
        />
      </section>
```

**注意**：`UX Designer` 的 class 只有 `ju-sans`，**不要加 `ju-en`**。`.ju-en`（Hanken Grotesk）定義在 `.ju-sans` 之後會勝出，但 Figma 指定的是 Noto Sans TC Bold。

- [ ] **Step 3: 移除定位卡 section 的 paddingTop 覆寫**

現行第 2 個 section 有 `style={{ paddingTop: 'clamp(40px, 5vw, 64px)' }}`，會在 hero 之後多加留白、破壞 128px。改成：

```jsx
      <section className="lp-section" style={{ paddingTop: 0 }}>
```

- [ ] **Step 4: 量測第一屏露出幅度**

Run: `resize_window {width: 1440, height: 966}`

Run: `javascript_tool` →
```js
JSON.stringify({
  heroBottom: document.querySelector('.lp-hero').getBoundingClientRect().bottom,
  cardTop: document.querySelector('.lp-about').getBoundingClientRect().top,
  exposed: 966 - document.querySelector('.lp-about').getBoundingClientRect().top,
})
```
Expected: `exposed` ≈ **128**（±8px 內可接受；超出表示幾何算錯，回頭查 Step 1 的變數）

- [ ] **Step 5: 截圖比對**

Run: `computer {action: "screenshot"}`
與 Figma `266-175` 截圖並排回報：圓的位置、pill 與粒子雲的重疊、垂線、卡片露頭應一致。

- [ ] **Step 6: 回報並等待 commit 指示**

```bash
git add src/pages/LandingPage.jsx src/index.css
git commit -m "feat: Hero 排版對齊 Figma 266-175（pill 貼齊圓底，第一屏露出定位卡 128px）"
```

---

### Task 4: 區塊開場列改文法 + 移除 Figma 未採用的元素

**Files:**
- Modify: `src/pages/LandingPage.jsx`（`SectionHeader`、`WORK_SKILLS`、精選作品 section、AI section、收尾 section）

**Interfaces:**
- Produces: `SectionHeader({ zh, en })` — **移除 `action` prop**（Figma 無次要動作）

- [ ] **Step 1: 改寫 SectionHeader**

取代現行 `SectionHeader`（含註解）：

```jsx
/* 區塊開場列（Figma 266:253/266:256 文法）：英文小標在上、中文大標在下。
   v3.2 的 28×3 accent 短標記與右側次要動作在 Figma 已不存在，一併退場。 */
function SectionHeader({ zh, en }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {en && (
        <span className="ju-en" style={{ display: 'block', fontSize: 16, fontWeight: 400, color: 'var(--ju-text2)', letterSpacing: '0.02em', marginBottom: 8 }}>
          {en}
        </span>
      )}
      <h2 className="ju-sans" style={{ fontSize: 'clamp(26px, 3.6vw, 40px)', fontWeight: 700, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', textWrap: 'balance' }}>
        {zh}
      </h2>
    </div>
  );
}
```

- [ ] **Step 2: 移除精選作品的技能卡與「查看全部」**

刪除 `WORK_SKILLS` 常數（整段）。精選作品 section 改成：

```jsx
      {/* 3. 精選作品 */}
      <section className="lp-section">
        <div className="lp-container">
          <SectionHeader zh="精選作品" en="Selected works" />
          <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
            {SELECTED_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
          </div>
        </div>
      </section>
```

`SkillIcon` 的 `layers` / `chart` / `target` 三個 case 隨 `WORK_SKILLS` 一起刪除（AI 區只用 `collab` / `shield` / `flow`）。

- [ ] **Step 3: AI 區標題與英文小標改 Figma 文案**

```jsx
          <SectionHeader zh="AI 相關應用" en="Working with AI" />
```

- [ ] **Step 4: 收尾區改 Figma 文案**

取代現行第 5 個 section：

```jsx
      {/* 5. 全幅收尾段 → /works */}
      <section className="lp-section" style={{ paddingBottom: 140 }}>
        <div className="lp-container" style={{ borderTop: '1px solid var(--ju-border)', paddingTop: 'var(--ju-section-pad)', textAlign: 'center' }}>
          <p className="ju-sans" style={{ fontSize: 'clamp(28px, 4.44vw, 64px)', fontWeight: 700, margin: 0, lineHeight: 1.4, color: 'var(--ju-text)', textWrap: 'balance', letterSpacing: '-0.01em' }}>
            探索更多作品
          </p>
          <Link
            to="/works"
            className="ju-sans lp-cta"
            style={{ display: 'inline-block', marginTop: 36, background: 'var(--ju-accent)', color: 'var(--ju-on-accent)', padding: '15px 34px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'background .15s ease' }}
          >
            前往探索 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
```

- [ ] **Step 5: 驗證**

Run: `read_console_messages` → Expected: 零 error
Run: `read_page` → 確認「精選作品」下方直接是作品卡（無技能卡）、「AI 相關應用」標題正確、收尾為「探索更多作品」

- [ ] **Step 6: 回報並等待 commit 指示**

```bash
git add src/pages/LandingPage.jsx
git commit -m "feat: 區塊開場列改 Figma 文法（英文小標在上），移除稿上未採用的技能卡與次要動作"
```

---

### Task 5: 光暈元件

**Files:**
- Create: `src/components/Glow.jsx`
- Modify: `src/pages/LandingPage.jsx`（掛載 7 顆）
- Modify: `src/index.css`（`.lp-section` 加 `position: relative`）

**Interfaces:**
- Consumes: 濾鏡 id `ju-noise-0`；token `--ju-glow-1` / `--ju-glow-2` / `--ju-glow-3`
- Produces: `Glow({ size, align, top })`
  - `size`: `894 | 1038 | 844`（Figma 三種直徑）
  - `align`: `'left' | 'right' | 'center'`
  - `top`: CSS 長度字串，光暈**圓心**相對父容器頂端的位置

- [ ] **Step 1: 建立 Glow 元件**

Create `src/components/Glow.jsx`：

```jsx
/* 區塊光暈。正本 Figma 266:176-266:182。
   三種直徑（894 標題／1038 區段中段／844 收尾），共用同一組漸層；
   噴點質感與 Hero 圓同源（NoiseDefs 的 ju-noise-0，即 Figma 原 seed 3124）。
   全部靜態——7 顆光暈若都動，濾鏡成本會壓垮低階機器。

   Figma 是絕對座標（標題光暈圓心固定在 x=99）；網頁是流式排版，
   因此改成掛在區塊上、用 align 表達「壓左緣／靠右／置中」的關係。
   1440 基準：左 → 圓心 x=99；右 → 圓心 x≈1305-1363；中 → 圓心 x=720。 */

const ALIGN_X = {
  left:   'calc(99px - var(--glow-r))',        // 圓心壓在視窗左緣內 99px，大半溢出
  right:  'calc(100% - 135px - var(--glow-r))', // 1440-1305=135，圓心靠右緣內側
  center: 'calc(50% - var(--glow-r))',
};

export default function Glow({ size, align = 'left', top }) {
  /* 濾鏡把圖形向外推 100px，容器與 viewBox 都要留這個餘裕 */
  const box = size + 200;
  const r = size / 2;
  return (
    <div
      aria-hidden="true"
      style={{
        '--glow-r': `${r}px`,
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
            id={`ju-glow-${size}-${align}`}
            cx="0" cy="0" r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${box / 2} ${box / 2}) rotate(90) scale(${r})`}
          >
            <stop stopColor="var(--ju-glow-1)" stopOpacity="0.5" />
            <stop offset="0.493652" stopColor="var(--ju-glow-2)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--ju-glow-3)" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle
          cx={box / 2}
          cy={box / 2}
          r={r}
          fill={`url(#ju-glow-${size}-${align})`}
          fillOpacity="0.6"
          filter="url(#ju-noise-0)"
        />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: 讓區塊成為定位脈絡、內容浮在光暈上**

`src/index.css`：

```css
.lp-section { padding: var(--ju-section-pad) 24px 0; position: relative; }
/* 光暈刻意溢出區塊邊界，容器不得裁切 */
.lp-container { max-width: 1080px; margin: 0 auto; position: relative; z-index: 1; }
```

- [ ] **Step 3: 掛上 7 顆**

精選作品 section（`<div className="lp-container">` 之前插入第 1 顆，作品卡群外層插第 2 顆）：

```jsx
      {/* 3. 精選作品 */}
      <section className="lp-section">
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="60%" />
        <div className="lp-container">
```

AI 區：

```jsx
      <section className="lp-section">
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="65%" />
        <div className="lp-container">
```

專業證書區（Task 6 建立後補）：

```jsx
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="65%" />
```

收尾區：

```jsx
      <section className="lp-section" style={{ paddingBottom: 140 }}>
        <Glow size={844} align="center" top="50%" />
```

import：`import Glow from '../components/Glow.jsx';`

- [ ] **Step 4: 驗證光暈沒把內容推走、也沒吃掉點擊**

Run: `javascript_tool` →
```js
JSON.stringify({
  count: document.querySelectorAll('svg[viewBox^="0 0 1094"], svg[viewBox^="0 0 1238"], svg[viewBox^="0 0 1044"]').length,
  bodyScrollW: document.body.scrollWidth,
  clientW: document.documentElement.clientWidth,
})
```
Expected: `count` = **5**（精選 2 + AI 2 + 收尾 1；證書區的 2 顆在 Task 6 才掛，屆時應為 7）；**`bodyScrollW` 必須等於 `clientW`**（光暈溢出不得造成橫向捲動）

若 `bodyScrollW > clientW`：在 `.lp-section` 加 `overflow-x: clip`（**不是 `hidden`**——單軸 `hidden` 會讓另一軸隱含變成 `auto`，把區塊變成捲動容器；`clip` 只裁切、不建立捲動脈絡）。

Run: `computer {action: "screenshot"}` → 光暈應在標題左側、區段中段右側，質感與 hero 噴點同源

- [ ] **Step 5: 回報並等待 commit 指示**

```bash
git add src/components/Glow.jsx src/pages/LandingPage.jsx src/index.css
git commit -m "feat: 導入 Figma 區塊光暈（標題左／區段中段右／收尾置中，共 7 顆）"
```

---

### Task 6: 專業證書區

**Files:**
- Modify: `src/pages/LandingPage.jsx`（新增資料常數、`CourseCard`、`CourseNote`、區塊本體）
- Modify: `src/index.css`（`.lp-course` 斷點）

**Interfaces:**
- Consumes: `SectionHeader`、`Glow`
- Produces: `CourseCard({ title, desc })`、`CourseNote({ title, href })`

- [ ] **Step 1: 新增資料常數**

放在 `AI_SKILLS` 之後：

```jsx
/* 專業證書區（Figma 266:269 / 266:279 / 266:274）。
   文案取自 Figma 稿；課程卡圖片與 Medium 連結尚無素材，先留佔位。 */
const COURSES = [
  {
    title: 'Level 1｜金融科技產業地圖基礎課程',
    desc: '臺灣金融科技協會規劃推出 FinTech Academy 金融科技產業學院，以「金融科技產業地圖」為核心，從 AI、保險科技、區塊鏈與虛擬資產，到金融資安、詐欺防治與監理科技，金融業與科技業都需要更快掌握趨勢，理解監理方向，並了解技術如何真正落地到產業應用。',
  },
  {
    title: 'UBC｜UX Book Club Taiwan',
    desc: '為期半年的 Google UX 課程讀書會，並完成各階段執行項目，如使用者研究、wireframe、mockup、prototype 等相關設計知識學習與討論。',
  },
];

/* TODO：待她提供文章標題與 Medium 網址後替換 href 與 title */
const COURSE_NOTES = [
  { title: '課程心得名稱', href: '#' },
  { title: '課程心得名稱', href: '#' },
];
```

- [ ] **Step 2: 建立 CourseCard 與 CourseNote**

```jsx
/* 課程卡（Figma 1059×384）：左文右圖。圖片素材未到，先以次表面佔位。 */
function CourseCard({ title, desc }) {
  return (
    <div className="lp-course" style={{ display: 'grid', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'start', marginBottom: 'clamp(28px, 4vw, 40px)' }}>
      <div>
        <h3 className="ju-sans" style={{ fontSize: 'clamp(19px, 2.4vw, 24px)', fontWeight: 600, margin: 0, lineHeight: 1.5, textWrap: 'balance' }}>
          {title}
        </h3>
        <p className="ju-sans" style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--ju-text2)', margin: '20px 0 0' }}>
          {desc}
        </p>
      </div>
      <div
        aria-hidden="true"
        style={{ aspectRatio: '579 / 384', borderRadius: 20, background: 'var(--ju-surface)', border: '1px solid var(--ju-border)' }}
      />
    </div>
  );
}

/* 課程心得列（Figma 1059×105）：整列可點，連往 Medium。
   href 尚為佔位，暫不開新分頁；素材到位後改 target="_blank" + rel="noopener noreferrer"。 */
function CourseNote({ title, href }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      className="lp-flat"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        padding: '32px 28px', borderRadius: 16, textDecoration: 'none', color: 'inherit',
        borderColor: hov ? 'rgba(244, 243, 239, 0.32)' : undefined,
      }}
    >
      <span className="ju-sans" style={{ fontSize: 'clamp(17px, 2vw, 20px)', fontWeight: 600 }}>{title}</span>
      <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--ju-text)', whiteSpace: 'nowrap' }}>
        查看完整內容 <span aria-hidden="true">→</span>
      </span>
    </a>
  );
}
```

- [ ] **Step 3: 插入區塊本體（在 AI 區與收尾區之間）**

```jsx
      {/* 5. 專業證書 —— Figma 順序：課程卡 → 課程心得列表 → 課程卡 */}
      <section className="lp-section">
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="65%" />
        <div className="lp-container">
          <SectionHeader zh="專業證書" en="Courses" />
          <CourseCard {...COURSES[0]} />
          <div style={{ display: 'grid', gap: 12, margin: '0 0 clamp(28px, 4vw, 40px)' }}>
            {COURSE_NOTES.map((n, i) => <CourseNote key={i} {...n} />)}
          </div>
          <CourseCard {...COURSES[1]} />
        </div>
      </section>
```

- [ ] **Step 4: 加斷點**

`src/index.css`，與 `.lp-card` 同區：

```css
.lp-course { grid-template-columns: 432fr 579fr; }
@media (max-width: 860px) {
  .lp-course { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: 驗證**

Run: `read_console_messages` → Expected: 零 error
Run: `read_page` → 確認：「Courses / 專業證書」標題、兩張課程卡、兩列課程心得（皆為 `<a>`）、順序為 卡 → 列表 → 卡

- [ ] **Step 6: 回報並等待 commit 指示**

```bash
git add src/pages/LandingPage.jsx src/index.css
git commit -m "feat: 新增專業證書區（課程卡＋課程心得列表，圖片與 Medium 連結待補）"
```

---

### Task 7: Header logo 與 nav

**Files:**
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: 換 logo 與 nav 文案**

`src/components/Header.jsx` 的 `<Link to="/">` 與 `<nav>` 取代：

```jsx
      <Link to="/" aria-label="回首頁" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
        <img src="/logo.svg" alt="朱千慧" style={{ width: 30, height: 'auto', display: 'block' }} />
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link
          to="/works"
          className="ju-mono"
          style={{ fontSize: 12, letterSpacing: '0.16em', color: 'var(--ju-accent)', textDecoration: 'none', borderBottom: '1px solid var(--ju-accent)', paddingBottom: 2 }}
        >
          搜尋作品
        </Link>
      </nav>
```

`public/logo.svg` 的路徑 `fill="white"` 是純白，違反 No-Pure-Ink Rule。改檔案本身：

```bash
sed -i '' 's/fill="white"/fill="#F4F3EF"/' public/logo.svg
```

- [ ] **Step 2: 驗證**

Run: `javascript_tool` → `document.querySelector('header img').getBoundingClientRect().width`
Expected: `30`

Run: `read_page` → header 應有 `aria-label="回首頁"` 的連結與「搜尋作品」

- [ ] **Step 3: 回報並等待 commit 指示**

```bash
git add src/components/Header.jsx public/logo.svg
git commit -m "feat: Header 啟用新 logo 字標，nav 改「搜尋作品」"
```

---

### Task 8: RWD 與無障礙檢查

**Files:**
- Modify: `src/index.css`（視情況）
- Modify: `src/pages/LandingPage.jsx`（視情況）

- [ ] **Step 1: 375 寬檢查**

Run: `resize_window {width: 375, height: 812}`
Run: `javascript_tool` → `JSON.stringify({ scrollW: document.body.scrollWidth, clientW: document.documentElement.clientWidth })`
Expected: **兩者相等**（無橫向捲動）

Run: `computer {action: "screenshot"}` → hero 圓仍出血、字級收斂、卡片單欄、光暈不擋字

- [ ] **Step 2: 768 寬檢查**

Run: `resize_window {width: 768, height: 1024}`，同上量測 + 截圖。

AI 技能卡在此寬度**仍是三欄**（`.lp-skills` 的單欄斷點是 `@media (max-width: 719px)`），每張約 229px。使用者已裁決「桌機橫式、行動版依版面 RWD」——若截圖顯示 768 三欄過擠，在此加中間斷點（例如 `@media (max-width: 900px)` 兩欄）。`.lp-course` 的 860px 斷點在此寬度已生效，課程卡應為單欄。

- [ ] **Step 3: reduced-motion 檢查**

Run: `javascript_tool` →
```js
matchMedia('(prefers-reduced-motion: reduce)').matches
```

用 `resize_window` 無法切換此設定，改以 CSS 覆寫驗證：

Run: `javascript_tool` →
```js
const s = document.createElement('style');
s.textContent = '.lp-noise-layer{animation:none!important;opacity:0!important}.lp-noise-layer:first-child{opacity:1!important}';
document.head.appendChild(s);
JSON.stringify([...document.querySelectorAll('.lp-noise-layer')].map(el => getComputedStyle(el).opacity));
```
Expected: `["1","0","0","0"]` —— **圓必須仍然可見**（第一層留下）。這是 Task 2 Step 2 那條 media query 的實測。

- [ ] **Step 4: 對比與語意檢查**

Run: `read_page {filter: "interactive"}`
Expected: 所有可點元素皆為 `<a>` / `<button>`；logo 連結有 `aria-label`；裝飾性 SVG（`NoiseDefs`、`Glow`、`HeroCircle`）皆 `aria-hidden`

- [ ] **Step 5: 回報並等待 commit 指示**

```bash
git add src/index.css src/pages/LandingPage.jsx
git commit -m "fix: Landing RWD 收斂與 reduced-motion 保底"
```

---

### Task 9: 文件同步與最終 build

**Files:**
- Modify: `DESIGN.md`（9 處，見 spec 第十一節）
- Modify: `DECISIONS.md`（4 筆）

- [ ] **Step 1: 更新 DESIGN.md**

依 spec 第十一節的表逐項改。**兩處必須改寫敘述、不能只改數字**：

- §3「主標天花板 58px」→ 64px，且「拒絕巨字級嘶吼」的理由句要重寫（現在的天花板是 64，敘述不能自相矛盾）
- §7 Don't「用玻璃亮邊、光暈、漸層字（**無任何豁免**）」→ 光暈移出禁令，「無任何豁免」的措辭要改（漸層字禁令維持）

其餘：frontmatter `colors` 補 7 色、`handwriting` 改 Nothing You Could Do、`display` 改 64px + Noto Sans TC；§4 Flat Card 的「無光暈」改為卡片層仍無光暈但區塊層有；§5 開場列文法改英文小標在上；§6 Hero Circle 整段改寫（canvas 的聚集開場／流場漂移／半徑呼吸皆已不存在）；§7「技能卡三張是刻意的編列」改為僅 AI 區保留。

- [ ] **Step 2: 更新 DECISIONS.md**

四欄格式、最新在最上，日期 `2026-07-14`：

| 日期 | 決定了什麼 | 為什麼 | 放棄了什麼選項 |
|------|-----------|--------|----------------|
| 2026-07-14 | Figma 稿的純白 `#FFFFFF`／純黑 `#000000` 不照抄，換 `#F4F3EF`／`#141414` | No-Pure-Ink Rule 是 v3.2 地基；兩者在近黑底上的差異肉眼幾乎不可見，不值得為此破規 | 照抄 Figma 稿值 |
| 2026-07-14 | 主標天花板 58px → 64px | Figma 266:262 重新決定過的字級，不是疏漏 | 收在 58px 讓 Figma 稿讓步 |
| 2026-07-14 | Hero 粒子圓實作換底：canvas 逐點手繪 → SVG feTurbulence 濾鏡 | 該質感本來就是 Figma 用 feTurbulence 生成的，照抄參數是唯一能一致的路 | 維持 canvas 手繪；匯出 PNG 當靜態素材（會失去動態） |
| 2026-07-14 | 光暈解禁：全站導入 7 顆區塊光暈 | Figma 新稿以光暈承擔區塊層次；原禁令是 v3.2 扁平卡脈絡下的裁決 | 維持 v3.2「無光暈、無任何豁免」 |

- [ ] **Step 3: 跑完整 build**

Run: `npm run build`
Expected: 零錯誤（需 `.env` 的 `NOTION_API_KEY` / `NOTION_DATABASE_ID`；缺 `.env` 時 `fetch-content.js` 會 `process.exit(1)`，此時回報使用者而非跳過）

- [ ] **Step 4: 確認無殘留簽章網址**

Run: `grep -rl "X-Amz" public/content/ ; echo "(無輸出=通過)"`
Expected: 無輸出

- [ ] **Step 5: 確認無純白純黑寫死**

Run: `grep -rn "#FFFFFF\|#ffffff\|#000000\|: *white\|fill=\"white\"" src/ public/logo.svg`
Expected: 無命中（`mixBlendMode` 等非顏色用途除外）

- [ ] **Step 6: 回報並等待 commit 指示**

```bash
git add DESIGN.md DECISIONS.md
git commit -m "docs: DESIGN.md 同步 v3.3（光暈解禁、主標 64px、Hero 換 SVG 濾鏡），DECISIONS.md 記四筆"
```

---

## 驗收對照（spec 第九節）

| # | 標準 | 由哪個 Task 驗 |
|---|------|---------------|
| 1 | build 零錯誤、console 零錯誤 | Task 9 Step 3；各 Task 的 `read_console_messages` |
| 2 | 1440×966 下卡片露出 ≈128px | **Task 3 Step 4**（`javascript_tool` 量測） |
| 3 | Hero 圓質感過關 | **Task 2 Step 5**（使用者確認關卡） |
| 4 | 7 顆光暈位置符合規律 | Task 5 Step 4 + Task 6 |
| 5 | 粒子動態不掉幀 | Task 2（濾鏡只算一次，非逐幀） |
| 6 | reduced-motion 全關且版面不破 | **Task 8 Step 3** |
| 7 | 無寫死色碼、無純白純黑 | Task 9 Step 5 |
| 8 | 375 版面不破、hero 圓出血 | Task 8 Step 1 |
| 9 | 內頁／瀑布流／標籤搜尋不受影響 | Task 9 Step 3（build）+ 手動走訪 |
| 10 | DESIGN.md 與 DECISIONS.md 同步 | Task 9 |

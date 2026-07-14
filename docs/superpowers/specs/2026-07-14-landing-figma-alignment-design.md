# Landing Page 對齊 Figma 設計規格（v3.3）

- 日期：2026-07-14
- Figma 正本：`rVJ3rGeqTQG0wCXcCbHl4f`
  - `255-2`：完整長版面（1440×7747）
  - `266-175`：第一屏 Hero（1440×966，用來定義「捲動前該看到什麼」）
- 現行狀態：`feat/green-load-bearing` 分支的 v3.2「灰階畫布」
- 基準視窗：1440px（Figma 只畫了桌機版，行動版由本規格推導）

## 一、這次要達成什麼

1. Hero 排版與 Figma **完全一致**，且第一屏必須露出 What make me different 卡片頂緣。
2. Hero 圓形裝飾用 Figma 的實際參數重繪，含上下浮動與邊緣粒子的雜訊動態感。
3. 全站導入光暈（各區塊標題 + 區段中段），參數照抄 Figma。
4. 新增「專業證書／Courses」區塊。
5. 啟用 `public/logo.svg`。
6. 其他區塊依 Figma 版面示意調整。

## 二、關鍵技術發現

Figma 的「噴點粒子」質感**不是點陣圖，是 SVG 濾鏡**。Hero 圓與全部 7 顆光暈共用同一組 texture 濾鏡：

```xml
<feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" seed="3124" />
<feDisplacementMap in="shape" scale="200" xChannelSelector="R" yChannelSelector="G" />
```

`scale=200` 讓每個圓的 bounding box 向外擴 100px（各邊）。這個位移不只打散邊緣，也擾動整個圓的輪廓——這就是截圖裡圓看起來是「噴散的雲」而不是「模糊的圓」的原因。

**因此現行 `HeroCircle.jsx` 的 canvas 逐點手繪實作整個退場**，改用瀏覽器原生 SVG 濾鏡。

### 已知風險：無法保證像素級一致

`feTurbulence` 的輸出由渲染引擎決定，不只由參數決定。Figma 用自有引擎，瀏覽器用 Skia/WebKit。同樣的 `seed=3124` 與 `baseFrequency=0.2`，顆粒分布**很可能不會逐點相同**——質感會極接近（同種噪聲、同尺度、同位移量），但不是複製。

**驗證關卡**：實作第一步先只做 Hero 圓，截圖與 Figma 並排給使用者確認質感過關，才往下做。若質感不可接受，退路是把 Figma 的圓匯出 PNG 當靜態素材——但那會失去雜訊動態感。

## 三、Hero 規格（1440 基準，座標相對 hero section 頂端）

| 元素 | Figma 節點 | 規格 |
|------|-----------|------|
| 圓形裝飾 | 266:183 | 964×964，圓心 (709, −84)、r=482。容器 top = −566（＝ −0.587×D） |
| 圓漸層 | | `radialGradient`：`#D3D3D3` @0% → `#D3D3D3` @82.69% → `#F4F3EF` opacity 30% @100% |
| 手寫招呼 | 266:184 | `Hi, I'm Cindy Ju`，**Nothing You Could Do** Regular 20px，`#141414`，x=647 y=97 |
| 真跡簽名 | 266:185 | `public/signature.png`，x=524 y=97，392×252（水平置中於 x=720） |
| pill 徽章 | 266:260 | 底 `#2E2E2E`、邊 1px `#4C4C4C`、radius 50px、padding 14px/28px；文字 **Noto Sans TC Regular 24px** `#F4F3EF` |
| 主標 | 266:262 | `UX Designer`，**Noto Sans TC Bold 64px**，`#F4F3EF`，置中 |
| 信任句 | 266:263 | `信任，是體驗與記憶的接軌`，Noto Sans TC Bold 32px，`#F4F3EF`，置中 |
| 垂線 | 266:186 | x=720，y=613→796（高 183），1px `#B8B8B8` |
| 下一區塊 | 266:187 | What make me different 卡 y=838 → **第一屏（966）露出 128px** |

`Frame 1773`（pill／主標／信任句）：x=422 y=341，596×226，flex column、`gap: 27px`、水平置中。

### 對 Figma 的刻意偏離（經使用者裁決）

Figma 稿在三處用了純白／純黑，違反 DESIGN.md §2 的 **The No-Pure-Ink Rule**（「不用純白 `#FFFFFF` 與純黑 `#000000`，最亮 `#F4F3EF`、最深 `#0C0C0C`」）。**守規則，不照抄**——兩者在近黑底上的差異肉眼幾乎不可見，不值得為此破 v3.2 的地基：

| Figma 值 | 實作值 | 位置 |
|----------|--------|------|
| `#FFFFFF` | `#F4F3EF`（`--ju-text`） | pill 文字、UX Designer、信任句 |
| `#000000` | `#141414`（`--ju-on-accent`） | 手寫招呼 |
| `white` @30% | `#F4F3EF` @30% | Hero 圓漸層末端 |

pill 字體 Figma 標 `Inter`，但 Inter 無中文字符，稿上「5 年乙方與多元專案經驗」實際 fallback 到系統字體——**實作用 Noto Sans TC Regular**，與全站一致。

### 為什麼現行差了 193px

Figma 的 pill 在 y=341–398，而圓底在 y=398——**pill 是疊在粒子雲下緣上的**。現行把 pill 排在圓容器之後、還加了 40px gap，整條垂直動線被往下推，卡片落到 y≈1031，第一屏什麼都露不出來。

**修正**：圓容器改絕對定位（脫離文檔流），pill 組與垂線依 Figma 座標排列。

### 與現行的字級落差（全部改成 Figma 值）

| 元素 | 現行 | Figma |
|------|------|-------|
| pill | `clamp(14px, 1.6vw, 16px)` | 24px |
| UX Designer | `clamp(40px, 5.8vw, 58px)`，Hanken Grotesk | 64px，Noto Sans TC Bold |
| 信任句 | `clamp(17px, 2vw, 22px)` | 32px |
| 手寫招呼 | Caveat | Nothing You Could Do |
| 垂線 | `rgba(244,243,239,0.35)` | `#B8B8B8`（≈74% 白） |

`UX Designer` 現行掛 `ju-sans ju-en` 兩個 class，`.ju-en`（Hanken Grotesk）後定義因而勝出。Figma 用 Noto Sans TC Bold，**須移除 `ju-en`**。

## 四、粒子動態規格

三種動態並存，全部走 CSS，不用 JS 逐幀：

1. **圓整體上下浮動**：沿用現行 `.lp-float`（`transform: translateY`，7s ease-in-out infinite）。transform 不觸發濾鏡重算，成本趨近於零。
2. **粒子雜訊躁動**：預先產生 **4 個不同 seed** 的濾鏡（例如 3124／4218／5307／6491），4 層圓疊放，用 CSS animation 輪流 `opacity` 交替。濾鏡各只算一次，之後純合成。
3. **開場**：圓與簽名 fade-in（沿用現行 `.lp-fade-up` 的節奏）。

**可控參數**（集中成 CSS 變數或元件 props）：

| 參數 | 預設 | 說明 |
|------|------|------|
| `seedCount` | 4 | 交替的 seed 張數，越多越隨機、成本越高 |
| `noiseInterval` | 0.6s | 每張 seed 的停留時間 |
| `floatAmplitude` | 依現行 | 上下浮動幅度 |
| `floatDuration` | 7s | 浮動週期 |
| `baseFrequency` | 0.2 | 噪聲尺度（Figma 值，改動即偏離設計） |
| `displacementScale` | 200 | 位移強度（Figma 值，改動即偏離設計） |

`prefers-reduced-motion`：關閉浮動與 seed 交替，只留單張靜態濾鏡。沿用 `src/lib/masonry.js` 的 `prefersReducedMotion`。

## 五、光暈規格

7 顆，全部**靜態**（濾鏡只算一次，無動畫）。三種尺寸共用同一漸層：

```
radialGradient: #D9D9D9 opacity 50% @0%
              → #A7A7A7 opacity 30% @49.37%
              → #737373 opacity 10% @100%
整體 fill-opacity: 60%
```

Hero 圓的漸層與光暈**不同**，勿共用。

| 節點 | 直徑 | Figma 圓心 | 角色 |
|------|------|-----------|------|
| 266:180 | 894 | (99, 1661) | 精選作品標題，左 |
| 266:176 | 1038 | (1363, 2400) | 精選作品區中段，右 |
| 266:181 | 894 | (99, 3203) | AI 相關應用標題，左 |
| 266:177 | 1038 | (1305, 4569) | AI 作品區中段，右 |
| 266:182 | 894 | (99, 5348) | 專業證書標題，左 |
| 266:178 | 1038 | (1305, 6460) | 課程區中段，右 |
| 266:179 | 844 | (720, 7144) | 探索更多作品，置中 |

**規律**：標題光暈一律 894、圓心壓在 x=99（大半溢出視窗左緣）、y 對齊標題；區段中段光暈一律 1038、靠右；收尾 844、置中。左右交錯。

### 實作方式（依 Figma 意圖推導，非照抄座標）

Figma 是絕對座標，網頁是流式排版。光暈**掛在區塊上**、不用絕對 y：

- 標題光暈 → 掛在 `SectionHeader`，`position: absolute`，圓心對齊標題垂直中心，`left: calc(99px - 447px)`（依視窗換算）
- 中段光暈 → 掛在作品卡群容器，圓心靠右
- 收尾光暈 → 掛在收尾區，置中

各區塊需 `position: relative` + `overflow` 不裁切（光暈刻意溢出）。光暈層 `z-index` 在內容之下、`pointer-events: none`、`aria-hidden`。

行動版：尺寸等比縮至視窗寬度，維持「標題左／中段右」的關係。

## 六、Design Token 新增

AGENTS.md 鐵則 5 禁止寫死色碼。Figma 帶進的新色值須進 `src/styles/tokens.css`：

| Token | 值 | 用途 |
|-------|-----|------|
| `--ju-hero-disc` | `#D3D3D3` | Hero 圓漸層主色 |
| `--ju-pill-bg` | `#2E2E2E` | Hero pill 底 |
| `--ju-pill-border` | `#4C4C4C` | Hero pill 邊 |
| `--ju-hairline` | `#B8B8B8` | Hero 垂線 |
| `--ju-glow-1` | `#D9D9D9` | 光暈漸層 0% |
| `--ju-glow-2` | `#A7A7A7` | 光暈漸層 49.37% |
| `--ju-glow-3` | `#737373` | 光暈漸層 100% |

全部零彩度，不違反 v3.2 的灰階原則。

字體新增：`Nothing You Could Do`（Google Fonts）。`Caveat` 若無其他用途則移除，避免多載一支字體。

## 七、其他區塊調整

### 區塊順序（依 Figma）

1. Hero
2. What make me different
3. Selected works／精選作品 → 作品卡 ×3
4. Working with AI／**AI 相關應用** → 技能卡 ×3 → AI 作品卡 ×3
5. Courses／**專業證書** → 課程卡（金融科技）→ 課程心得列表 ×2 → 課程卡（UBC）
6. 探索更多作品 → 前往探索 →

### 逐項變更

| 項目 | 變更 |
|------|------|
| SectionHeader | 改為**英文小標在上、中文大標在下**；移除左側 28×3 accent 短標記 |
| 精選作品技能卡 | **移除**（梳理複雜資訊／資料分析詮釋／制定專案策略三張，Figma 無此設計） |
| 精選作品「查看全部 →」 | **移除**（Figma 無） |
| AI 專區 | 標題文案改「**AI 相關應用**」 |
| AI 技能卡 | **桌機維持現行橫式**（Figma 的 319×371 空矩形只是佔位）；行動版依版面 RWD 收斂 |
| 收尾區 | 移除「MORE WORKS · 完整 12 篇」與「依主題瀏覽完整作品集」；改為「**探索更多作品**」＋ CTA「**前往探索 →**」 |
| Header logo | 文字「Ju」改用 `public/logo.svg`（39×37 字標） |
| Header nav | 「作品」改「**搜尋作品**」（連結維持 `/works`） |
| 人像 | 沿用 `public/portrait.png`，尺寸依 Figma 的 251×251 圓形裁切 |

### 專業證書／Courses 區（新建）

Figma 結構（`266:269` / `266:279` / `266:274`）：

1. **課程卡**（1059×384）：左側 432px 文字（標題＋說明）、右側 579×384 圖片
   - 已有文案：`Level 1｜金融科技產業地圖基礎課程`
2. **課程心得列表**（1059×210）：2 列，每列 1059×105，左「課程心得名稱」、右「查看完整內容 →」
   - 連結指向 Medium。**目前無網址** → `href="#"` 並標 `TODO`，待使用者提供標題與網址
3. **課程卡**（1059×384）：同格式
   - 已有文案：`UBC｜UX Book Club Taiwan`

課程卡的圖片目前無素材 → 留佔位（`--ju-surface` 底），比照現行 `Portrait` 的 `onError` fallback 模式。

「專業證書」本身尚無資料，本次只建結構。

## 八、RWD 策略

Figma 只有 1440。以下為推導：

- **Hero 圓**：直徑 `D = clamp(420px, 67vw, 964px)`（1440 時 = 964）。容器 `margin-top: -0.587 × D`，維持「圓心在視窗上方外、露出 0.413×D」的比例
- **Hero 字級**：64px／32px／24px 為 1440 上限，向下用 `clamp()` 收斂，但**須確保第一屏仍露出卡片頂緣**（這是硬需求，收斂後要實測）
- **光暈**：等比縮至視窗寬度
- **AI 技能卡**：桌機三欄橫式；窄視窗單欄
- **作品卡**：沿用現行 `.lp-card` 斷點

## 九、驗收標準

1. `npm run build` 零錯誤、瀏覽器 console 零錯誤
2. **1440×966 視窗下，What make me different 卡片頂緣露出 ≈128px**
3. Hero 圓截圖與 Figma 並排比對，質感過關（使用者確認）
4. 7 顆光暈位置符合「標題左／中段右／收尾中」的規律
5. 粒子動態在低階機器不掉幀（濾鏡不逐幀重算）
6. `prefers-reduced-motion` 下動態全關、版面不破
7. 無寫死色碼，全走 `var(--ju-*)`；**無 `#FFFFFF` 與 `#000000`**（No-Pure-Ink Rule）
8. 行動版（375）版面不破、hero 圓仍出血
9. 現有作品內頁、瀑布流、標籤搜尋不受影響
10. **`DESIGN.md` 已依第十一節同步，`DECISIONS.md` 已記四筆決策**

## 十、待補資料

| 項目 | 狀態 |
|------|------|
| 課程心得標題與 Medium 網址 | 待使用者提供，先用假資料 |
| 課程卡圖片（579×384 ×2） | 待使用者提供，先留佔位 |
| 專業證書內容 | 尚無，本次只建結構 |

## 十一、文件同步（不可省略）

本規格推翻 DESIGN.md 的多條明文規則。**DESIGN.md 是設計系統正本，不更新它，下一個接手的人會照著它把這些全部改回去。**

### `DESIGN.md` 須更新的段落

| 段落 | 現行內容 | 改成 |
|------|---------|------|
| §2 Colors 色階表 | 只列到 `#1F1F1F` | 補 `#2E2E2E`／`#4C4C4C`／`#B8B8B8`／`#D3D3D3`／`#D9D9D9`／`#A7A7A7`／`#737373`（全純灰，零彩度不變） |
| §3 Typography | 「主標天花板 58px」 | 改 **64px**；「拒絕巨字級嘶吼」的敘述須一併改寫，不能只改數字 |
| §3 / frontmatter `handwriting` | `Caveat（英）` | `Nothing You Could Do（英）` |
| §3 Display | `clamp(40px, 5.8vw, 58px)`、Hanken Grotesk | 64px 上限、**Noto Sans TC Bold**（移除 `.ju-en`） |
| §4 The Flat Card | 「無玻璃亮邊、**無光暈**、無預設陰影」 | 光暈解禁：卡片本身仍無光暈，但區塊層有光暈 |
| §5 Layout | 區塊開場列文法「左『28×3 標記＋標題（＋小號英文）』」 | 英文小標在上、中文大標在下；移除 28×3 標記 |
| §6 Hero Circle | 「純 canvas 零相依（`HeroCircle.jsx`）」 | SVG feTurbulence 濾鏡；描述改寫（聚集開場／流場漂移／半徑呼吸皆不再適用） |
| §7 Don't | 「用玻璃亮邊、**光暈**、漸層字（**無任何豁免**）」 | 光暈移出禁令（漸層字禁令維持）；「主標超過 58px」改 64px |
| §7 Don't | 「技能卡三張是刻意的編列」 | 僅 AI 區保留技能卡；精選作品區已移除 |

### `DECISIONS.md` 須記的決策（四欄格式，最新在最上）

1. **光暈解禁**：v3.2 明訂「無光暈、無任何豁免」，本次全站導入 7 顆光暈
2. **Hero 實作換底**：canvas 逐點手繪 → SVG feTurbulence 濾鏡
3. **主標天花板 58px → 64px**
4. **No-Pure-Ink Rule 維持**：Figma 稿的純白／純黑不照抄，換成 `#F4F3EF`／`#141414`

### 未動搖的地基

- **零彩度**：新增 7 色全為純灰（R=G=B），無任何色相
- **No-Pure-Ink**：維持，見「對 Figma 的刻意偏離」
- **無漸層字**、**無 01/02/03 編號鷹架**、**無 mono eyebrow**、**無 `border-left` 側條**
- **極簡相依**：SVG 濾鏡零相依，runtime 仍只有 react／react-dom／react-router-dom

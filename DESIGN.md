---
name: Armonia v3.2 — 朱千慧作品集
description: 灰階畫布：全站零彩度的近黑連續畫布，質感（噴點粒子圓、手寫簽名、攝影）當主角的個人作品集設計系統
colors:
  base: "#0C0C0C"
  surface: "#141414"
  card: "#181818"
  card-inner: "#1F1F1F"
  text: "#F4F3EF"
  text-2: "rgba(244, 243, 239, 0.64)"
  text-3: "rgba(244, 243, 239, 0.45)"
  accent: "#F4F3EF"
  on-accent: "#141414"
  border: "rgba(244, 243, 239, 0.1)"
  border-card: "rgba(244, 243, 239, 0.14)"
  error: "#C4705F"
  paper-panel-bg: "#EEEBE1"
  paper-panel-ink: "#23231D"
typography:
  display:
    fontFamily: "Hanken Grotesk, Noto Sans TC, sans-serif"
    fontSize: "clamp(40px, 5.8vw, 58px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "clamp(26px, 3.6vw, 40px)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "clamp(19px, 2.4vw, 24px)"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  card-title:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.95
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "normal"
  reading-serif:
    fontFamily: "Noto Serif TC, serif"
    fontSize: "22–28px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  handwriting:
    fontFamily: "Caveat（英）/ LXGW WenKai TC（中，佔位，待真跡檔）"
    fontSize: "clamp(20px, 2.8vw, 30px) / clamp(38px, 5.6vw, 58px)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  label:
    fontFamily: "Space Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "12px"
  card: "16px"
  lg: "20px"
  panel: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  section: "clamp(80px, 10vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "15px 34px"
  flat-card:
    backgroundColor: "{colors.card}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.card}–{rounded.panel}"
    padding: "24px（技能卡）/ clamp(28px, 5vw, 56px)（定位卡）"
  chip-filter-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  paper-panel:
    backgroundColor: "{colors.paper-panel-bg}"
    textColor: "{colors.paper-panel-ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(24px, 5vw, 56px)"
---

# Design System: Armonia v3.2 — 朱千慧作品集

## 1. Overview

**Creative North Star: "灰階畫布 (The Grayscale Canvas)"**

朱千慧是跨領域 UX 設計師，專長是「在看似不相關的事物之間找出底層結構，把混亂資料轉譯成可被執行的框架」。v3.2 把這件事做成一張畫：**全站零彩度**——一條從近黑 `#0C0C0C` 到近白 `#F4F3EF` 的明度軸，沒有任何色相。層次、強調、互動狀態，全部靠明度與材質說話。

沒有顏色，記憶點由**質感**承擔：hero 的白噴點粒子圓（聚集、融合、串連的動態敘事）、圓上的**手寫簽名**（人的痕跡）、定位卡裡的**攝影人像**（真實的臉）。這三樣東西在灰階畫布上的份量，比任何品牌色都重。

v3.2 同時**明確拒絕**：拒絕主流深色作品集的灰字壓黑底（次要文字刻意亮一截、正文永遠近白）；拒絕色塊帶切斷畫布（單一底色從頭流到尾）；拒絕玻璃亮邊卡（卡片一律安靜的扁平深色面）；拒絕巨字級嘶吼（主標頂 58px）；拒絕裝飾性字體混用（無襯線一聲到底，襯線只活在內頁閱讀面板裡）。

**Key Characteristics:**
- 全站零彩度：近黑畫布＋近白文字，不用純白 `#FFFFFF` 與純黑 `#000000`；唯一狀態色是磚紅 error。
- 質感三主角：白噴點粒子圓、手寫簽名、攝影人像。
- 連續畫布：單一底色、統一 1080px 容器、垂直導引線脊椎、統一區塊間距階。
- 無襯線一聲到底；襯線只留作品內頁 Notion 內文；mono 只當座標 meta；手寫只當簽名。
- 內頁 Notion 長文住在淺紙面板（`.ju-light` 作用域）——深色書房裡的一張紙。

## 2. Colors

一條近黑↔近白的明度軸，沒有色相。

### Neutral（全部）
- **近黑 Base** (`#0C0C0C`)：頁面基底，整站唯一底色。
- **次表面 Surface** (`#141414`)：chip 底、輸入框底、縮圖佔位。
- **卡面 Card** (`#181818`)：扁平深色卡的面。
- **內層 Card Inner** (`#1F1F1F`)：卡中卡、佔位圓。
- **近白 Text / Accent** (`#F4F3EF`)：主要文字（對近黑約 17:1）；無彩系統中「強調」就是近白——連結、選中態、CTA 實心面。
- **次文字 Text-2** (`rgba(244,243,239,0.64)`)：卡片內文、meta，約 6.8:1。**刻意比深色模板慣用的灰亮一截。**
- **弱文字 Text-3** (`rgba(244,243,239,0.45)`)：約 4.5:1，只用於 mono 微標籤，永不用於正文。
- **邊線** (`rgba(244,243,239,0.1)`)／**卡邊** (`rgba(244,243,239,0.14)`)；hover 提亮至約 0.32。
- **On-Accent** (`#141414`)：近白實心面（CTA、選中 chip）上的文字；也是白圓盤上簽名的墨色。

### Paper Panel（內頁閱讀面板）
- 淺紙 `#EEEBE1`＋墨 `#23231D`，整套淺色值活在 `.ju-light` 作用域；面板內 accent 是墨色。

### Status
- **磚紅 Error** (`#C4705F`)：唯一帶色相的例外，只給錯誤狀態，用量極省。

### Named Rules
**The Zero-Chroma Rule（零彩度）.** 全站不得出現任何色相（error 除外）。UI 元件、文字、邊框、圖示、特效一律灰階。想強調，用明度、字重、尺寸、材質——不用顏色。

**The No-Pure-Ink Rule（不用純黑白）.** 最亮 `#F4F3EF`、最深 `#0C0C0C`。

**The Bright-Gray Rule（灰字底線）.** 正文近白；Text-2 給卡片內文與 meta（≥6.8:1）；Text-3 只給 mono 標籤（≥4.5:1）。灰字壓黑底是頭號禁忌。

## 3. Typography

**唯一主聲：** Noto Sans TC（中）＋ Hanken Grotesk（英文大字）
**閱讀襯線：** Noto Serif TC——**只存在於作品內頁的 Notion 內文**（`.ju-light` 面板內的標題層級）
**座標 meta：** Space Mono
**手寫簽名：** Caveat（英）＋ LXGW WenKai TC（中）——佔位字型，待換她提供的真跡檔

**Character:** 無襯線一聲到底。層次不靠換字體，靠字級差、字重差、明度差。中等字級＋大留白，主標天花板 58px。

### Hierarchy
- **Display**（Hanken 700, `clamp(40px, 5.8vw, 58px)`, lh 1.2）：hero 主標「UX Designer」。
- **Headline**（Noto Sans TC 700, `clamp(26px, 3.6vw, 40px)`, lh 1.3）：區塊開場列標題。
- **Title**（Noto Sans TC 600, `clamp(19px, 2.4vw, 24px)`, lh 1.5）：作品卡標題。
- **Card-title**（18px / 600, 近白滿對比）：技能卡標題——與內文拉開 3px 字級差＋明度差，掃讀先抓到它。
- **Body**（16px, lh 1.95）：長段正文。**Body-sm**（15px, lh 1.85, Text-2）：卡片內文、描述。
- **Handwriting**：只用於 hero 圓內簽名，不得挪作它用。
- **Label**（Space Mono 11px, 寬字距）：座標 meta（客戶｜專案名）、kicker。

### Named Rules
**The One-Voice Rule（一聲到底）.** 全站 UI 只有無襯線一種聲音；襯線是「閱讀模式」的專屬材質，只出現在內頁淺紙面板的 Notion 內文；手寫只當簽名；mono 只當 meta。第四種用途出現前，先回來改這份文件。

**The 3px Rule（卡片主次）.** 卡片內標題與內文至少拉開 3px 字級差＋一階明度差（近白 vs Text-2），讓掃讀者先抓到標題。

**漸層文字全面禁用。**（v3 的「信任」掃光豁免已廢止。）

## 4. Material & Elevation

### The Flat Card（扁平深色卡）
全站唯一卡材質：`#181818` 面＋1px `rgba(244,243,239,0.1)` 細邊，**無玻璃亮邊、無光暈、無預設陰影**。hover：邊線提亮至 0.32＋`translateY(-4px)`。用於技能卡（radius 16）、作品卡（radius 20）、定位卡（radius 24）。

### Header 例外
固定 header 維持半透明近黑＋`blur(12px)`——功能性（浮在粒子圓上保導覽可讀），是全站唯一的模糊材質。

## 5. Layout — The Continuous Canvas（連續畫布）

- 單一底色、禁止色塊帶；區塊間距一律 `--ju-section-pad`（`clamp(80px, 10vw, 128px)`）。
- 內容容器統一 1080px；兩條垂直導引線（`.lp-rail`）全頁貫穿，<1160px 隱藏。
- 區塊開場列文法：左「28×3 標記＋標題（＋小號英文）」、右側可掛次要動作。
- **Hero（v3.2 版式）**：白噴點粒子圓置頂（頂部出血、滑進 header 下）→ 圓內手寫簽名 → pill 經歷徽章 → 「UX Designer」→ 中央垂線導引垂入定位卡。全部置中。
- **定位卡**：桌機左文右圓形人像（`1fr : clamp(220px, 30%, 320px)`），行動版直疊。
- 收尾：全幅收尾段（hairline＋mono kicker＋大字＋近白 pill CTA）。

## 6. Components

### Signature — Hero Circle（噴點粒子圓）
系統的招牌：hero 置頂的白色粒子圓盤。聚集開場（粒子從四散匯聚成圓，約 1.5s）→ 常態圓內流場漂移、觸邊沿法線滑回、半徑呼吸 ±1.5%；約一成粒子住在圓緣噴灑帶。圓上疊深色手寫簽名（等圓盤亮起才進場）。reduced-motion 畫靜態噴點圓盤。純 canvas 零相依（`HeroCircle.jsx`）。

### Buttons
- **Primary（近白 pill）**：`#F4F3EF` 底＋近黑字；hover 降至 `#E5E4DE`；active `scale(0.97)`。
- **Ghost**：透明底＋近白字＋細邊 pill。
- **Focus**：近白外環 `0 0 0 2px var(--ju-base), 0 0 0 4px var(--ju-accent)`。

### Chips
- **Filter chip**：次表面底＋近白字；selected → 近白實心＋近黑字。

### Paper Panel（內頁閱讀面板）
`.ju-light` 作用域：淺紙圓角面板承載 Notion 長文，內部整套 token 切回淺色（accent＝墨、標題襯線保留）。全站唯一的淺色面與唯一的襯線棲地。

### Portrait（人像）
定位卡右側圓形攝影人像（`public/portrait.jpg`，檔案就位即自動生效；缺檔時顯示中性佔位圓）。

## 7. Do's and Don'ts

### Do:
- **Do** 守住零彩度：強調靠明度、字重、尺寸、材質。
- **Do** 卡片一律扁平深色面；標題與內文守 3px 規則。
- **Do** 無襯線一聲到底；襯線只留內頁 Notion 內文；手寫只當簽名。
- **Do** 每個區塊用同一套開場列文法；間距一律 `--ju-section-pad`。
- **Do** 動畫尊重 `prefers-reduced-motion`；canvas 離開視窗即暫停。
- **Do** 保持極簡相依（runtime 只有 react / react-dom / react-router-dom）。

### Don't:
- **Don't** 引入任何色相（error 除外）；不用純白純黑。
- **Don't** 用玻璃亮邊、光暈、漸層字（無任何豁免）。
- **Don't** 用滿版色塊帶切斷畫布；不把正文調灰。
- **Don't** 在 UI 使用襯線或手寫字型（各自只有一個棲地）。
- **Don't** 主標超過 58px；不排一整牆同尺寸同結構的卡片牆（技能卡三張是刻意的編列，卡內有 icon 沉底的節奏）。
- **Don't** 用 01/02/03 編號或 mono eyebrow 當區塊鷹架；`border-left` 彩色側條禁止。

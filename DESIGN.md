---
name: Armonia — 朱千慧作品集
description: 有紀律的溫度：暖紙基底、單一深森林綠撐起整面的個人作品集設計系統
colors:
  forest: "#35431F"
  forest-deep: "#2A3518"
  forest-active: "#1F2912"
  lime: "#C9D89B"
  paper: "#D9D5C7"
  surface: "#E6E2D5"
  card: "#EEEBE1"
  card-inner: "#F4F1E8"
  ink: "#23231D"
  ink-2: "#6E6E62"
  ink-3: "#8A8A7C"
  on-forest: "#EEEBE1"
  on-forest-2: "#C9D89B"
  error: "#A6483A"
typography:
  display:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "clamp(32px, 6vw, 56px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  display-serif:
    fontFamily: "Noto Serif TC, serif"
    fontSize: "clamp(22px, 4vw, 34px)"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  headline:
    fontFamily: "Noto Serif TC, serif"
    fontSize: "clamp(22px, 3.4vw, 28px)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: "Noto Serif TC, serif"
    fontSize: "clamp(18px, 2.6vw, 22px)"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "normal"
  body:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.95
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Space Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.08em"
  caption:
    fontFamily: "Space Mono, monospace"
    fontSize: "10.5px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.14em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "14px 30px"
  button-primary-hover:
    backgroundColor: "{colors.forest-deep}"
    textColor: "{colors.on-forest}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "42px"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 11px"
    height: "28px"
  chip-filter-selected:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
  chip-tag:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 11px"
    height: "28px"
  card-work:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(20px, 3vw, 32px)"
  panel-forest:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-forest}"
    rounded: "{rounded.lg}"
    padding: "clamp(40px, 7vw, 88px)"
---

# Design System: Armonia — 朱千慧作品集

## 1. Overview

**Creative North Star: "有紀律的溫度 (Disciplined Warmth)"**

Armonia 是一位跨領域 UX 設計師的個人作品集。它的靈魂坐落在兩極之間：暖米紙的**溫度**，與深森林綠 + 4px 間距階的**紀律**。這正是主人的專業自述——「在看似不相關的事物之間找出底層結構，把混亂資料轉譯成可被執行的框架」。設計語言必須同時說出這兩件事：夠溫暖，讓人願意閱讀；夠有紀律，讓人相信這雙手能收拾複雜。

系統的密度是**克制而自信**的。不用純白、不用純黑；一切文字與面材都在一條暖灰↔墨黑的窄帶上呼吸。唯一的高彩度是那抹森林綠——而它的用法是這套系統升級的關鍵：**綠色不是點綴，是承重牆**。它要能整段撐起一個滿版背景（宣言、收尾），紙色文字反白其上，形成「紙→綠→紙」的戲劇節奏。把綠色降級成細邊框與小連結，就是把這個作品集降級成一份安全但隱形的履歷。

這套系統**明確拒絕**幾件事：拒絕 2026 年氾濫的「暖米底 + 襯線 + 01/02/03 編號段落」那條 AI-editorial 車道（我們用的是同樣的紙與襯線，但靠 commit 綠色與去除套版編號跳出來）；拒絕把長文關進浮框；拒絕灰虛的正文；拒絕重複同尺寸的卡片牆。溫暖來自紙與襯線，不是來自「把介面調淡」。

**Key Characteristics:**
- 暖紙基底，永不使用純白 (`#FFFFFF`) 或純黑 (`#000000`)。
- 單一主色森林綠 `#35431F`，目標用量 30–60% 的面（committed 策略，非點綴）。
- 襯線承載情感與展示，黑體承載 UI 與正文，mono 只當微標籤。
- 扁平為底、陰影只在狀態時出現（hover / 浮起）。
- 4px 間距階、克制的圓角（8 / 12 / 20 / pill）。

## 2. Colors

一條暖灰↔墨黑的窄調性帶，被一抹深森林綠劈開；綠色是唯一被允許撐起整面的顏色。

### Primary
- **森林綠 Forest** (`#35431F`)：全站唯一主色。用於主要 CTA、選中 chip 填色、連結、hover 強調——**以及整段滿版背景**（定位宣言 band、收尾 CTA band）。它的重量就是品牌的重量；committed 策略要求它承載 30–60% 的可視面積，而非只在邊框與小字上現身。
- **森林深 Forest Deep** (`#2A3518`)：hover 加深一階，也用於綠面之內的再分層（綠底上的卡中卡、輸入框）。
- **森林壓 Forest Active** (`#1F2912`)：active 按壓態再加深一階。

### Secondary
- **青檸 Lime** (`#C9D89B`)：唯一的高明度亮點。淺色徽章/標籤底（如 hero 的「五年乙方」膠囊）、`::selection` 選取色，以及**綠面上的次要文字與細節**（在森林綠背景上，lime 是唯一能同時保有識別與可讀性的亮色）。

### Neutral
- **紙 Paper** (`#D9D5C7`)：頁面基底色，body 背景。暖灰米，帶紀律而非甜膩。
- **次表面 Surface** (`#E6E2D5`)：chip 底、輸入框底、縮圖佔位。
- **卡面 Card** (`#EEEBE1`)：卡片面。DS 不用純白，這是「最亮」的中性面。
- **內層 Card Inner** (`#F4F1E8`)：卡中卡、icon 格等更內層的面。
- **墨 Ink** (`#23231D`)：主要文字。近黑而非純黑。
- **次文字 Ink-2** (`#6E6E62`)：meta、輔助說明；對紙約 3.5:1。**僅供短句 meta，不供長段正文。**
- **弱文字 Ink-3** (`#8A8A7C`)：對紙約 2.3:1，是刻意的設計取捨（見 `DECISIONS.md` 2026-07-13）。**只用於 mono 微標籤與 caption，永不用於正文。**

### On-Forest（綠面上的文字）
- **紙白 On-Forest** (`#EEEBE1`)：森林綠背景上的主要文字（反白排版）。對森林綠約 9:1，安全。
- **青檸 On-Forest-2** (`#C9D89B`)：森林綠背景上的次要文字、mono 標籤、細節線。

### Status
- **磚紅 Error** (`#A6483A`)：錯誤狀態。整套系統唯一的暖紅，用量極省。

### Named Rules
**The Load-Bearing Green Rule（綠色是承重牆）.** 森林綠必須在每一個主要頁面至少**撐起一個滿版的面**（不是邊框、不是小連結）。若一頁掃過去只剩米色與細綠線，這頁就回歸到「安全但隱形」，屬於架構回歸，須重做。目標：綠色承載 30–60% 的可視面積。

**The No-Pure-Ink Rule（不用純黑白）.** 全站不得出現 `#FFFFFF` 與 `#000000`。最亮是 Card `#EEEBE1`，最深是 Ink `#23231D`。溫度來自這條窄帶被守住。

## 3. Typography

**Display / UI Font:** Noto Sans TC（fallback: system-ui, sans-serif）
**Serif / 情感 Font:** Noto Serif TC（fallback: serif）
**Label / Mono Font:** Space Mono（monospace）
**Latin 點綴 Font:** Hanken Grotesk（sans-serif）

**Character:** 黑體與襯線在對比軸上配對——黑體是「說什麼」（清楚、能執行），襯線是「為什麼」（信任、記憶、溫度）。兩者分工必須被守住，不得隨手互換；mono 只負責最小的標籤與座標感的 meta。

### Hierarchy
- **Display**（Noto Sans TC 700, `clamp(32px, 6vw, 56px)`, lh 1.25, ls −0.01em）：hero 那句主張式標題（「跨領域 UX 設計師」）。全站唯一的粗黑體大字。
- **Display-Serif**（Noto Serif TC 500, `clamp(22px, 4vw, 34px)`, lh 1.6）：hero 副標與宣言金句（「信任，是體驗與記憶的接軌」）。承載情感的襯線大字。
- **Headline**（Noto Serif TC 500, `clamp(22px, 3.4vw, 28px)`, lh 1.4）：段落標題、內頁大標。
- **Title**（Noto Serif TC 500, `clamp(18px, 2.6vw, 22px)`, lh 1.45）：作品卡標題。
- **Body**（Noto Sans TC 400, 16px, lh 1.95）：正文段落。行長上限 65–75ch。**綠面上正文加 0.05–0.1 行高補償反白視重。**
- **Body-sm**（Noto Sans TC 400, 14px, lh 1.7）：輔助說明、卡片描述。
- **Label**（Space Mono 400, 11px, ls 0.08em）：mono 微標籤。
- **Caption**（Space Mono 400, 10.5px, ls 0.14em）：座標式 meta（客戶／年份／標籤）、分隔線文字。

### Named Rules
**The Two-Voice Rule（兩種聲音）.** 襯線 = 展示與情感（hero 副標、段標、作品標題、宣言）；黑體 = UI、正文、與 hero 那句唯一的粗標；mono = 微標籤與 meta；Hanken = 英文點綴。任何一段文字選字前先問它是哪種聲音，不得因為「這裡放一下好看」而混用。

**The Body-Reads-Ink Rule（正文用墨色）.** 長段落正文一律用 Ink `#23231D`；Ink-2 只給短 meta，Ink-3 只給 mono caption。灰虛正文是這套系統最容易犯的回歸。

## 4. Elevation

系統以**扁平為底、調性分層為主**：紙 → 次表面 → 卡面 → 內層，靠明度階差堆疊深度，而非陰影。陰影是**狀態的回應**，不是預設裝飾。唯一例外是卡片的極輕靜止陰影，用來在「卡面對紙」明度差過小時，把卡片從背景上托起半階——因為 committed 方向要求卡片有重量、不黏在底上。

### Shadow Vocabulary
- **卡片靜止 rest-lift**（`box-shadow: 0 8px 24px -16px rgba(35, 35, 29, 0.14)`）：作品卡、面板的靜止態；極輕，只為讓卡片浮出暖紙。
- **卡片浮起 hover-lift**（`box-shadow: 0 16px 34px -18px rgba(40, 50, 25, 0.45)` + `translateY(-4px)`）：卡片 hover / focus。陰影帶森林綠的冷調，與品牌同源。
- **底部浮片 sheet**（`background: rgba(35, 35, 29, 0.32)` backdrop）：行動版篩選 bottom sheet 的遮罩。

### Named Rules
**The Flat-By-Default Rule（預設扁平）.** 面材靜止時扁平，深度來自明度分層。陰影只在狀態（hover、浮起、focus）時出現，且必須是森林/墨的冷暖同源色，不用中性黑陰影。

## 5. Components

### Buttons
- **Shape:** 全 pill（`border-radius: 999px`）。
- **Primary:** 森林綠底 `#35431F` + 紙白字 `#EEEBE1`，padding `14px 30px`，body-sm 字級。hover → `#2A3518`；active → `scale(0.97)`。用於頁面主 CTA。
- **Ghost:** 透明底 + 森林綠字 + 森林綠 1px 描邊，pill；用於次要動作（清除篩選、回頂端）。mono 字級 + 寬字距。
- **Focus:** 鍵盤 focus 一律綠色外環 `box-shadow: 0 0 0 2px var(--ju-base), 0 0 0 4px var(--ju-green)`。

### Chips
- **Filter chip（篩選）:** 預設次表面底 `#E6E2D5` + 墨字，pill，mono 字。hover → `#D6D0BF`。**selected → 森林綠填色 + 紙白字**（committed，selected 態必須是實心綠）。
- **Tag chip（內頁標籤）:** 森林綠描邊或 lime 淺填 + 森林綠字，pill。承載內頁的品牌識別，不用中性灰。

### Cards / Containers
- **Corner Style:** 作品卡 `20px`；縮圖 `12px`；技能/內層面 `16px`。
- **Background:** 卡面 `#EEEBE1`；縮圖佔位 `#E6E2D5`。
- **Shadow Strategy:** 靜止 rest-lift，hover hover-lift（見 Elevation）。
- **Border:** 1px 實線 `var(--ju-border)`（rgba(0,0,0,0.1)）；hover 轉森林綠。
- **Internal Padding:** `clamp(20px, 3vw, 32px)`。

### Inputs / Fields
- **Style:** 次表面底、細描邊、圓角。
- **Focus:** 邊框轉森林綠 + 半透明綠光環 `box-shadow: 0 0 0 3px rgba(53, 67, 31, 0.22)`。
- **Error:** 磚紅 `#A6483A`。

### Navigation
- **Header:** 固定頂欄 56px，紙色底 + 底部 0.5px 細線。左「Ju」襯線森林綠 logo；右「作品」mono + 森林綠底線；輔助 mono 標籤在行動版隱藏。

### Signature Component — Forest Panel（森林面板）
系統的招牌動作，也是「綠撐面」原則的化身：**滿版森林綠背景 + 紙白襯線大字**的段落面板。用於 landing 的定位宣言與收尾 CTA。內部次要文字用 lime；可用 forest-deep 做卡中卡分層。這是把綠色從「點綴」升格為「承重牆」的具體元件。

## 6. Do's and Don'ts

### Do:
- **Do** 讓森林綠在每個主要頁面撐起至少一個滿版的面（Forest Panel）；目標綠色用量 30–60%。
- **Do** 正文一律用 Ink `#23231D`；Ink-2 只給短 meta，Ink-3 只給 mono caption。
- **Do** 依「兩種聲音」規則選字：襯線=情感/展示、黑體=UI/正文、mono=微標籤。
- **Do** 用明度分層堆疊深度，陰影只在 hover / 浮起 / focus 時出現。
- **Do** 卡片給極輕靜止陰影 + 1px 實線邊框，讓它們浮出暖紙。
- **Do** 綠面上的正文行高加 0.05–0.1 補償反白視重。
- **Do** 保持極簡相依（runtime 只有 react / react-dom / react-router-dom）。

### Don't:
- **Don't** 把森林綠降級成只有細邊框與小連結的點綴——那是架構回歸，須重做。
- **Don't** 使用純白 `#FFFFFF` 或純黑 `#000000`。
- **Don't** 用 01 / 02 / 03 之類的編號段落標記當套版鷹架，除非該段真的是一個有序序列。
- **Don't** 在每個段落標題上加小寫寬字距 mono eyebrow 當段落文法。
- **Don't** 把長文正文關進浮框卡片。
- **Don't** 用 Ink-2 / Ink-3 當長段落正文顏色（灰虛）。
- **Don't** 排一整牆同尺寸、同結構的卡片。
- **Don't** 使用 `border-left`/`border-right` 大於 1px 的彩色側條當卡片/提示強調。
- **Don't** 使用漸層文字（`background-clip: text` + gradient）。
- **Don't** 把玻璃擬態（backdrop blur 玻璃卡）當預設裝飾。

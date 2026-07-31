# Handoff: 朱千慧 Portfolio 網站

## 概述

此設計是為朱千慧作品集網站的 UI/UX 優化版本，包括首頁作品列表（可搜尋過濾）、作品詳細頁面（Blog 文章閱讀）與響應式行動版。

## 設計檔案說明

此交付包內的 HTML 與 JSX 檔案是**設計參考原型**，展示最終的外觀與互動。開發者應將這些設計**重新實作到你的 Vite + React 專案中**，使用現有的元件庫、設計 token 與程式碼模式——而不是直接複製貼上 HTML。

## 高保真度

此設計為**高保真 (high-fidelity)**：
- 像素完美的版面、色彩、字體排版與間距
- 完整的互動流程（搜尋、過濾、路由、無限捲動、響應式）
- 精確的時間序列與緩動曲線
- 開發者應逐像素重現此設計

## 設計 Tokens

### 色彩

```
--ju-green:       #2c6e4f  （主互動色，墨綠）
--ju-green-bg:    #d4ede2  （綠色背景/填充）
--ju-base:        #f5f1eb  （基底/頁面背景）
--ju-surface:     #eae4d8  （表面/次要背景）
--ju-card:        #ffffff  （卡片/容器背景）
--ju-dark:        #1a1a1a  （暗色/文字主色）
--ju-text:        #1a1a1a  （主文字色）
--ju-text2:       #6b6560  （次文字色/註記）
--ju-text3:       #b2afa9  （淡文字色/caption）
--ju-border:      #ddd7cc  （預設邊框色）
```

### 字體

- **中文標題**：Noto Serif TC (font-weight: 500)
- **內文**：Noto Sans TC (font-weight: 400)
- **註記/標籤**：IBM Plex Mono (font-weight: 400-500)

### 字級

- `p-hero-title`：clamp(28px, 5vw, 44px)，line-height: 1.4
- `p-detail-title`：clamp(28px, 5vw, 40px)，line-height: 1.4
- 卡片標題：20px，line-height: 1.45，font-weight: 500（Noto Serif TC）
- 內文：16px，line-height: 1.95（可 tweak 調整 1.7~2.2）
- Mono 標籤：11px，letter-spacing: 0.08em
- Caption：10.5px，letter-spacing: 0.14em

### 間距

- padding/gap：使用 `clamp(Aπx, X%, Bpx)` 響應式單位
- 卡片間距：clamp(40px, 6vw, 56px)
- 容器內側邊界：clamp(24px, 5vw, 56px)

### 邊框

- 所有邊框：**0.5px** 實線
- 邊框半徑：8px（搜尋列、卡片）、12px（文章容器）、999px（chip/pill 標籤）
- **禁止陰影**：無任何 box-shadow

## 首頁

### 名稱
Home / Works List

### 功能

1. **Hero 區**
   - 副標：「Hi, I'm Chain Huei Ju」（gray text2）
   - 標題：「尋找 {tag} 的作品」
   - **標籤輪播**：整個 tag 由下往上翻動（transform: translateY，duration: 300ms, easing: cubic-bezier(.33, 0, .2, 1)），全部標籤來自資料庫
   - 選定篩選後，hero 標籤鎖定顯示選中的第一個標籤

2. **搜尋列（桌面版）**
   - 位置：sticky，滾動時固定在 header 下緣（top: 56px）
   - 內容：
     - 搜尋欄位（可輸入過濾、拖入 tag chips）
     - 下拉菜單（點欄位展開）
     - 「全選」「清除」按鈕
     - 全部標籤列表（打字即時過濾）
     - 「搜尋」按鈕（草稿未套用時綠底）
   - 行為：
     - 點標籤改變草稿（不立即過濾）
     - 點 chip 的 × 移除該標籤
     - Backspace 刪最後選中的標籤
     - Enter（有建議時）選第一個，（無輸入時）執行搜尋
     - 點「搜尋」按鈕才套用篩選

3. **結果數**
   - 居中、hairline divider 左右
   - 文案：`"標籤1 + 標籤2 · N 件"` 或 `"全部作品 · N 件"`

4. **作品列表**
   - **版面**：瀑布流（固定欄寬、高度動態）
     - 桌面版：2 欄（預設）或 3 欄（Tweak 可調）
     - 行動版（max-width: 719px）：單欄
   - **初始載入**：前 6 件
   - **無限捲動**：向下捲動自動補 4 件（Intersection Observer sentinel）
   - **排序**：符合標籤數越多排越前，同分按 year 倒序
   - **卡片組件**
     - 封面（aspectRatio 依資料庫欄位，含細條紋佔位 + mono label）
     - 標題（襯線 20px，hovered 時綠色 + ↗）
     - Meta（mono 10.5px）：
       - `{client} / {tag1・tag2・tag3} / {year}`
       - 顯示項目由資料庫 `display.card` 控制
       - 示例：w08 不顯示標籤、w10 不顯示委託單位

5. **頁尾**
   - 已載入全部時，中央 divider 顯示「已是全部 N 件作品」
   - 下方「回到最頂端 ↑」按鈕（按或時平滑捲動到頁頂）

### 互動

- 搜尋列滾動時添加 hairline（border-top）
- 卡片 hover：邊框轉綠、標題轉綠、↗ 出現
- 點卡片進入內頁（hash 路由 `#/work/{id}`）

### 響應式

- 桌面版：搜尋列在頁面內、瀑布流 2-3 欄
- 行動版：搜尋列隱藏，改為吸底列（height: 50px）
  - 點開啟上滑面板（border-radius: 16px 16px 0 0），內含搜尋面板全部內容
  - 面板背景 base，內容相同

## 作品詳細頁

### 名稱
Work Detail

### 內容結構

1. **麵包屑**（左對齊）
   - 文案：`"首頁 — {tags[0]}"`
   - 「首頁」可點回首頁

2. **表頭**
   - 標題：p-detail-title 字級（襯線）
   - Meta：可點的標籤 chip（綠色邊框，點後回首頁並篩選該標籤）
   - 顯示項目由資料庫 `display.page` 控制（示例：w14 不顯示日期）

3. **文章內容**
   - **封面移除**：不在內頁顯示
   - **容器**：白底卡片（0.5px 邊框、12px 圓角、padding clamp）
   - **內容來自 Notion**：
     - 段落（p）：16px 內文、line-height 可調（1.7~2.2）、text-wrap: pretty
     - h2：24px 襯線、margin-top 56px
     - 引文（blockquote）：18px，上下 hairline、灰色、居中
     - 圖片（img）：16/10 比例、mono label 居中
   - **第一段不加 margin-top**

4. **推薦其他作品**
   - **分欄**：
     - 桌面版：2 欄瀑布流（建議區 4 卡片）
     - 行動版：單欄
   - **卡片**：同首頁設計（標題、meta、hover）
   - **排序**：依與當前作品標籤重合度、年份排序

## 無限捲動實作

使用 `IntersectionObserver` 監控 sentinel 元素（頁尾）進入視窗時自動載入更多（rootMargin: 320px）。

## 搜尋與過濾

- **資料源**：Notion 資料庫 tag 欄位
- **多選**：可同時選多個標籤
- **過濾邏輯**：任一標籤符合即顯示（OR 邏輯），符合數多者優先
- **點擊搜尋才執行**：不即時過濾

## 資料結構示例

```javascript
{
  id: 'w01',
  num: '01',
  title: '作品標題',
  client: '委託方',
  year: '2025',
  date: '2025-06-09',
  ratio: '4 / 3',  // 封面比例
  tags: ['服務設計', '介面設計'],
  display: {
    card: { tags: false },  // 卡片上不顯示標籤
    page: { date: false }   // 內頁不顯示日期
  }
}
```

## 路由

- `/` (首頁)
- `/work/{id}` (作品內頁)
- 使用 hash 路由（`window.location.hash`）

## 檔案清單

- **Portfolio 原型 A.html** — 完整互動原型（可直接在瀏覽器開啟）
- **proto-data.jsx** — 資料與工具函式
- **proto-ui.jsx** — 原子元件（Thumb、RotatingTag、Header、TagChip 等）
- **proto-search.jsx** — 搜尋面板與吸底列
- **proto-pages.jsx** — 首頁與內頁容器
- **tweaks-panel.jsx** — Tweak 控制面板（來自 Claude starter）

## Tweaks（設計參數可調）

- `columns`：瀑布流欄數（2 或 3）
- `lineHeight`：文章內文行高（1.7~2.2，預設 1.95）

## 開發建議

1. 將資料遷移到你的 Notion API 或後端
2. 用 React Router 替換 hash 路由
3. 依 Vite 架構分拆元件（或直接套用此設計中的元件劃分）
4. 搜尋與過濾邏輯可移到 custom hook 或 Zustand/Redux 狀態管理
5. 無限捲動可用 `react-infinite-scroll-component` 或自行 Intersection Observer
6. Notion 內容同步到 markdown 或 HTML 後再渲染

## 交付清單

✓ 設計原型（HTML）
✓ 設計規範（此文件）
✓ 色彩 / 字體 / 間距 tokens
✓ 互動流程文件
✓ 資料結構示例
✓ 路由圖

# PRD v2.0 — 朱千慧作品集網站
**版本** 2.0 · **狀態** 可交付開發 · **日期** 2026-06-09

> 此版本整合：互動規格 v1.0 + MVP v1.2 + Moodboard + Design Token + 圖片架構決策。可直接交給 Claude Code 執行。

---

## 1. 產品概述

### 目標
建立一個以「作品探索」為核心的個人作品集網站。訪客透過 tag 篩選找到有興趣的作品，進入後以 Medium 風格閱讀完整內容，內容來源為 Notion 資料庫。

### 核心體驗原則
- 訪客不需要「了解朱千慧是誰」才能開始探索
- Tag 是進入點，不是過濾器
- 每件作品是獨立完整的閱讀體驗
- 設計語言：簡約有個性、實驗劇場感、極輕視覺重量

---

## 2. 技術架構

```
[使用者瀏覽器]
      ↓
[Vite + React 前端] :5173
      ↓ /api/* proxy
[Express Backend] :3001
      ↓
[Notion API] → 作品列表 + Page 內容
[Cloudinary CDN] → 圖片 hosting
```

### 技術選型

| 層級 | 技術 | 版本 |
|---|---|---|
| 前端框架 | Vite + React | React 18 |
| 樣式 | Tailwind CSS | v3 |
| 路由 | React Router | v6 |
| Markdown 解析 | `react-markdown` + `remark-gfm` | latest |
| 後端 | Express.js | v4 |
| Notion SDK | `@notionhq/client` | latest |
| 環境變數 | `dotenv` | latest |
| 並行啟動 | `concurrently` | latest |

### 目錄結構

```
project-root/
├── .env                        # API Key（不進 git）
├── .env.example
├── .gitignore
├── server/
│   └── index.js                # Express proxy server
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   └── tokens.css          # Design Token CSS Variables
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   └── WorkDetailPage.jsx
│   ├── components/
│   │   ├── Header.jsx          # Fixed logo header
│   │   ├── SearchBar.jsx       # Fixed 下拉多選搜尋列
│   │   ├── WorkCard.jsx
│   │   ├── MarkdownRenderer.jsx
│   │   └── BackToTop.jsx       # 回頂端按鈕
│   └── utils/
│       └── notionParser.js
├── public/
└── vite.config.js
```

---

## 3. Design Token

所有 UI 元件必須使用以下 Token，不得使用 hard-coded 色碼。

### 色彩

```css
:root {
  /* Brand */
  --color-brand-primary:     #2c6e4f;
  --color-brand-primary-bg:  #d4ede2;

  /* Background */
  --color-bg-base:     #f5f1eb;
  --color-bg-surface:  #eae4d8;
  --color-bg-card:     #ffffff;
  --color-bg-dark:     #1a1a1a;

  /* Text */
  --color-text-main:      #1a1a1a;
  --color-text-secondary: #6b6560;
  --color-text-disabled:  #b2afa9;

  /* Border */
  --color-border-default: #ddd7cc;
  --color-border-strong:  #1a1a1a;
}
```

### 字型比例尺

```css
:root {
  --font-display:      48px; /* weight 400, line-height 52px, tracking -0.02em */
  --font-h1:           36px; /* weight 400, line-height 40px, tracking -0.01em */
  --font-h2:           24px; /* weight 400, line-height 30px, tracking -0.01em */
  --font-h3:           18px; /* weight 500, line-height 24px */
  --font-body:         15px; /* weight 400, line-height 27px */
  --font-body-sm:      13px; /* weight 400, line-height 22px */
  --font-label:        12px; /* weight 500, line-height 16px, tracking +0.08em */
  --font-label-caps:   11px; /* weight 400, line-height 16px, tracking +0.14em, uppercase */
  --font-caption:      11px; /* weight 400, line-height 16px, tracking +0.04em */
}
```

### 間距

```css
:root {
  --spacing-xs:  4px;
  --spacing-sm:  8px;
  --spacing-md:  16px;
  --spacing-lg:  24px;
  --spacing-xl:  40px;
  --spacing-2xl: 64px;
}
```

### 圓角

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-pill: 999px;
}
```

---

## 4. 圖片架構

### 使用 Cloudinary（免費方案）

所有作品封面圖與內文圖片統一上傳至 Cloudinary，Notion 欄位存放完整 URL。

**設定步驟：**
1. 至 [cloudinary.com](https://cloudinary.com) 註冊免費帳號
2. 上傳圖片後取得 URL 格式：
   ```
   https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.jpg
   ```
3. 將 URL 填入 Notion `圖片` 欄位（Markdown 格式）：
   ```
   ![作品封面](https://res.cloudinary.com/your-id/image/upload/cover.jpg)
   ```

**優點：**
- 免費 25GB 儲存空間
- URL 永久有效，不會過期
- 不需要修改程式碼，直接換 URL 即可更新圖片
- 與 Notion 降為免費方案無關

---

## 5. Notion 資料庫規格

**Database ID：** `37aaa7a7810880cbaf88eac9a13102c0`

| 欄位名稱 | 型別 | 用途 |
|---|---|---|
| `作品名稱` | `title` | 作品標題（必填） |
| `tag` | `multi_select` | 篩選用標籤 |
| `作品類型` | `select` | 主分類，如「推測設計」、「系統設計」 |
| `圖片` | `rich_text` | 封面圖 Cloudinary URL，Markdown 格式，取第一張 |
| `建立時間` | `created_time` | 自動產生，用於排序 |
| `顯示標題` | `checkbox` | 控制作品頁是否顯示標題 |
| `顯示類型` | `checkbox` | 控制是否顯示作品類型 |
| `顯示日期` | `checkbox` | 控制是否顯示建立時間 |
| `顯示Tag` | `checkbox` | 控制是否顯示 tag |
| `published` | `checkbox` | 是否在網站上公開顯示 |

> **Notion 端控制顯示邏輯：** 卡片與作品頁的資料項目顯示，依各 checkbox 欄位決定，前端讀取後依此渲染。

---

## 6. 互動規格

### 6.1 全域

**Fixed Header（Logo）**
- Logo 文字「Ju」，顏色 `--color-brand-primary`
- 滾動時固定在畫面最頂端，背景 `--color-bg-base`，底部 0.5px border `--color-border-default`
- 點擊 Logo → 回到首頁並清除所有篩選狀態

---

### 6.2 首頁

#### Hero 區塊

```
Hi, I'm Chain Huai Ju
尋找 [rotating tag] 的作品
```

**Rotating Tag 動畫規格：**
- 資料來源：Notion Database `tag` 欄位的所有唯一值
- 效果：整個 tag 文字由下往上翻動（CSS transform translateY + opacity）
- 切換間隔：2.5 秒
- 當使用者在搜尋列選擇 tag 時，rotating tag 停止輪播，改為顯示選中的 tag（多選時顯示第一個）

#### Fixed 搜尋列

滾動超過 Hero 區塊後，搜尋列固定在 Header 下方。

**下拉多選搜尋規格：**

| 功能 | 規格 |
|---|---|
| 資料來源 | Notion `tag` 欄位所有唯一值，動態抓取 |
| 選擇方式 | 下拉選單，可多選 |
| 已選顯示 | 選中的 tag 以 pill 形式顯示在搜尋框內，每個 pill 有 × 可單獨移除 |
| 一鍵清除 | 搜尋框右側「清除全部」按鈕，清空所有已選 tag |
| 一鍵全選 | 下拉選單頂部「全選」選項 |
| 觸發搜尋 | 選擇完成後，點擊「開始探索」按鈕才觸發篩選 |
| 搜尋結果標籤 | 顯示「{tag1} + {tag2} · {N} 件」 |

#### 作品列表

**瀑布流規格：**

| 裝置 | 斷點 | 欄數 |
|---|---|---|
| 手機 | `< 768px` | 1 欄 |
| 平板 | `768px – 1023px` | 2 欄 |
| 桌機 | `≥ 1024px` | 2 欄（固定欄寬，高度動態） |

- 卡片寬度固定欄寬，高度依內容動態
- 為防止 Layout Shift：圖片需設定 `aspect-ratio: 4/3`，載入前佔位，不等載入後才決定高度
- 排序預設依 `created_time` 降冪（新到舊）

**篩選邏輯：**
- 使用者選 3 個 tag，作品只要符合其中 1 個即顯示（OR 邏輯）
- 排序：符合 tag 數量多的排前，少的排後
- 篩選為前端 filter，不重新呼叫 API

**作品卡片顯示欄位（依 Notion checkbox 控制）：**
- 封面圖（無圖顯示 `--color-bg-surface` 灰底 placeholder）
- 作品名稱
- 作品類型（`--color-brand-primary`，Label/Caps 樣式）
- Tag pills

**卡片互動：**
- Hover：border 改為 `--color-brand-primary`，向上位移 2px，transition 0.15s
- Click：導向 `/work/:id`

**頁尾：**
- 回頂端按鈕：固定在右下角，滾動超過 300px 後出現，點擊平滑捲動回頂端

**States：**
- Loading：Skeleton card（3 個灰色佔位卡片）
- Empty：「目前沒有符合的作品，試試其他標籤？」+ 清除篩選按鈕
- Error：「資料載入失敗，請重新整理頁面」

---

### 6.3 作品內容頁

#### 麵包屑
```
首頁  —  {作品類型}
```
- 「首頁」可點擊 → 回首頁並清除篩選
- `{作品類型}` 不可點擊
- 樣式：`Caption`，顏色 `--color-text-disabled`

#### 作品 Header（依 Notion checkbox 控制顯示）
- 作品標題：`H1`
- Tag pills：Active 樣式（`--color-brand-primary` 背景）
- 作品類型
- 建立日期：格式 `YYYY-MM-DD`，`Caption`，`--color-text-disabled`

#### Notion 內容渲染

內容來源：Notion Page blocks，透過 `notionParser.js` 轉為 Markdown，再由 `MarkdownRenderer.jsx` 渲染。

| Block 類型 | 渲染方式 |
|---|---|
| `paragraph` | `<p>` |
| `heading_1` | `<h1>` |
| `heading_2` | `<h2>` |
| `heading_3` | `<h3>` |
| `bulleted_list_item` | `<ul><li>` |
| `numbered_list_item` | `<ol><li>` |
| `image` | `<img>`，寬度 100%，`radius/md` |
| `video` | YouTube URL → `<iframe>` 16:9 |
| `code` | code block |
| `quote` | `<blockquote>`，左側 2px border `--color-brand-primary` |
| `divider` | `<hr>`，0.5px `--color-border-default` |
| `callout` | 帶背景色提示區塊 |

最大內容寬度 680px，水平置中。

#### 推薦其他作品
- 顯示最相關的 4 件作品（tag 交集最多者優先）
- 不足 4 件時補上最新作品
- 瀑布流兩欄，同首頁作品卡片樣式

---

## 7. API 規格

### `GET /api/works`

```json
{
  "works": [
    {
      "id": "notion-page-id",
      "title": "洪災行動匯報系統 2.0",
      "tags": ["系統設計", "使用者研究"],
      "type": "推測設計",
      "coverImage": "https://res.cloudinary.com/your-id/image/upload/cover.jpg",
      "createdTime": "2026-06-09T01:10:00.000Z",
      "display": {
        "title": true,
        "type": true,
        "date": false,
        "tags": true
      }
    }
  ]
}
```

### `GET /api/works/:id`

```json
{
  "id": "notion-page-id",
  "title": "洪災行動匯報系統 2.0",
  "tags": ["系統設計", "使用者研究"],
  "type": "推測設計",
  "coverImage": "https://res.cloudinary.com/your-id/image/upload/cover.jpg",
  "createdTime": "2026-06-09T01:10:00.000Z",
  "display": {
    "title": true,
    "type": true,
    "date": true,
    "tags": true
  },
  "content": "# 作品介紹\n\n這是內文...\n\n![說明](https://res.cloudinary.com/...)\n\nhttps://youtu.be/xxxxx"
}
```

---

## 8. 環境變數

```bash
# .env
NOTION_API_KEY=你的_Notion_API_Key
NOTION_DATABASE_ID=37aaa7a7810880cbaf88eac9a13102c0
PORT=3001
```

```bash
# .gitignore
.env
node_modules/
dist/
```

---

## 9. 部署：GitHub Pages

> 注意：GitHub Pages 為純靜態 hosting，Express backend 無法部署在此。需將後端另外部署或改為純前端架構。

### 建議部署策略

**後端：Railway 或 Render（免費方案）**
- 將 `server/` 部署至 Railway / Render
- 環境變數在平台介面設定，不進 git
- 取得後端 URL，如：`https://your-app.railway.app`

**前端：GitHub Pages**
- `vite.config.js` 將 `/api` proxy 改指向後端 URL
- `npm run build` → `dist/` 資料夾推上 `gh-pages` 分支

**`vite.config.js` 生產環境設定：**
```javascript
export default defineConfig({
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3001' // 本機開發用
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

前端 API 呼叫改為環境變數控制：
```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api'
```

```bash
# .env（本機）
VITE_API_URL=/api

# GitHub Pages 環境（在 Vite build 前設定）
VITE_API_URL=https://your-app.railway.app/api
```

---

## 10. 里程碑

| 階段 | 內容 | 狀態 |
|---|---|---|
| **M1** | Notion 作品頁內容渲染 | ✅ 完成 |
| **M2** | Design Token CSS Variables 建立 | 待執行 |
| **M3** | 首頁作品列表從 Notion 動態載入 | 待執行 |
| **M4** | 多選 Tag 篩選 + 排序邏輯 | 待執行 |
| **M5** | Fixed Header + Fixed 搜尋列 + 回頂端 | 待執行 |
| **M6** | Rotating tag 動畫 | 待執行 |
| **M7** | UI 套用 Design Token + Moodboard 樣式 | 待執行（等 Figma UI 完成） |
| **M8** | 推薦作品邏輯 | 待執行 |
| **M9** | Cloudinary 圖片遷移 | 待執行 |
| **M10** | 部署至 GitHub Pages + Railway | 待執行 |

---

## 11. 驗收測試清單

| # | 測試項目 | 預期結果 |
|---|---|---|
| 1 | 首頁載入 | 顯示全部作品卡片 |
| 2 | Rotating tag | 每 2.5 秒由下往上翻動切換 |
| 3 | 多選 tag | 搜尋框顯示 pill，可單獨 × 移除 |
| 4 | 一鍵清除 | 清空所有已選 tag，回到全部 |
| 5 | 搜尋結果排序 | 符合 tag 數多的排前 |
| 6 | Fixed 搜尋列 | 滾動後固定在 Header 下方 |
| 7 | 回頂端按鈕 | 滾動 300px 後出現，點擊平滑回頂 |
| 8 | Layout Shift | 圖片載入前已佔位，無畫面跳動 |
| 9 | Notion checkbox | 欄位設 false 的項目不顯示 |
| 10 | 作品頁麵包屑 | 點擊「首頁」回首頁並清除篩選 |
| 11 | 推薦作品 | 顯示 tag 交集最多的 4 件 |
| 12 | Cloudinary 圖片 | 封面圖與內文圖正確顯示 |
| 13 | YouTube 嵌入 | URL 自動渲染為 16:9 iframe |
| 14 | RWD 桌機 | 2 欄瀑布流 |
| 15 | RWD 手機 | 1 欄 |
| 16 | Empty state | 顯示提示文字與清除按鈕 |
| 17 | Notion 內容同步 | 修改後 F5 即時反映 |

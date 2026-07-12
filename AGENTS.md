# Portfolio Web — 架構規範與工作準則

朱千慧個人作品集。React 18 + Vite SPA，**純靜態部署於 Vercel**，Notion 僅作為「建置時的資料來源」。
本文件是所有 AI 助手／工程師接手時的正本規則；改動架構前先讀完「鐵則」與「品質關卡」。

## 架構總覽（2026-07 靜態化改版後）

```
Notion 資料庫（內容編輯在這裡）
   │  只在 build 時發生 ↓
scripts/fetch-content.js ──→ public/content/works.json        （作品列表）
  （呼叫 scripts/notion.js）  public/content/works/<id>.json   （各作品內頁 blocks）
                              public/content/images/           （下載回來的圖片/影片）
                              public/sitemap.xml
   │  vite build ↓
dist/ ──→ Vercel CDN（線上網站，完全不碰 Notion API）
```

- 前端經 `src/lib/data.js` 讀取上述靜態 JSON（含記憶體快取），**沒有任何 runtime API**。
- 內容更新流程：改 Notion → 觸發 Vercel Deploy Hook（或 push）→ 約 1 分鐘上線。
- 保險：`.github/workflows/daily-rebuild.yml` 每日自動重建（需 GitHub secret `VERCEL_DEPLOY_HOOK`）。
- 架構決策的完整脈絡在 `DECISIONS.md`（新決策記在最上面，四欄格式）。

## 鐵則（違反即架構回歸，不可妥協）

1. **線上程式碼不得呼叫 Notion API**。所有內容一律在 build 時由 `scripts/fetch-content.js` 抓取。
2. **不得在任何產出物中殘留 Notion S3 簽章網址**（`amazonaws.com` + `X-Amz`，約 1 小時過期）。
   Notion 託管的圖片/影片必須下載本地化；外部連結（不過期）保持原樣。
3. **產生物不進版控**：`public/content/`、`public/sitemap.xml`、`dist/` 已在 `.gitignore`，不要移出。
4. **Secrets 只存在 `.env`（本機）與 Vercel 環境變數**：`NOTION_API_KEY`、`NOTION_DATABASE_ID`。
   前端程式碼（`src/`）與 repo 內不得出現任何 key。
5. **顏色一律使用 `src/styles/tokens.css` 的 CSS 變數**（`var(--ju-*)`），不寫死色碼。
6. **尊重 Notion 的顯示開關欄位**（`work.display.card.*` / `work.display.page.*`），新 UI 也要遵守。

## 目錄職責

| 路徑 | 職責 |
|------|------|
| `scripts/notion.js` | Notion API 存取與資料正規化（`formatPage`、遞迴抓 blocks）。欄位改名時保留舊欄名 fallback（見檔內既有模式） |
| `scripts/fetch-content.js` | 建置時抓取、圖片本地化、sitemap 產生。抓取失敗必須 `process.exit(1)` 讓部署中止、線上維持前一版 |
| `src/lib/` | 共用邏輯（`data.js` 資料讀取、`masonry.js` 瀑布流與 reduced-motion 工具）。跨頁面的函式放這裡，不要在頁面間複製貼上 |
| `src/components/` | 可重用元件。`NotionBlockRenderer.jsx` 負責所有 Notion block 型別的渲染 |
| `src/pages/` | 路由頁面（路由定義在 `src/App.jsx`） |
| `handoff/`、`md/`、`PRD_*.md` | 歷史原型與文件，唯讀參考，不要引用進程式 |

## 程式慣例

- **樣式**：沿用現況——JSX inline style + `var(--ju-*)` token + 字體 helper class（`ju-sans` / `ju-serif` / `ju-mono`）+ 少量 Tailwind utility（`src/index.css` 的 `.p-*`）。不要引入 CSS-in-JS 或 UI 框架。
- **語言**：UI 文案與註解用繁體中文；與使用者溝通一律繁體中文。
- **無障礙底線**（新程式碼不得低於此線）：
  - 可點擊的東西必須是 `<a>` 或 `<button>`（不用 `div onClick`），可展開元素加 `aria-expanded`
  - 純圖示按鈕加 `aria-label`；裝飾性符號加 `aria-hidden`
  - 動畫與平滑捲動走 `src/lib/masonry.js` 的 `scrollToY` / `prefersReducedMotion`，並保留 `index.css` 的全域 reduced-motion 規則
  - 文字對比不得低於現有 token 水準（`--ju-text3` ≈ 3.5:1 是刻意的設計取捨，見 tokens.css 註解；再調淡即回歸）
- **SEO**：新路由要同步處理 `document.title`、`scripts/fetch-content.js` 的 sitemap 清單；卡片/列表項一律用真連結。
- **相依套件**：保持極簡（目前 runtime 只有 react、react-dom、react-router-dom）。新增套件前先確認無法用現有工具完成，並在 commit message 說明理由。

## 常見擴張的正確做法

- **新增 Notion 欄位** → 只改 `scripts/notion.js` 的 `formatPage`，舊欄名保留 fallback；前端消費新欄位。
- **支援新的 Notion block 型別** → `NotionBlockRenderer.jsx` 加 case；若該型別有子層，同步加入 `scripts/notion.js` 的 `NEEDS_CHILDREN`；若含 Notion 託管檔案，同步處理 `fetch-content.js` 的 `localizeBlocks`。
- **新頁面**（如 About）→ `src/pages/` + `App.jsx` 路由 + `document.title` + sitemap。
- **換網域** → 設 Vercel 環境變數 `SITE_URL`（sitemap 用）並更新 `public/robots.txt` 內的 Sitemap 網址。
- **要做即時互動功能**（留言、表單等）→ 這會打破純靜態架構，先在 `DECISIONS.md` 記錄決策再動工；優先考慮第三方免費服務而非自建後端。

## 品質關卡（每次改動交付前必跑）

```bash
npm run fetch        # 需 .env；抓 Notion 內容（改到 scripts/ 時必跑）
npm run build        # fetch + vite build，必須零錯誤通過
npm run dev          # 瀏覽器實測：首頁 + 至少一個作品內頁
```

檢查清單：
1. build 通過、瀏覽器 console 零錯誤
2. 首頁瀑布流、標籤搜尋、內頁 blocks 渲染、推薦區皆正常
3. 改過 `scripts/` 的話，確認無殘留簽章網址：
   `grep -rl "X-Amz" public/content/ ; echo "(無輸出=通過)"`
4. 部署後 `curl` 線上站首頁與 `/content/works.json` 確認 200
5. 只 commit 使用者同意推送的內容；commit message 用中文、說明「為什麼」

## 部署與維運備忘

- push 到 `main` → Vercel 自動 build（build 指令會先跑 fetch，環境變數已設在 Vercel）。
- 內容更新不需 push：點 Vercel Deploy Hook 即可。
- 線上網址：https://portfolio-web-ten-dusky.vercel.app
- 已知待辦與歷史決策：一律查 `DECISIONS.md`。

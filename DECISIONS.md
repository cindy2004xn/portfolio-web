# 決策紀錄

| 日期 | 決定了什麼 | 為什麼 | 放棄了什麼選項 |
|------|-----------|--------|----------------|
| 2026-07-12 | 【已完成】每日自動重建保險已啟用：GitHub secret `VERCEL_DEPLOY_HOOK` 已設定，手動觸發 workflow 實測成功（run 29194624223）。每天台北時間早上 5 點自動重建 | 靜態化後內容更新靠手動點 Deploy Hook；若忘記點，每日自動重建保證最晚隔天上線 | —（原待辦，當日設定完成） |
| 2026-07-12 | Notion 從「即時後端」改為「建置時資料來源」：build 時（`scripts/fetch-content.js`）抓取全部作品存成靜態 JSON、Notion 託管圖片下載到 `public/content/` 自行託管，移除 `/api` serverless 與 Express；內容更新靠 Vercel Deploy Hook 手動觸發 + GitHub Action 每日自動重建。此決策同時解決 2026-06-25 那筆「簽章網址過期」待辦 | 即時串接讓每位訪客每次瀏覽都等 Notion API（實測 0.7～2.5 秒），且簽章網址約 1 小時過期導致無法加長效快取；靜態化後載入 <100ms、圖片永不過期、不受 Notion 限速/停機/改版影響，全程零費用。代價僅是內容更新從即時變成「觸發重建後約 1 分鐘」 | 路線 A：維持即時 API + CDN 短快取 + 封面圖搬 Cloudinary（圖片過期問題只解一半）；遷移 Next.js 用 ISR（工程量大） |
| 2026-06-25 | 【待辦】封面圖目前用「上傳到 Notion」的檔案，URL 為 S3 簽章網址、約 1 小時過期。未來若要加 CDN/快取，需改用不過期的圖源（外部圖床，或 Notion files 的 external 連結） | 簽章網址過期後封面會壞；目前每次請求即時向 Notion 取得新簽章，低流量可接受，但加快取後會踩雷 | 暫不改圖源（維持即時取得簽章 URL） |
| 2026-06-24 | 部署平台從 GitHub Pages 遷移到 Vercel，前端與 Notion API 後端收斂成單一 Vercel 部署（`/api` serverless functions） | GitHub Pages 只能放靜態檔，後端被迫另外託管（Railway），造成跨平台、CORS、子路徑等維護負擔；Vercel 能前後端同網域、Notion key 安全存在環境變數、SPA fallback 原生支援 | 維持 GitHub Pages + 獨立後端（Railway）的分離架構；本機 dev 改用 `vercel dev` 取代舊的 `npm run dev` 雙 process（保留為離線備援） |

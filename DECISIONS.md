# 決策紀錄

| 日期 | 決定了什麼 | 為什麼 | 放棄了什麼選項 |
|------|-----------|--------|----------------|
| 2026-06-25 | 【待辦】封面圖目前用「上傳到 Notion」的檔案，URL 為 S3 簽章網址、約 1 小時過期。未來若要加 CDN/快取，需改用不過期的圖源（外部圖床，或 Notion files 的 external 連結） | 簽章網址過期後封面會壞；目前每次請求即時向 Notion 取得新簽章，低流量可接受，但加快取後會踩雷 | 暫不改圖源（維持即時取得簽章 URL） |
| 2026-06-24 | 部署平台從 GitHub Pages 遷移到 Vercel，前端與 Notion API 後端收斂成單一 Vercel 部署（`/api` serverless functions） | GitHub Pages 只能放靜態檔，後端被迫另外託管（Railway），造成跨平台、CORS、子路徑等維護負擔；Vercel 能前後端同網域、Notion key 安全存在環境變數、SPA fallback 原生支援 | 維持 GitHub Pages + 獨立後端（Railway）的分離架構；本機 dev 改用 `vercel dev` 取代舊的 `npm run dev` 雙 process（保留為離線備援） |

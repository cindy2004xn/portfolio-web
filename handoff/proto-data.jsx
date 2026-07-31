/* 原型資料 — 標籤取自作品 tag 欄位;ratio/display 模擬 Notion 資料庫欄位設定 */

const P_WORKS = [
  { id: 'w01', num: '01', title: '颱洪行動匯報系統 2.0', client: '新竹市消防局', year: '2025', date: '2025-06-09', ratio: '4 / 3', tags: ['服務設計', '介面設計', '公部門專案', '資料視覺化'] },
  { id: 'w02', num: '02', title: '明日的餐桌', client: '自主研究', year: '2025', date: '2025-03-18', ratio: '3 / 4', tags: ['推測設計', '互動裝置', '工作坊'] },
  { id: 'w03', num: '03', title: '城市聲音圖書館', client: '臺北市立美術館', year: '2024', date: '2024-11-02', ratio: '1 / 1', tags: ['互動裝置', '聲音設計', '展場設計'] },
  { id: 'w04', num: '04', title: '排隊的儀式', client: '田野觀察計畫', year: '2024', date: '2024-07-21', ratio: '16 / 10', tags: ['使用者研究', '服務設計', '設計研究'] },
  { id: 'w05', num: '05', title: '借物對話亭', client: '嘉義文創園區', year: '2023', date: '2023-12-09', ratio: '4 / 5', tags: ['服務設計', '互動裝置', '永續設計'] },
  { id: 'w06', num: '06', title: '夜行公車指南', client: '桃園市交通局', year: '2023', date: '2023-08-30', ratio: '4 / 3', tags: ['介面設計', '使用者研究', '公部門專案'] },
  { id: 'w07', num: '07', title: '給未來的遺書', client: '畢業製作', year: '2022', date: '2022-06-12', ratio: '3 / 4', tags: ['推測設計', '設計研究'] },
  { id: 'w08', num: '08', title: '紙上排練場', client: '好事發生劇場', year: '2022', date: '2022-04-05', ratio: '1 / 1', tags: ['品牌識別', '平面設計', '劇場'], display: { card: { tags: false } } },
  { id: 'w09', num: '09', title: '感官備忘錄', client: '臺中歌劇院', year: '2023', date: '2023-05-17', ratio: '16 / 10', tags: ['展場設計', '劇場', '互動裝置'] },
  { id: 'w10', num: '10', title: '一頁式災防手冊', client: '開放文化基金會', year: '2024', date: '2024-02-26', ratio: '4 / 3', tags: ['平面設計', '原型製作', '公部門專案'], display: { card: { client: false } } },
  { id: 'w11', num: '11', title: '等候室裡的光', client: '部立桃園醫院', year: '2024', date: '2024-09-12', ratio: '1 / 1', tags: ['服務設計', '公部門專案', '使用者研究'] },
  { id: 'w12', num: '12', title: '風的形狀', client: '自主研究', year: '2023', date: '2023-04-22', ratio: '3 / 4', tags: ['互動裝置', '資料視覺化'] },
  { id: 'w13', num: '13', title: '菜市場的一百種聲音', client: '田野觀察計畫', year: '2022', date: '2022-10-08', ratio: '4 / 3', tags: ['聲音設計', '設計研究', '工作坊'] },
  { id: 'w14', num: '14', title: '慢速郵件', client: '畢業製作', year: '2021', date: '2021-12-01', ratio: '16 / 10', tags: ['推測設計', '原型製作'], display: { page: { date: false } } },
];

/* 標籤依使用次數排序 */
const P_TAG_COUNTS = (() => {
  const m = new Map();
  P_WORKS.forEach(w => w.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
})();
const P_TAGS = P_TAG_COUNTS.map(([t]) => t);

/* 瀑布流分欄:依封面比例估高,放進最短欄 → 高度可預先計算,避免 Layout Shift */
function pDistributeMasonry(works, cols) {
  const heights = Array(cols).fill(0);
  const buckets = Array.from({ length: cols }, () => []);
  works.forEach(w => {
    const [rw, rh] = (w.ratio || '4 / 3').split('/').map(s => parseFloat(s));
    const h = rh / rw + 0.42; /* 封面 + 文字區估值 */
    const k = heights.indexOf(Math.min(...heights));
    buckets[k].push(w);
    heights[k] += h;
  });
  return buckets;
}

/* 內頁示意文章(Notion 內容的閱讀節奏 demo) */
const P_ARTICLE = [
  { type: 'p', text: '二〇二四年夏天的一場豪雨，讓新竹市消防局的勤務指揮中心在四十分鐘內湧入超過三百通報案電話。既有的匯報流程仰賴電話與紙本白板，資訊在各分隊之間的傳遞有明顯的時間差——這個專案從這裡開始。' },
  { type: 'h2', text: '看見現場的混亂' },
  { type: 'p', text: '我們在三個月內跟著值班員經歷了兩次颱風警報，把指揮中心牆上每一張便利貼、每一次廣播呼叫都記錄下來。訪談了十四位第一線同仁之後，問題逐漸清晰：不是缺少資訊，而是資訊沒有共同的格式。' },
  { type: 'img', label: '田野紀錄 · 指揮中心白板' },
  { type: 'quote', text: '「我們不是不會用系統，是系統沒有跟著我們的習慣走。」— 值班台同仁' },
  { type: 'h2', text: '把白板搬進系統' },
  { type: 'p', text: '2.0 版的核心決策是保留白板的空間邏輯：案件依轄區排列，狀態用顏色而不是文字表達。值班員不需要學習新的心智模型，只是把熟悉的牆面換成可以同步的螢幕。' },
  { type: 'img', label: '系統介面 · 匯報總覽' },
  { type: 'p', text: '上線後第一次實戰是隔年的梅雨鋒面。案件平均建檔時間從 4 分鐘降到 70 秒，跨分隊的重複派遣歸零。更重要的是，值班員說他們「終於可以抬頭看現場，而不是低頭找資料」。' },
];

Object.assign(window, { P_WORKS, P_TAGS, P_TAG_COUNTS, P_ARTICLE, pDistributeMasonry });

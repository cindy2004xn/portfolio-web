// 讀取 build 時產生的靜態內容（見 scripts/fetch-content.js）
const BASE = import.meta.env.BASE_URL;

let worksPromise = null;

export function fetchWorks() {
  if (!worksPromise) {
    worksPromise = fetch(`${BASE}content/works.json`)
      .then(res => { if (!res.ok) throw new Error('載入作品列表失敗'); return res.json(); })
      .then(data => (data.works ?? []).filter(Boolean));
    // 失敗不留住快取，下次進頁面可重試
    worksPromise.catch(() => { worksPromise = null; });
  }
  return worksPromise;
}

export async function fetchWork(id) {
  const res = await fetch(`${BASE}content/works/${id}.json`);
  if (!res.ok) throw new Error('載入作品內容失敗');
  return res.json();
}

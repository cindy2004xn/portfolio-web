import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorks } from '../lib/data.js';
import BackToTop from '../components/BackToTop.jsx';

/* Landing 文案正本：作品集網站_Landing_Page文案初稿 v3。
   日期/客戶以文案字串直接呈現（與 Notion 年份標註略有差異，刻意不從資料拉）。 */

const SELECTED_WORKS = [
  {
    id: '37baa7a7-8108-8082-8a2b-cbd642c2b604',
    title: '高壓救災情境：降低視覺干擾以提升決策速度',
    meta: '2024/8 – 2024/12　新竹市消防局｜颱洪行動匯報系統 2.0',
    desc: '透過 User Flow 釐清消防員、指揮中心、里長、應變小組之間的資訊落差，我們將散落的災情資料整合進單一頁面，並以視覺化呈現讓指揮中心快速掌握狀況，消防員與指揮官的決策壓力不同，需要各自專屬的介面。',
  },
  {
    id: '38aaa7a7-8108-8032-afed-c0ea0a972f94',
    title: 'AI 客服系統：建立使用者與 AI 之間的信任機制',
    meta: '2023/5 – 2023/12　華碩｜線上客服導入 AI 技術',
    desc: '透過與客服單位的訪談與親和圖分類，我們將複雜情境收斂為三種類型，設計出決策樹、AI+KM 客服、真人客服的三層架構，當情緒化語彙被偵測到，AI 會優雅地把使用者轉交給真人。',
  },
  {
    id: '37baa7a7-8108-80c4-9f01-e003adfbf4df',
    title: '福利政策後台重構：從人工比對到系統化查找',
    meta: '2023/3 – 2024/1　長穩基金會｜iFare 福利政策小幫手（UX 設計師／PM 雙棲）',
    desc: '社工人員原本得靠人工比對政策條件，後台老舊、更新一次要花一年。我以 Excel 原型與客戶共同測試，收斂搜尋條件並導入排程功能，將政策維護更新時間從 1 年縮短至 1 個月，同時身兼 PM 與設計師角色，在需求、時程與團隊執行之間取得平衡。',
  },
];

const AI_WORKS = [
  {
    id: '38aaa7a7-8108-8028-9ebb-e750f4aa9fdf',
    title: '分析現有流程，協助導入 AI Agent',
    meta: '2026　旻寬科技',
    desc: '各廠商報價單格式不一，人工比對耗時且容易出錯。初期讓 AI 直接處理，實際產出與預期有落差；於是加入人類審核點並建立學習型同義詞庫，逐步提高辨識精準度。',
  },
  {
    id: '37baa7a7-8108-8021-b632-e36abbef5fcf',
    title: '透過 PRD 控管與 AI 進行協作',
    meta: '2026　個人專案',
    desc: '我負責定義網站架構、內容邏輯與 PRD 規格，AI 依規格產出程式碼與初版介面，我再檢視、調整、回饋修正方向，你現在看到的網站，就是這個協作模式的產出結果。',
  },
  {
    id: '38aaa7a7-8108-8070-875c-f491ba76455c',
    title: 'AI 協助有效提升資料分析',
    meta: '2025 – 仍在職　資訊工業策進會',
    desc: '需要快速閱讀多家廠商計劃書並產出精準報告。我負責描述預期的資料呈現方式與邏輯，AI 協助生成函式、建立分析表結構，我再檢查產出是否符合實際決策需求。',
  },
];

const WORK_SKILLS = [
  { title: '梳理複雜資訊', desc: '把散落、混亂的資料與流程，重構成可彈性擴張且易於管理' },
  { title: '資料分析詮釋', desc: '善於建立資料關係，並詮釋出可應用之架構' },
  { title: '制定專案策略', desc: '傾聽需求建立共識，以利專案執行與高品質產出' },
];

const AI_SKILLS = [
  { desc: '把描述性需求轉譯成可執行的 AI 協作框架' },
  { desc: '在流程中建立人類審核點，把關 AI 產出品質' },
  { desc: '應用場景涵蓋資料分析、格式辨識自動化、AI 輔助網站與原型開發' },
];

function SectionHeader({ index, zh, en }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
      <span className="ju-mono" style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--ju-text3)' }} aria-hidden="true">{index}</span>
      <h2 className="ju-serif" style={{ fontSize: 'clamp(22px, 3.4vw, 28px)', fontWeight: 500, margin: 0 }}>
        {zh}
        {en && <span className="ju-en" style={{ fontWeight: 500, fontSize: '0.6em', color: 'var(--ju-text3)', marginLeft: 12 }}>{en}</span>}
      </h2>
    </div>
  );
}

/* 技能特點：作品區與 AI 專區共用的三欄卡 */
function SkillGrid({ items }) {
  return (
    <div className="lp-skills" style={{ display: 'grid', gap: 14, margin: '0 0 40px' }}>
      {items.map((s, i) => (
        <div key={i} style={{ background: 'var(--ju-card)', border: '0.5px solid var(--ju-border)', borderRadius: 16, padding: '22px 24px' }}>
          {s.title && <div className="ju-sans" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>}
          <p className="ju-sans" style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ju-text2)', margin: 0 }}>{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* Landing 作品卡：精選作品與 AI 專區共用同一版式 */
function LandingWorkCard({ work, cover }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={`/work/${work.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      className="lp-card"
      style={{
        display: 'grid', gap: 0, textDecoration: 'none', color: 'inherit', overflow: 'hidden',
        background: 'var(--ju-card)', borderRadius: 20,
        border: `0.5px solid ${hov ? 'var(--ju-green)' : 'var(--ju-border)'}`,
        boxShadow: hov ? '0 16px 34px -18px rgba(40, 50, 25, 0.45)' : 'none',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'border-color .15s ease, box-shadow .2s ease, transform .2s ease',
      }}
    >
      <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', backgroundColor: 'var(--ju-surface)' }}>
        {cover && (
          <img
            src={cover} alt={work.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy" decoding="async"
          />
        )}
      </div>
      <div style={{ padding: 'clamp(20px, 3vw, 32px)', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <p className="ju-mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--ju-text3)', margin: 0, lineHeight: 1.8 }}>{work.meta}</p>
        <h3 className="ju-serif" style={{ fontSize: 'clamp(18px, 2.6vw, 22px)', lineHeight: 1.5, fontWeight: 500, margin: 0, color: hov ? 'var(--ju-green)' : 'var(--ju-text)', transition: 'color .15s ease' }}>
          {work.title}
        </h3>
        <p className="ju-sans" style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--ju-text2)', margin: 0 }}>{work.desc}</p>
        <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--ju-green)', borderBottom: '1px solid var(--ju-green)', paddingBottom: 3, alignSelf: 'flex-start' }}>
          查看完整案例 <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const [covers, setCovers] = useState({});

  useEffect(() => {
    document.title = '朱千慧作品集';
    fetchWorks()
      .then(works => {
        const map = {};
        works.forEach(w => { if (w?.coverImage) map[w.id] = w.coverImage; });
        setCovers(map);
      })
      .catch(() => {}); // 封面載不到時卡片以次表面色呈現，不擋文案
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56 }}>

      {/* 1. Hero */}
      <section style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 880, margin: '0 auto', padding: '48px 24px 32px', textAlign: 'center', boxSizing: 'border-box' }}>
        <p className="ju-mono" style={{ fontSize: 12, letterSpacing: '0.24em', color: 'var(--ju-text3)', margin: 0 }}>朱千慧　CINDY JU</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <span className="ju-sans" style={{ display: 'inline-block', background: 'var(--ju-green-bg)', color: 'var(--ju-green)', padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500 }}>
            五年乙方與多元專案經歷
          </span>
        </div>
        <h1 className="ju-sans" style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25, margin: '20px 0 0' }}>
          跨領域 UX 設計師
        </h1>
        <p className="ju-serif" style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 500, lineHeight: 1.6, margin: '28px 0 0', color: 'var(--ju-text)' }}>
          信任，是體驗與記憶的接軌
        </p>
        <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', margin: '36px 0 0' }}>
          曾任職　全能資訊有限公司（UX 設計師）
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 48, display: 'flex', justifyContent: 'center' }}>
          <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ju-green)', fontSize: 18 }}>↓</span>
        </div>
      </section>

      {/* 2. 定位論述 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 0' }}>
        <SectionHeader index="01" zh="AI 時代下，作為設計師的定位" />
        <div style={{ background: 'var(--ju-card)', border: '0.5px solid var(--ju-border)', borderRadius: 20, padding: 'clamp(28px, 5vw, 48px)' }}>
          <p className="ju-sans" style={{ fontSize: 16, lineHeight: 2, margin: 0 }}>
            我習慣在看似不相關的事物之間，找出底層共通的結構，不管是格式混亂的原始資料，還是分散各處的資訊邏輯，我會先把它轉譯成一套可以被執行、被複製的框架，再交給 AI 在框架裡延伸與執行。但延伸不會永遠準確，所以我在流程裡保留人的審核點，持續用真實結果校正框架本身。
          </p>
          <p className="ju-sans" style={{ fontSize: 16, lineHeight: 2, margin: '24px 0 0' }}>
            在這樣的協作裡，我的位置不是「被取代」或「取代 AI」的關係，而是負責觸發、定義邊界、把關品質的那個人。這是我認為 AI 時代的設計師需要具備的能力，不是比 AI 更會做，而是比 AI 更早知道要做什麼、怎麼判斷做得好不好。
          </p>
        </div>
      </section>

      {/* 3. 精選作品 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 0' }}>
        <SectionHeader index="02" zh="精選作品" en="Selected Works" />
        <SkillGrid items={WORK_SKILLS} />
        <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
          {SELECTED_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
        </div>
      </section>

      {/* 4. AI 專區 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 0' }}>
        <SectionHeader index="03" zh="AI 專區" en="Working with AI" />
        <p className="ju-sans" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>我的 AI 應用能力</p>
        <SkillGrid items={AI_SKILLS} />
        <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
          {AI_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
        </div>
      </section>

      {/* 5. CTA → /works */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(72px, 10vw, 120px) 24px 120px', textAlign: 'center' }}>
        <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--ju-text3)', margin: 0 }}>MORE WORKS · 完整 12 篇</p>
        <p className="ju-serif" style={{ fontSize: 'clamp(20px, 3.4vw, 28px)', fontWeight: 500, margin: '18px 0 0' }}>
          依主題瀏覽完整作品集
        </p>
        <Link
          to="/works"
          className="ju-sans lp-cta"
          style={{ display: 'inline-block', marginTop: 28, background: 'var(--ju-green)', color: 'var(--ju-on-green)', padding: '14px 30px', borderRadius: 999, fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'background .15s ease' }}
        >
          查看完整作品集
        </Link>
      </section>

      <BackToTop />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorks } from '../lib/data.js';
import BackToTop from '../components/BackToTop.jsx';
import HeroParticles from '../components/HeroParticles.jsx';

/* Landing 文案正本：作品集網站_Landing_Page文案初稿 v2.2。
   meta 一律「客戶｜專案名」格式（v2.2 拿掉日期，刻意不從資料拉）。 */

const SELECTED_WORKS = [
  {
    id: '37baa7a7-8108-8082-8a2b-cbd642c2b604',
    title: '高壓救災情境：降低視覺干擾以提升決策速度',
    meta: '新竹市消防局｜颱洪行動匯報系統 2.0',
    desc: '透過 User Flow 釐清消防員、指揮中心、里長、應變小組之間的資訊傳遞，依照實際救災情境，梳理出各使用者主要提供與接收的資訊。',
  },
  {
    id: '38aaa7a7-8108-8032-afed-c0ea0a972f94',
    title: 'AI 客服系統：建立使用者與 AI 之間的信任機制',
    meta: '華碩｜線上客服導入 AI 技術',
    desc: '與客服單位的訪談，將情境收斂為三種類型，依此架構設計出決策樹、AI+KM 客服、真人客服的三層架構，在 AI 無法接住用戶的需求時，也能夠有即時處理的機制。',
  },
  {
    id: '37baa7a7-8108-80c4-9f01-e003adfbf4df',
    title: '福利政策搜尋：降低思考選擇負擔，提升精準篩選機制',
    meta: '長穩基金會｜iFare 福利政策小幫手',
    desc: '以 Excel 原型快速測試各種搜尋角度，並透過收斂搜尋條件，讓使用者精準提供必要資料，且可快速找出符合資格與需求的福利政策。',
  },
];

const AI_WORKS = [
  {
    id: '38aaa7a7-8108-8028-9ebb-e750f4aa9fdf',
    title: '分析現有流程，協助導入 AI Agent',
    meta: '旻寬科技｜報價/議價 Agent',
    desc: '各廠商報價單格式不一，人工比對耗時且容易出錯。初期讓 AI 直接處理，實際產出與預期有落差；於是加入人類審核點並建立學習型同義詞庫，逐步提高辨識精準度。',
  },
  {
    id: '37baa7a7-8108-8021-b632-e36abbef5fcf',
    title: '透過 PRD 控管與 AI 進行協作',
    meta: '個人專案｜個人作品網站',
    desc: '我負責定義網站架構、內容邏輯與 PRD 規格，AI 依規格產出程式碼與初版介面，我再檢視、調整、回饋修正方向，你現在看到的網站，就是這個協作模式的產出結果。',
  },
  {
    id: '38aaa7a7-8108-8070-875c-f491ba76455c',
    title: 'AI 協助有效提升資料分析',
    meta: '資訊工業策進會｜115智慧雨林健康照護_資料庫',
    desc: '在需要快速閱讀多家廠商計劃書並產出精準報告，我負責描述預期的資料呈現方式與邏輯，AI 協助生成函式、建立分析表結構，我再檢查產出是否符合實際決策需求。',
  },
];

const WORK_SKILLS = [
  { icon: 'layers', title: '梳理複雜資訊', desc: '把散落、混亂的資料與流程，重構成可彈性擴張且易於管理' },
  { icon: 'chart',  title: '資料分析詮釋', desc: '善於建立資料關係，並詮釋出可應用之架構' },
  { icon: 'target', title: '制定專案策略', desc: '傾聽需求建立共識，以利專案執行與高品質產出' },
];

/* 技能區塊的線性 icon（森林綠單色，24px；純 inline SVG 無相依） */
function SkillIcon({ name }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--ju-green)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'layers') return (
    <svg {...common}><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M3 13l9 5 9-5" /><path d="M3 18l9 5 9-5" /></svg>
  );
  if (name === 'chart') return (
    <svg {...common}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></svg>
  );
  if (name === 'collab') return (
    <svg {...common}><circle cx="9" cy="12" r="6" /><circle cx="15" cy="12" r="6" /></svg>
  );
  if (name === 'shield') return (
    <svg {...common}><path d="M12 3l7 3v5c0 4.4-2.9 7.6-7 9-4.1-1.4-7-4.6-7-9V6l7-3Z" /><path d="M9 12l2 2 4-4" /></svg>
  );
  if (name === 'flow') return (
    <svg {...common}><circle cx="4.5" cy="12" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="19.5" cy="12" r="2.2" /><path d="M6.7 12h3.1M14.2 12h3.1" /></svg>
  );
  return (
    <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
  );
}

const AI_SKILLS = [
  { icon: 'collab', title: '人機協作', desc: '透過撰寫專案 PRD 與 AI 進行專案發想、研究、設計。' },
  { icon: 'shield', title: 'AI 品質管控', desc: '前期可建立多項審核點，後期可建立審核標準。' },
  { icon: 'flow',   title: 'AI 導入流程', desc: '針對使用頻率高、可標準化、例外狀況多之情境進行導入。' },
];

/* 段標：綠色短標記（單一品牌 tick，非編號鷹架、非 mono eyebrow）+ 襯線標題 */
function SectionHeader({ zh, en }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <span aria-hidden="true" style={{ display: 'block', width: 28, height: 3, borderRadius: 999, background: 'var(--ju-green)', marginBottom: 18 }} />
      <h2 className="ju-serif" style={{ fontSize: 'clamp(28px, 4.6vw, 42px)', fontWeight: 500, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
        {zh}
        {en && <span className="ju-en" style={{ fontWeight: 500, fontSize: '0.5em', color: 'var(--ju-text2)', marginLeft: 14, letterSpacing: '0.02em' }}>{en}</span>}
      </h2>
    </div>
  );
}

/* 技能特點：去框的編列式三欄（上緣細線分隔，消除重複卡片牆） */
function SkillGrid({ items }) {
  return (
    <div className="lp-skills" style={{ display: 'grid', gap: '0 40px', margin: '0 0 40px' }}>
      {items.map((s, i) => (
        <div key={i} style={{ padding: '22px 0 4px', borderTop: '1px solid var(--ju-border)' }}>
          {s.icon && <div style={{ marginBottom: 12 }}><SkillIcon name={s.icon} /></div>}
          {s.title && <div className="ju-sans" style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>}
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
        border: `1px solid ${hov ? 'var(--ju-green)' : 'var(--ju-border-card)'}`,
        boxShadow: hov ? 'var(--ju-shadow-hover)' : 'var(--ju-shadow-rest)',
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

      {/* 1. Hero — 置中構圖（3jigen 式：巨大標語 + 間隔字距副標 + 垂直細線導引）+ 粒子流場 */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'min(92vh, 820px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px 110px', boxSizing: 'border-box', textAlign: 'center' }}>
        <HeroParticles />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 960, margin: '0 auto' }}>
          <p className="ju-mono" style={{ fontSize: 'clamp(14px, 1.6vw, 16px)', letterSpacing: '0.3em', color: 'var(--ju-text)', margin: 0 }}>
            朱千慧　CINDY JU
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
            <span className="ju-sans" style={{ display: 'inline-block', background: 'var(--ju-green-bg)', color: 'var(--ju-green)', padding: '9px 22px', borderRadius: 999, fontSize: 'clamp(14px, 1.6vw, 16px)', fontWeight: 500 }}>
              五年乙方與多元專案經歷
            </span>
          </div>
          <h1 className="ju-sans" style={{ fontSize: 'clamp(44px, 8.5vw, 88px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '40px 0 0', textWrap: 'balance' }}>
            跨領域 UX 設計師
          </h1>
          <p className="ju-serif" style={{ fontSize: 'clamp(20px, 3.2vw, 30px)', fontWeight: 500, lineHeight: 1.6, letterSpacing: '0.14em', margin: '34px 0 0', color: 'var(--ju-text)' }}>
            信任，是體驗與記憶的接軌
          </p>
          <p className="ju-sans" style={{ fontSize: 15, color: 'var(--ju-text2)', margin: '44px 0 0' }}>
            曾任職　全能資訊有限公司（UX 設計師）
          </p>
        </div>
        {/* 3jigen 式捲動導引：自中央垂下的細直線 */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 0, width: 1, height: 88, background: 'var(--ju-green)', opacity: 0.55, zIndex: 1 }} />
      </section>

      {/* 2. 定位論述 — Forest Panel（全幅綠帶，綠撐面主視覺；紙色襯線反白） */}
      <section style={{ background: 'var(--ju-green)', color: 'var(--ju-on-green)', padding: 'clamp(64px, 11vw, 132px) 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span aria-hidden="true" style={{ display: 'block', width: 28, height: 3, borderRadius: 999, background: 'var(--ju-on-green-2)', marginBottom: 22 }} />
          <h2 className="ju-serif" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 500, lineHeight: 1.5, margin: 0, color: 'var(--ju-on-green)' }}>
            AI 時代下，作為設計師的定位
          </h2>
          <p className="ju-sans" style={{ fontSize: 'clamp(16px, 1.5vw, 18px)', lineHeight: 2.1, margin: '32px 0 0', color: 'var(--ju-on-green)' }}>
            在技術快速發展時代，每天都有新技術、新資訊，而設計師更是需要保持學習心態，擁抱接納不同時代下的變化。但對我來說，AI 技術像是增強人類的技能，讓設計師的創意能夠實際落實，回到設計師作為 maker 的本質。
          </p>
          <p className="ju-sans" style={{ fontSize: 'clamp(16px, 1.5vw, 18px)', lineHeight: 2.1, margin: '26px 0 0', color: 'var(--ju-on-green)' }}>
            我擅長在繁雜的事物之間，找出底層共通的結構，轉譯成一套可以被執行、被複製的框架，這不只能應用在概念詮釋，更能夠將使用者研究、資料架構、設計流程等方法能夠落地應用。這些簡單的思考架構，是經過多方面的知識與資訊柔和，提煉與驗證而來的。
          </p>
        </div>
      </section>

      {/* 3. 精選作品 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 0' }}>
        <SectionHeader zh="精選作品" en="Selected Works" />
        <SkillGrid items={WORK_SKILLS} />
        <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
          {SELECTED_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
        </div>
      </section>

      {/* 4. AI 專區 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 0' }}>
        <SectionHeader zh="AI 專區" en="Working with AI" />
        <p className="ju-sans" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>AI 應用能力</p>
        <SkillGrid items={AI_SKILLS} />
        <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
          {AI_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
        </div>
      </section>

      {/* 5. CTA → /works（綠色收尾帶：圓角綠面板 + 反白按鈕） */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(64px, 9vw, 112px) 24px 120px' }}>
        <div style={{ background: 'var(--ju-green)', color: 'var(--ju-on-green)', borderRadius: 24, padding: 'clamp(48px, 8vw, 88px) 24px', textAlign: 'center' }}>
          <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--ju-on-green-2)', margin: 0 }}>MORE WORKS · 完整 12 篇</p>
          <p className="ju-serif" style={{ fontSize: 'clamp(20px, 3.4vw, 28px)', fontWeight: 500, margin: '18px 0 0', color: 'var(--ju-on-green)' }}>
            依主題瀏覽完整作品集
          </p>
          <Link
            to="/works"
            className="ju-sans lp-cta-invert"
            style={{ display: 'inline-block', marginTop: 28, background: 'var(--ju-on-green)', color: 'var(--ju-green)', padding: '14px 30px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'background .15s ease' }}
          >
            查看完整作品集
          </Link>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}

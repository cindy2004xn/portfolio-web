import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorks } from '../lib/data.js';
import BackToTop from '../components/BackToTop.jsx';
import HeroCircle from '../components/HeroCircle.jsx';

/* Landing 版面正本：DESIGN.md v3.2「灰階畫布」——
   hero 依她提供的示意圖：白噴點粒子圓置頂（頂部出血裁切）、圓內手寫簽名、
   pill 經歷徽章、英文粗黑主標「UX Designer」、中央垂線導引；
   定位論述收進扁平深色卡（左文右圓形人像）；
   襯線全站退場（只留作品內頁 Notion 內文）；卡片一律扁平深色。
   文案 meta 仍守 v2.2：「客戶｜專案名」無日期。 */

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

/* 技能卡的線性 icon（近白單色，24px；純 inline SVG 無相依） */
function SkillIcon({ name }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--ju-text2)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
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

/* 區塊開場列（統一文法）：左「標記＋標題」、右側可掛次要動作 */
function SectionHeader({ zh, en, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px 24px', marginBottom: 36 }}>
      <div>
        <span aria-hidden="true" style={{ display: 'block', width: 28, height: 3, borderRadius: 999, background: 'var(--ju-accent)', marginBottom: 18 }} />
        <h2 className="ju-sans" style={{ fontSize: 'clamp(26px, 3.6vw, 40px)', fontWeight: 700, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          {zh}
          {en && <span className="ju-en" style={{ fontWeight: 500, fontSize: '0.5em', color: 'var(--ju-text2)', marginLeft: 14, letterSpacing: '0.02em' }}>{en}</span>}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* 技能卡（banking 參考圖節奏）：標題在上、內文在中、icon 沉左下；
   字級拉開主次——標題 18/600 近白滿對比、內文 15/1.85 text2 */
function SkillGrid({ items }) {
  return (
    <div className="lp-skills" style={{ display: 'grid', gap: 16, margin: '0 0 40px' }}>
      {items.map((s, i) => (
        <div key={i} className="lp-flat" style={{ borderRadius: 16, padding: '24px 24px 20px', display: 'flex', flexDirection: 'column' }}>
          <div className="ju-sans" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ju-text)', lineHeight: 1.4 }}>{s.title}</div>
          <p className="ju-sans" style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--ju-text2)', margin: '12px 0 0' }}>{s.desc}</p>
          <div style={{ marginTop: 'auto', paddingTop: 18 }}>{s.icon && <SkillIcon name={s.icon} />}</div>
        </div>
      ))}
    </div>
  );
}

/* 圓形大頭照：素材檔她之後提供（放 public/portrait.jpg 即自動生效），
   檔案不存在時顯示中性佔位圓 */
function Portrait() {
  const [ok, setOk] = useState(true);
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 320, aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', background: 'var(--ju-card2)', border: '1px solid var(--ju-border)', margin: '0 auto' }}>
      {ok ? (
        <img
          src="/portrait.png"
          alt="朱千慧個人照"
          onError={() => setOk(false)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
          <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ju-text3)' }}>PORTRAIT</span>
        </div>
      )}
    </div>
  );
}

/* Landing 作品卡：扁平深色面（圖左文右），精選作品與 AI 專區共用 */
function LandingWorkCard({ work, cover }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={`/work/${work.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      className="lp-card lp-flat"
      style={{
        display: 'grid', gap: 0, textDecoration: 'none', color: 'inherit', overflow: 'hidden',
        borderRadius: 20,
        borderColor: hov ? 'rgba(244, 243, 239, 0.32)' : undefined,
        transform: hov ? 'translateY(-4px)' : 'none',
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
        <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text3)', margin: 0, lineHeight: 1.8 }}>{work.meta}</p>
        <h3 className="ju-sans" style={{ fontSize: 'clamp(19px, 2.4vw, 24px)', lineHeight: 1.5, fontWeight: 600, margin: 0, color: 'var(--ju-text)' }}>
          {work.title}
        </h3>
        <p className="ju-sans" style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--ju-text2)', margin: 0 }}>{work.desc}</p>
        <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--ju-text)', borderBottom: `1px solid ${hov ? 'var(--ju-text)' : 'var(--ju-border-card)'}`, paddingBottom: 3, alignSelf: 'flex-start', transition: 'border-color .15s ease' }}>
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
    <div style={{ minHeight: '100vh' }}>

      {/* 連續畫布的脊椎：兩條垂直導引線全頁貫穿（窄視窗自動隱藏） */}
      <div className="lp-rail lp-rail--left" aria-hidden="true" />
      <div className="lp-rail lp-rail--right" aria-hidden="true" />

      {/* 1. Hero（Figma 255-2 版）——大圓圓心在視窗上方外，只露出下半弧（亮區自頂端灑下、
          噴點在弧緣）；整個圓含簽名緩慢上下漂浮（.lp-float）。
          簽名＝Caveat 英文行＋真跡 signature.png（multiply 疊白圓，免去背）。
          置中直落：pill → UX Designer → 信任句 → 垂線導引 */}
      <section style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '0 24px' }}>
        {/* flex 置中允許圓比視窗寬時左右均勻出血；負邊距把圓心推到視窗上方外 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="lp-float" style={{ position: 'relative', flex: '0 0 auto', width: 'min(120vw, 880px)', aspectRatio: '1', marginTop: 'calc(min(120vw, 880px) / -2.4)' }}>
            <HeroCircle />
            {/* 簽名落在可見亮區（容器垂直中心≈區塊頂端下方一點）；延遲進場等圓盤亮起 */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '16%', boxSizing: 'border-box', pointerEvents: 'none' }}>
              <span className="ju-hand-en lp-fade-up" style={{ animationDelay: '1.1s', fontSize: 'clamp(20px, 2.8vw, 30px)', color: '#141414', lineHeight: 1.3 }}>
                Hi, I'm Cindy Ju
              </span>
              <img
                className="lp-fade-up"
                src="/signature.png"
                alt="朱千慧 手寫簽名"
                style={{ animationDelay: '1.3s', width: 'clamp(180px, 26vw, 280px)', marginTop: 2, mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
        </div>
        <div className="lp-fade-up" style={{ animationDelay: '0.3s', display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <span className="ju-sans" style={{ display: 'inline-block', background: 'var(--ju-accent-bg)', color: 'var(--ju-text)', padding: '9px 20px', borderRadius: 999, fontSize: 'clamp(14px, 1.6vw, 16px)', fontWeight: 500, border: '1px solid var(--ju-border)' }}>
            5 年乙方與多元專案經驗
          </span>
        </div>
        <h1 className="ju-sans ju-en lp-fade-up" style={{ animationDelay: '0.45s', fontSize: 'clamp(40px, 5.8vw, 58px)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, margin: '26px 0 0' }}>
          UX Designer
        </h1>
        <p className="ju-sans lp-fade-up" style={{ animationDelay: '0.6s', fontSize: 'clamp(17px, 2vw, 22px)', fontWeight: 700, margin: '18px 0 0', color: 'var(--ju-text)' }}>
          信任，是體驗與記憶的接軌
        </p>
        {/* 中央垂線導引：自標題下方垂入定位卡 */}
        <div aria-hidden="true" style={{ width: 1, height: 'clamp(120px, 18vh, 190px)', background: 'rgba(244, 243, 239, 0.35)', margin: '56px auto 0' }} />
      </section>

      {/* 2. 定位論述 — 扁平深色卡：左「What make me different」＋內文、右圓形人像 */}
      <section className="lp-section" style={{ paddingTop: 'clamp(40px, 5vw, 64px)' }}>
        <div className="lp-container">
          <div className="lp-flat lp-about" style={{ borderRadius: 24, padding: 'clamp(28px, 5vw, 56px)', display: 'grid', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center' }}>
            <div>
              <h2 className="ju-sans ju-en" style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                What make me different
              </h2>
              <p className="ju-sans" style={{ fontSize: 15, lineHeight: 2, margin: '26px 0 0', color: 'rgba(244, 243, 239, 0.82)' }}>
                在技術快速發展時代，每天都有新技術、新資訊，而設計師更是需要保持學習心態，擁抱接納不同時代下的變化。但對我來說，AI 技術像是增強人類的技能，讓設計師的創意能夠實際落實，回到設計師作為 maker 的本質。
              </p>
              <p className="ju-sans" style={{ fontSize: 15, lineHeight: 2, margin: '18px 0 0', color: 'rgba(244, 243, 239, 0.82)' }}>
                我擅長在繁雜的事物之間，找出底層共通的結構，轉譯成一套可以被執行、被複製的框架，這不只能應用在概念詮釋，更能夠將使用者研究、資料架構、設計流程等方法能夠落地應用。這些簡單的思考架構，是經過多方面的知識與資訊柔和，提煉與驗證而來的。
              </p>
            </div>
            <Portrait />
          </div>
        </div>
      </section>

      {/* 3. 精選作品 */}
      <section className="lp-section">
        <div className="lp-container">
          <SectionHeader
            zh="精選作品"
            en="Selected Works"
            action={
              <Link to="/works" className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--ju-text)', textDecoration: 'none', borderBottom: '1px solid var(--ju-border-card)', paddingBottom: 3 }}>
                查看全部 <span aria-hidden="true">→</span>
              </Link>
            }
          />
          <SkillGrid items={WORK_SKILLS} />
          <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
            {SELECTED_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
          </div>
        </div>
      </section>

      {/* 4. AI 專區 */}
      <section className="lp-section">
        <div className="lp-container">
          <SectionHeader zh="AI 專區" en="Working with AI" />
          <p className="ju-sans" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>AI 應用能力</p>
          <SkillGrid items={AI_SKILLS} />
          <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
            {AI_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
          </div>
        </div>
      </section>

      {/* 5. 全幅收尾段 → /works */}
      <section className="lp-section" style={{ paddingBottom: 140 }}>
        <div className="lp-container" style={{ borderTop: '1px solid var(--ju-border)', paddingTop: 'var(--ju-section-pad)', textAlign: 'center' }}>
          <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.24em', color: 'var(--ju-text3)', margin: 0 }}>MORE WORKS · 完整 12 篇</p>
          <p className="ju-sans" style={{ fontSize: 'clamp(28px, 4.2vw, 46px)', fontWeight: 700, margin: '22px 0 0', lineHeight: 1.4, color: 'var(--ju-text)', textWrap: 'balance', letterSpacing: '-0.01em' }}>
            依主題瀏覽完整作品集
          </p>
          <Link
            to="/works"
            className="ju-sans lp-cta"
            style={{ display: 'inline-block', marginTop: 36, background: 'var(--ju-accent)', color: 'var(--ju-on-accent)', padding: '15px 34px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'background .15s ease' }}
          >
            查看完整作品集
          </Link>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}

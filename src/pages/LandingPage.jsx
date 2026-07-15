import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorks } from '../lib/data.js';
import BackToTop from '../components/BackToTop.jsx';
import Footer from '../components/Footer.jsx';
import HeroCircle from '../components/HeroCircle.jsx';
import NoiseDefs from '../components/NoiseDefs.jsx';
import Glow from '../components/Glow.jsx';

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

/* 技能卡的線性 icon（近白單色，24px；純 inline SVG 無相依）。
   只服務 AI 區的三張卡——精選作品的技能卡在 Figma 已不存在，隨之退場。 */
function SkillIcon({ name }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--ju-text2)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
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

/* 專業證書區（Figma 266:269 / 266:279 / 266:274）。
   文案取自 Figma 稿；課程卡圖片與 Medium 連結尚無素材，先留佔位。 */
const COURSES = [
  {
    title: 'Level 1｜金融科技產業地圖基礎課程',
    desc: '臺灣金融科技協會規劃推出 FinTech Academy 金融科技產業學院，以「金融科技產業地圖」為核心，從 AI、保險科技、區塊鏈與虛擬資產，到金融資安、詐欺防治與監理科技，金融業與科技業都需要更快掌握趨勢，理解監理方向，並了解技術如何真正落地到產業應用。',
  },
  {
    title: 'UBC｜UX Book Club Taiwan',
    desc: '為期半年的 Google UX 課程讀書會，並完成各階段執行項目，如使用者研究、wireframe、mockup、prototype 等相關設計知識學習與討論。',
  },
];

/* TODO：待她提供文章標題與 Medium 網址後替換 href 與 title */
const COURSE_NOTES = [
  { title: '課程心得名稱', href: '#' },
  { title: '課程心得名稱', href: '#' },
];

/* 區塊開場列（Figma 266:253/266:256 文法）：英文小標在上、中文大標在下。
   v3.2 的 28×3 accent 短標記與右側次要動作在 Figma 已不存在，一併退場。 */
function SectionHeader({ zh, en }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {en && (
        <span className="ju-en" style={{ display: 'block', fontSize: 16, fontWeight: 400, color: 'var(--ju-text2)', letterSpacing: '0.02em', marginBottom: 8 }}>
          {en}
        </span>
      )}
      <h2 className="ju-sans" style={{ fontSize: 'clamp(26px, 3.6vw, 40px)', fontWeight: 700, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', textWrap: 'balance' }}>
        {zh}
      </h2>
    </div>
  );
}

/* 技能卡（Figma 277:267）：icon → 標題 → 內文，由上而下。
   v3.3 的扁平深色卡退場——稿上沒有容器，內容直接落在畫布上。
   icon 與內文維持系統值（24px／--ju-text2）；只有標題升到 20px 與排版依稿調整。 */
function SkillGrid({ items }) {
  /* 下邊距刻意大於作品卡彼此的間距（clamp(24,4vw,40)）——技能卡的框拿掉後，
     它跟下方的卡片牆之間沒有任何視覺分隔，同樣的間距會讓它讀起來像卡片牆的一員 */
  return (
    <div className="lp-skills" style={{ display: 'grid', margin: '0 0 clamp(64px, 8vw, 96px)' }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
          {s.icon && <SkillIcon name={s.icon} />}
          <div className="ju-sans" style={{ fontSize: 20, fontWeight: 600, color: 'var(--ju-text)', lineHeight: 1.4, marginTop: 12 }}>{s.title}</div>
          <p className="ju-sans" style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--ju-text2)', margin: '28px 0 0' }}>{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* 圓形大頭照。Figma 274:126 是 171px 置中在定位論述上方。
   11.88vw = 171/1440；下限 120 讓行動版不至於小到看不出是誰。
   檔案不存在時顯示中性佔位圓 */
function Portrait() {
  const [ok, setOk] = useState(true);
  return (
    <div style={{ position: 'relative', width: 'clamp(120px, 11.88vw, 171px)', aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', background: 'var(--ju-card2)', border: '1px solid var(--ju-border)', margin: '0 auto', flex: '0 0 auto' }}>
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

/* 課程卡（Figma 1059×384）：左文右圖。圖片素材未到，先以次表面佔位。 */
function CourseCard({ title, desc }) {
  return (
    <div className="lp-course" style={{ display: 'grid', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'start', marginBottom: 'clamp(28px, 4vw, 40px)' }}>
      <div>
        <h3 className="ju-sans" style={{ fontSize: 'clamp(19px, 2.4vw, 24px)', fontWeight: 600, margin: 0, lineHeight: 1.5, textWrap: 'balance' }}>
          {title}
        </h3>
        <p className="ju-sans" style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--ju-text2)', margin: '20px 0 0' }}>
          {desc}
        </p>
      </div>
      <div
        aria-hidden="true"
        style={{ aspectRatio: '579 / 384', borderRadius: 20, background: 'var(--ju-surface)', border: '1px solid var(--ju-border)' }}
      />
    </div>
  );
}

/* 課程心得列（Figma 1059×105）：整列可點，連往 Medium。
   href 尚為佔位，暫不開新分頁；素材到位後改 target="_blank" + rel="noopener noreferrer"。 */
function CourseNote({ title, href }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      className="lp-flat"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        padding: '32px 28px', borderRadius: 16, textDecoration: 'none', color: 'inherit',
        borderColor: hov ? 'rgba(244, 243, 239, 0.32)' : undefined,
      }}
    >
      <span className="ju-sans" style={{ fontSize: 'clamp(17px, 2vw, 20px)', fontWeight: 600 }}>{title}</span>
      <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--ju-text)', whiteSpace: 'nowrap' }}>
        查看完整內容 <span aria-hidden="true">→</span>
      </span>
    </a>
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

      {/* SVG 濾鏡定義：Hero 圓與光暈共用，必須在使用前掛載 */}
      <NoiseDefs />

      {/* 1. Hero — 正本 Figma 266-175。
          圓心在視窗上方外（-84），只露下半弧；pill 底緣貼齊圓底（398），
          這個重疊是稿上的設計，也是第一屏能露出定位卡 128px 的關鍵。
          置中直落：簽名 → pill → UX Designer → 信任句 → 垂線導引 → 定位卡露頭。
          幾何全部由 --ju-hero-d 推導，見 index.css。 */}
      <section
        className="lp-hero"
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: 'calc(var(--ju-hero-d) * 0.3537) 24px 42px',
          /* 圓在窄視窗會比視窗寬（出血是刻意的），不裁會產生橫向捲動。
             用 clip 不用 hidden：hidden 會讓 y 軸隱含變 auto、把 section 變成捲動容器。 */
          overflowX: 'clip',
        }}
      >
        {/* 圓與簽名一起浮動：簽名是寫在圓上的，分開浮會穿幫 */}
        <div
          className="lp-float"
          style={{
            position: 'absolute',
            width: 'var(--ju-hero-s)',
            height: 'var(--ju-hero-s)',
            left: 'calc(50% - var(--ju-hero-s) / 2 - var(--ju-hero-d) * 0.0114)',
            top: 'calc(var(--ju-hero-d) * -0.6908)',
            pointerEvents: 'none',
          }}
        >
          <HeroCircle />
          {/* 簽名落在圓的可見亮區：Figma 的 y=97 相對圓容器 = (97+666)/1164 = 65.5%。
              max() 是行動版的保命：簽名位置 = 0.1×D，D 小時會鑽進 header（56px）底下，
              補足到 72px。桌機 D=964 時算出來是負值，max 取 0，等於沒作用。 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 'calc(65.5% + max(0px, 72px - var(--ju-hero-d) * 0.1))',
              boxSizing: 'border-box',
            }}
          >
            <span
              className="ju-hand-en lp-fade-up"
              style={{ animationDelay: '1.1s', fontSize: 'clamp(14px, 1.39vw, 20px)', color: 'var(--ju-on-accent)', lineHeight: 1.3 }}
            >
              Hi, I'm Cindy Ju
            </span>
            {/* 寬度上限由可用垂直空間反推，見 index.css 的 --ju-sig-w */}
            <img
              className="lp-fade-up"
              src="/signature.png"
              alt="朱千慧 手寫簽名"
              style={{ animationDelay: '1.3s', width: 'var(--ju-sig-w)', marginTop: 2, mixBlendMode: 'multiply' }}
            />
          </div>
        </div>

        {/* pill／主標／信任句：Figma Frame 1773，flex column gap 27 */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 27 }}>
          <span
            className="ju-sans lp-fade-up"
            style={{
              animationDelay: '0.3s',
              background: 'var(--ju-pill-bg)',
              border: '1px solid var(--ju-pill-border)',
              color: 'var(--ju-text)',
              padding: '14px 28px',
              borderRadius: 50,
              fontSize: 'clamp(16px, 1.67vw, 24px)',
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            5 年乙方與多元專案經驗
          </span>
          <h1
            className="ju-sans lp-fade-up"
            style={{ animationDelay: '0.45s', fontSize: 'clamp(40px, 4.44vw, 64px)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}
          >
            UX Designer
          </h1>
          <p
            className="ju-sans lp-fade-up"
            style={{ animationDelay: '0.6s', fontSize: 'clamp(20px, 2.22vw, 32px)', fontWeight: 700, margin: 0, lineHeight: 1.2 }}
          >
            信任，是體驗與記憶的接軌
          </p>
        </div>

        {/* 中央垂線導引：Figma y=613→796，距信任句 46px */}
        <div
          aria-hidden="true"
          style={{ position: 'relative', width: 1, height: 183, background: 'var(--ju-hairline)', margin: '46px auto 0' }}
        />
      </section>

      {/* 2. 定位論述 — 置中直落：人像在上、標題置中、內文左對齊（Figma 274:126 + 274:121）。
          v3.3 的扁平深色卡退場——稿上內容直接落在畫布上，沒有容器。
          文字樣式（字級／行高／明度）維持系統值，只有排版與人像尺寸依稿調整。 */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div className="lp-container">
          <Portrait />
          {/* 人像底到標題 35px（Figma：人像 869–1040、標題 1075） */}
          <div className="lp-about-text" style={{ marginTop: 35 }}>
            <h2 className="ju-sans ju-en" style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', textAlign: 'center' }}>
              What make me different
            </h2>
            {/* 長中文置中會難讀，稿上也是左對齊——標題置中、內文左對齊是刻意的混合 */}
            <p className="ju-sans" style={{ fontSize: 15, lineHeight: 2, margin: '31px 0 0', color: 'rgba(244, 243, 239, 0.82)' }}>
              在技術快速發展時代，每天都有新技術、新資訊，而設計師更是需要保持學習心態，擁抱接納不同時代下的變化。但對我來說，AI 技術像是增強人類的技能，讓設計師的創意能夠實際落實，回到設計師作為 maker 的本質。
            </p>
            <p className="ju-sans" style={{ fontSize: 15, lineHeight: 2, margin: '26px 0 0', color: 'rgba(244, 243, 239, 0.82)' }}>
              我擅長在繁雜的事物之間，找出底層共通的結構，轉譯成一套可以被執行、被複製的框架，這不只能應用在概念詮釋，更能夠將使用者研究、資料架構、設計流程等方法能夠落地應用。這些簡單的思考架構，是經過多方面的知識與資訊柔和，提煉與驗證而來的。
            </p>
          </div>
        </div>
      </section>

      {/* 3. 精選作品 */}
      <section className="lp-section">
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="60%" />
        <div className="lp-container">
          <SectionHeader zh="精選作品" en="Selected works" />
          <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
            {SELECTED_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
          </div>
        </div>
      </section>

      {/* 4. AI 相關應用 */}
      <section className="lp-section">
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="65%" />
        <div className="lp-container">
          <SectionHeader zh="AI 相關應用" en="Working with AI" />
          <SkillGrid items={AI_SKILLS} />
          <div style={{ display: 'grid', gap: 'clamp(24px, 4vw, 40px)' }}>
            {AI_WORKS.map(w => <LandingWorkCard key={w.id} work={w} cover={covers[w.id]} />)}
          </div>
        </div>
      </section>

      {/* 5. 專業證書 —— Figma 順序：課程卡 → 課程心得列表 → 課程卡 */}
      <section className="lp-section">
        <Glow size={894} align="left" top="var(--ju-section-pad)" />
        <Glow size={1038} align="right" top="65%" />
        <div className="lp-container">
          <SectionHeader zh="專業證書" en="Courses" />
          <CourseCard {...COURSES[0]} />
          {/* 課程心得小標（Figma 268:2）——只存在於 255-2，266-175 那版沒有 */}
          <p className="ju-sans" style={{ fontSize: 20, fontWeight: 400, letterSpacing: '1px', color: 'var(--ju-text)', margin: '0 0 20px' }}>
            課程心得
          </p>
          <div style={{ display: 'grid', gap: 12, margin: '0 0 clamp(28px, 4vw, 40px)' }}>
            {COURSE_NOTES.map((n, i) => <CourseNote key={i} {...n} />)}
          </div>
          <CourseCard {...COURSES[1]} />
        </div>
      </section>

      {/* 6. 全幅收尾段 → /works（paddingBottom = Figma 的 CTA 到 footer 距離 322） */}
      <section className="lp-section" style={{ paddingBottom: 'clamp(120px, 22.4vw, 322px)' }}>
        {/* 光暈圓心對齊「探索更多作品」的文字中心（Figma：光暈 7144 vs 文字中心 7143.5）。
            不能用 50%——那是 section 的中點，會隨 paddingBottom 浮動。
            算式＝ section 內距 + container 內距 + 半個標題高。 */}
        <Glow size={844} align="center" top="calc(var(--ju-section-pad) * 2 + clamp(28px, 4.44vw, 64px) * 0.7)" />
        <div className="lp-container" style={{ paddingTop: 'var(--ju-section-pad)', textAlign: 'center' }}>
          <p className="ju-sans" style={{ fontSize: 'clamp(28px, 4.44vw, 64px)', fontWeight: 700, margin: 0, lineHeight: 1.4, color: 'var(--ju-text)', textWrap: 'balance', letterSpacing: '-0.01em' }}>
            探索更多作品
          </p>
          <Link
            to="/works"
            className="ju-sans lp-cta"
            style={{ display: 'inline-block', marginTop: 36, background: 'var(--ju-accent)', color: 'var(--ju-on-accent)', padding: '15px 34px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'background .15s ease' }}
          >
            前往探索 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Footer />

      <BackToTop />
    </div>
  );
}

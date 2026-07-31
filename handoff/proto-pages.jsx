/* 頁面:首頁(瀑布流 + 無限捲動 + fix 搜尋列) + 作品內頁(Blog 閱讀) */

const P_BATCH_INITIAL = 6;
const P_BATCH_MORE = 4;

function PHomePage({ selected, onApply, filtered, onOpen, tweaks }) {
  const cols = tweaks.isMobile ? 1 : tweaks.columns;
  const [visibleCount, setVisibleCount] = React.useState(P_BATCH_INITIAL);
  const [stuck, setStuck] = React.useState(false);
  const searchRef = React.useRef(null);
  const sentinelRef = React.useRef(null);

  /* 篩選變動 → 重設批次 */
  React.useEffect(() => { setVisibleCount(P_BATCH_INITIAL); }, [filtered]);

  /* 無限捲動:sentinel 進入視窗就載入更多 */
  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(c => Math.min(c + P_BATCH_MORE, filtered.length));
      }
    }, { rootMargin: '320px' });
    io.observe(node);
    return () => io.disconnect();
  }, [filtered, visibleCount]);

  /* 搜尋列 fix 在 header 下緣時加 hairline */
  React.useEffect(() => {
    const f = () => {
      if (searchRef.current) setStuck(searchRef.current.getBoundingClientRect().top <= 56);
    };
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  const visible = filtered.slice(0, visibleCount);
  const buckets = pDistributeMasonry(visible, cols);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      {/* Hero */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(48px, 8vw, 88px) 24px 0', textAlign: 'center' }}>
        <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', margin: 0, letterSpacing: '0.02em' }}>Hi, I'm Chain Huei Ju</p>
        <h1 className="ju-serif p-hero-title" style={{ margin: '18px 0 0', fontWeight: 500 }}>
          尋找 <PRotatingTag tags={P_TAGS} lockedTag={selected[0] ?? null} /> 的作品
        </h1>
      </section>

      {/* 搜尋:滾動時 sticky 在 header 下緣(行動版由吸底列接手) */}
      <section
        ref={searchRef}
        className="p-search-inline p-search-sticky"
        style={{ borderBottom: stuck ? '0.5px solid var(--ju-border)' : '0.5px solid transparent' }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <PSearchPanel applied={selected} onApply={onApply} />
        </div>
      </section>

      {/* 結果數 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '28px 24px 0' }}>
        <PCountDivider>
          {selected.length > 0 ? `${selected.join(' + ')} · ${filtered.length} 件` : `全部作品 · ${filtered.length} 件`}
        </PCountDivider>
      </section>

      {/* 作品列表:固定欄寬瀑布流 */}
      <main style={{ maxWidth: cols === 3 ? 1080 : 880, margin: '0 auto', padding: '40px 24px 64px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', margin: 0 }}>目前沒有符合的作品，試試其他關鍵字？</p>
            <button onClick={() => onApply([])} className="ju-mono" style={{ marginTop: 20, height: 40, padding: '0 20px', background: 'transparent', border: '0.5px solid var(--ju-green)', borderRadius: 8, color: 'var(--ju-green)', fontSize: 11, letterSpacing: '0.14em', cursor: 'pointer' }}>
              清除篩選
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'clamp(24px, 4vw, 40px)', alignItems: 'start' }}>
            {buckets.map((bucket, k) => (
              <div key={k} style={{ display: 'grid', gap: 'clamp(40px, 6vw, 56px)', alignContent: 'start' }}>
                {bucket.map(w => <PWorkCard key={w.id} work={w} i={P_WORKS.findIndex(x => x.id === w.id)} onOpen={onOpen} />)}
              </div>
            ))}
          </div>
        )}

        {/* 無限捲動 sentinel / 頁尾 */}
        {hasMore ? (
          <div ref={sentinelRef} style={{ textAlign: 'center', padding: '48px 0 0' }}>
            <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ju-text3)' }}>載入更多…</span>
          </div>
        ) : filtered.length > 0 && (
          <footer style={{ padding: '72px 0 96px', textAlign: 'center' }}>
            <PCountDivider>已是全部 {filtered.length} 件作品</PCountDivider>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="ju-mono"
              style={{ marginTop: 28, height: 42, padding: '0 22px', background: 'transparent', border: '0.5px solid var(--ju-green)', borderRadius: 999, color: 'var(--ju-green)', fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer' }}
            >
              回到最頂端 ↑
            </button>
          </footer>
        )}
      </main>
    </div>
  );
}

/* ——— 內頁:Blog 文章閱讀 ——— */
function PArticle({ lineHeight }) {
  return (
    <article className="p-article" style={{ '--p-lh': lineHeight }}>
      {P_ARTICLE.map((b, i) => {
        if (b.type === 'h2') return <h2 key={i} className="ju-serif">{b.text}</h2>;
        if (b.type === 'quote') return <blockquote key={i} className="ju-serif">{b.text}</blockquote>;
        if (b.type === 'img') return (
          <figure key={i} style={{ margin: '40px 0' }}>
            <PThumb i={i} ratio="16 / 10" label="ARTICLE IMAGE" />
            <figcaption className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ju-text3)', marginTop: 10, textAlign: 'center' }}>{b.label}</figcaption>
          </figure>
        );
        return <p key={i} className="ju-sans">{b.text}</p>;
      })}
    </article>
  );
}

function PDetailPage({ work, onHome, onOpenWork, onFilterTag, tweaks }) {
  const flags = (work.display && work.display.page) || {};
  const recommended = React.useMemo(() => {
    const others = P_WORKS.filter(w => w.id !== work.id);
    return others
      .map(w => ({ ...w, _s: w.tags.filter(t => work.tags.includes(t)).length }))
      .sort((a, b) => b._s - a._s || b.year - a.year)
      .slice(0, 4);
  }, [work]);

  return (
    <div>
      <div style={{ maxWidth: 728, margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 24px 0' }}>
        {/* 麵包屑:可點回首頁 */}
        <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text3)', margin: 0 }}>
          <a onClick={onHome} style={{ color: 'var(--ju-green)', cursor: 'pointer' }}>首頁</a>
          <span>　—　{work.tags[0]}</span>
        </p>

        {/* 表頭:顯示項目由資料庫 display.page 控制 */}
        <h1 className="ju-serif p-detail-title" style={{ margin: '28px 0 0', fontWeight: 500 }}>{work.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 12px', margin: '20px 0 0' }}>
          {flags.client !== false && (
            <React.Fragment>
              <span className="ju-sans" style={{ fontSize: 13, color: 'var(--ju-text2)' }}>{work.client}</span>
              <span style={{ color: 'var(--ju-border)' }}>|</span>
            </React.Fragment>
          )}
          {flags.tags !== false && work.tags.map(t => (
            <PTagChip key={t} label={t} small onClick={() => onFilterTag(t)} />
          ))}
          {flags.date !== false && (
            <span className="ju-mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--ju-text3)' }}>{work.date}</span>
          )}
        </div>

        {/* 文章本體:同步 Notion 格式 → 白底容器,視覺統一(封面不在內頁顯示) */}
        <div style={{ marginTop: 40, background: 'var(--ju-card)', border: '0.5px solid var(--ju-border)', borderRadius: 12, padding: 'clamp(24px, 5vw, 56px)' }}>
          <PArticle lineHeight={tweaks.lineHeight} />
        </div>
      </div>

      {/* 推薦其他作品:最相關 4 則,兩欄瀑布流 */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 120px' }}>
        <PCountDivider>推薦其他作品</PCountDivider>
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: tweaks.isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 'clamp(32px, 5vw, 40px)', alignItems: 'start' }}>
          {(tweaks.isMobile ? [recommended] : pDistributeMasonry(recommended, 2)).map((bucket, k) => (
            <div key={k} style={{ display: 'grid', gap: 'clamp(40px, 6vw, 56px)', alignContent: 'start' }}>
              {bucket.map(w => (
                <PWorkCard key={w.id} work={w} i={P_WORKS.findIndex(x => x.id === w.id)} onOpen={onOpenWork} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { PHomePage, PDetailPage, PArticle });

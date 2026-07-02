import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchPanel, { BottomDock } from '../components/SearchBar.jsx';
import WorkCard from '../components/WorkCard.jsx';
import BackToTop from '../components/BackToTop.jsx';

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 4;
const PRELOAD_TIMEOUT = 6000;

function distributeMasonry(works, cols) {
  const heights = Array(cols).fill(0);
  const buckets = Array.from({ length: cols }, () => []);
  works.forEach(w => {
    const [rw, rh] = (w.ratio || '4 / 3').split('/').map(s => parseFloat(s.trim()));
    const h = rh / rw + 0.42;
    const k = heights.indexOf(Math.min(...heights));
    buckets[k].push(w);
    heights[k] += h;
  });
  return buckets;
}

function CountDivider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1, height: 0.5, background: 'var(--ju-border)' }} />
      <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text2)', textAlign: 'center' }}>{children}</span>
      <div style={{ flex: 1, height: 0.5, background: 'var(--ju-border)' }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ cursor: 'default' }}>
      <div className="animate-pulse" style={{ aspectRatio: '4/3', backgroundColor: 'var(--ju-surface)', border: '0.5px solid var(--ju-border)' }} />
      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="animate-pulse" style={{ height: 20, width: '80%', borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        <div className="animate-pulse" style={{ height: 12, width: '50%', borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
      </div>
    </div>
  );
}

/* Tag rotates with overflow:hidden mask — exit slides up, enter slides up from below */
function RotatingTag({ tags, selectedTags }) {
  const [currentTag, setCurrentTag] = useState(tags[0] ?? '');
  const [phase, setPhase] = useState('in'); // 'in' | 'out' | 'enter'

  useEffect(() => {
    if (tags.length > 0 && !tags.includes(currentTag)) setCurrentTag(tags[0]);
  }, [tags]);

  useEffect(() => {
    if (selectedTags.length > 0 || tags.length < 2) return;
    const t = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setCurrentTag(prev => {
          const i = tags.indexOf(prev);
          return tags[(i + 1) % tags.length];
        });
        setPhase('enter');
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')));
      }, 300);
    }, 2600);
    return () => clearInterval(t);
  }, [tags, selectedTags]);

  const displayTag = selectedTags.length > 0 ? selectedTags[0] : currentTag;
  const y = (selectedTags.length > 0 || phase === 'in') ? '0%'
    : phase === 'out' ? '-112%' : '112%';

  return (
    <span style={{ display: 'inline-flex', overflow: 'hidden', verticalAlign: 'bottom' }}>
      <span
        className="ju-serif"
        style={{
          display: 'inline-block',
          color: 'var(--ju-green)',
          borderBottom: '0.5px solid var(--ju-green)',
          padding: '0 6px',
          transform: `translateY(${y})`,
          transition: phase === 'enter' ? 'none' : 'transform .3s cubic-bezier(.33, 0, .2, 1)',
        }}
      >
        {displayTag}
      </span>
    </span>
  );
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState(initialTag ? [decodeURIComponent(initialTag)] : []);
  const [isSearchFixed, setIsSearchFixed] = useState(false);
  const [displayCount, setDisplayCount] = useState(INITIAL_COUNT);

  const searchRef = useRef(null);
  const scrollAnchorRef = useRef(null);
  const observerRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

  useEffect(() => {
    fetch(`${API_BASE}/works`)
      .then(res => { if (!res.ok) throw new Error('API error'); return res.json(); })
      .then(data => { setWorks((data.works ?? []).filter(Boolean)); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (initialTag) setSearchParams({}, { replace: true });
  }, []);

  /* Preload the first-screen cover images so the page reveals fully loaded,
     instead of popping in card by card. Caps the wait so one slow/broken
     image can't block the page forever — WorkCard's own fade-in covers the rest. */
  useEffect(() => {
    if (loading) return;
    const urls = works.slice(0, INITIAL_COUNT).map(w => w.coverImage).filter(Boolean);
    if (urls.length === 0) { setImagesReady(true); return; }

    let remaining = urls.length;
    let done = false;
    const finish = () => { if (!done) { done = true; setImagesReady(true); } };

    urls.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => { remaining -= 1; if (remaining === 0) finish(); };
      img.src = src;
    });

    const timeout = setTimeout(finish, PRELOAD_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [loading, works]);

  useEffect(() => {
    function f() {
      if (searchRef.current) setIsSearchFixed(searchRef.current.getBoundingClientRect().top <= 56);
    }
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  const loadMore = useCallback(() => setDisplayCount(n => n + LOAD_MORE_COUNT), []);

  /* Callback ref — the sentinel node mounts/unmounts as filters change,
     so the observer must be (re)created against whichever node is current. */
  const sentinelCallbackRef = useCallback(node => {
    observerRef.current?.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) loadMore();
      }, { rootMargin: '320px' });
      observerRef.current.observe(node);
    }
  }, [loadMore]);

  const didMountRef = useRef(false);
  useEffect(() => {
    setDisplayCount(INITIAL_COUNT);
    if (!didMountRef.current) { didMountRef.current = true; return; }
    if (scrollAnchorRef.current) {
      const top = scrollAnchorRef.current.offsetTop - 56;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }
  }, [selectedTags]);

  /* Tag counts sorted by frequency */
  const allTagCounts = useMemo(() => {
    const m = new Map();
    works.forEach(w => w.tags?.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [works]);

  const filteredWorks = useMemo(() => {
    if (selectedTags.length === 0) return works;
    return works
      .map(w => ({ ...w, _m: w.tags.filter(t => selectedTags.includes(t)).length }))
      .filter(w => w._m > 0)
      .sort((a, b) => b._m - a._m);
  }, [works, selectedTags]);

  const visibleWorks = selectedTags.length > 0
    ? filteredWorks
    : filteredWorks.slice(0, displayCount);

  const allLoaded = selectedTags.length > 0 || displayCount >= filteredWorks.length;
  const showSkeleton = loading || !imagesReady;
  const cols = 2;
  const buckets = distributeMasonry(visibleWorks, cols);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 56 }}>
        <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)' }}>資料載入失敗，請重新整理頁面</p>
      </div>
    );
  }

  const resultLabel = selectedTags.length > 0
    ? `${selectedTags.join(' + ')} · ${filteredWorks.length} 件`
    : `全部作品 · ${works.length} 件`;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56 }}>
      {/* Hero — centered */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(48px, 8vw, 88px) 24px 0', textAlign: 'center' }}>
        <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', margin: 0, letterSpacing: '0.02em' }}>
          Hi, I&apos;m Chain Huei Ju
        </p>
        <h1 className="ju-serif p-hero-title" style={{ margin: '18px 0 0', fontWeight: 500 }}>
          尋找 <RotatingTag tags={allTagCounts.map(([t]) => t)} selectedTags={selectedTags} /> 的作品
        </h1>
      </section>

      {/* Non-sticky anchor for scroll targeting — searchRef itself is position:sticky,
          whose measured offset becomes unreliable once already scrolled past it. */}
      <div ref={scrollAnchorRef} />

      {/* Search bar — desktop sticky */}
      <section
        ref={searchRef}
        className="p-search-inline p-search-sticky"
        style={{ borderBottom: isSearchFixed ? '0.5px solid var(--ju-border)' : '0.5px solid transparent' }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          <SearchPanel
            applied={selectedTags}
            allTagCounts={allTagCounts}
            onApply={setSelectedTags}
          />
        </div>
      </section>

      {/* Mobile bottom dock */}
      <BottomDock applied={selectedTags} allTagCounts={allTagCounts} onApply={setSelectedTags} resultCount={filteredWorks.length} />

      {/* Result count */}
      {!showSkeleton && (
        <section style={{ maxWidth: 880, margin: '0 auto', padding: '28px 24px 0' }}>
          <CountDivider>{resultLabel}</CountDivider>
        </section>
      )}

      {/* Work grid — masonry */}
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 64px' }}>
        {showSkeleton ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(24px, 4vw, 40px)', alignItems: 'start' }}>
            {[...Array(cols)].map((_, k) => (
              <div key={k} style={{ display: 'grid', gap: 'clamp(40px, 6vw, 56px)' }}>
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ))}
          </div>
        ) : filteredWorks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', margin: 0 }}>
              目前沒有符合的作品，試試其他關鍵字？
            </p>
            <button
              onClick={() => setSelectedTags([])}
              className="ju-mono"
              style={{ marginTop: 20, height: 40, padding: '0 20px', background: 'transparent', border: '0.5px solid var(--ju-green)', borderRadius: 8, color: 'var(--ju-green)', fontSize: 11, letterSpacing: '0.14em', cursor: 'pointer' }}
            >
              清除篩選
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'clamp(24px, 4vw, 40px)', alignItems: 'start' }}>
              {buckets.map((bucket, k) => (
                <div key={k} style={{ display: 'grid', gap: 'clamp(40px, 6vw, 56px)', alignContent: 'start' }}>
                  {bucket.map(w => (
                    <WorkCard key={w.id} work={w} index={works.findIndex(x => x.id === w.id)} openInNewTab />
                  ))}
                </div>
              ))}
            </div>

            {!allLoaded && <div ref={sentinelCallbackRef} style={{ textAlign: 'center', padding: '48px 0 0' }}>
              <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ju-text3)' }}>載入更多…</span>
            </div>}

            {allLoaded && filteredWorks.length > 0 && (
              <footer style={{ padding: '72px 0 96px', textAlign: 'center' }}>
                <CountDivider>已是全部 {filteredWorks.length} 件作品</CountDivider>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="ju-mono"
                  style={{ marginTop: 28, height: 42, padding: '0 22px', background: 'transparent', border: '0.5px solid var(--ju-green)', borderRadius: 999, color: 'var(--ju-green)', fontSize: 11, letterSpacing: '0.18em', cursor: 'pointer' }}
                >
                  回到最頂端 ↑
                </button>
              </footer>
            )}
          </>
        )}
      </main>

      <BackToTop />
    </div>
  );
}

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import WorkCard from '../components/WorkCard.jsx';
import BackToTop from '../components/BackToTop.jsx';

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 4;

function SkeletonCard() {
  return (
    <div
      className="rounded-lg overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '0.5px solid var(--color-border-default)' }}
    >
      <div className="aspect-[4/3]" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
      <div style={{ padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="h-5 rounded w-4/5" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
      </div>
    </div>
  );
}

function RotatingTag({ tags, selectedTags }) {
  const [currentTag, setCurrentTag] = useState(tags[0] ?? '');
  const [animStyle, setAnimStyle] = useState({
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'none',
  });

  // Lock to first selected tag when filtering is active
  useEffect(() => {
    if (selectedTags.length > 0) {
      setAnimStyle({ opacity: 1, transform: 'translateY(0)', transition: 'opacity 200ms ease' });
    }
  }, [selectedTags]);

  // Sync currentTag to first available tag when tags list loads
  useEffect(() => {
    if (tags.length > 0 && !tags.includes(currentTag)) {
      setCurrentTag(tags[0]);
    }
  }, [tags]);

  useEffect(() => {
    if (selectedTags.length > 0 || tags.length < 2) return;

    const interval = setInterval(() => {
      // Phase 1: exit upward
      setAnimStyle({
        opacity: 0,
        transform: 'translateY(-10px)',
        transition: 'opacity 300ms cubic-bezier(.33,0,.2,1), transform 300ms cubic-bezier(.33,0,.2,1)',
      });

      setTimeout(() => {
        // Phase 2: swap tag, jump to bottom (no transition)
        setCurrentTag(prev => {
          const i = tags.indexOf(prev);
          return tags[(i + 1) % tags.length];
        });
        setAnimStyle({ opacity: 0, transform: 'translateY(10px)', transition: 'none' });

        // Phase 3: enter upward from below
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimStyle({
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'opacity 300ms cubic-bezier(.33,0,.2,1), transform 300ms cubic-bezier(.33,0,.2,1)',
            });
          });
        });
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [tags, selectedTags]);

  const displayTag = selectedTags.length > 0 ? selectedTags[0] : currentTag;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: '999px',
        backgroundColor: 'var(--color-brand-primary-bg)',
        color: 'var(--color-brand-primary)',
        fontFamily: 'inherit',
        ...animStyle,
      }}
    >
      {displayTag}
    </span>
  );
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState(initialTag ? [decodeURIComponent(initialTag)] : []);
  const [isSearchFixed, setIsSearchFixed] = useState(false);
  const [displayCount, setDisplayCount] = useState(INITIAL_COUNT);

  const heroRef = useRef(null);
  const searchBarRef = useRef(null);
  const sentinelRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

  useEffect(() => {
    fetch(`${API_BASE}/works`)
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        setWorks(data.works);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fix search bar after hero scrolls past header
  useEffect(() => {
    function handleScroll() {
      if (!heroRef.current) return;
      setIsSearchFixed(heroRef.current.getBoundingClientRect().bottom < 56);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Infinite scroll sentinel
  const loadMore = useCallback(() => {
    setDisplayCount(n => n + LOAD_MORE_COUNT);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '320px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, loading]);

  // Reset displayCount when tags change
  useEffect(() => {
    setDisplayCount(INITIAL_COUNT);
  }, [selectedTags]);

  // Clear ?tag= param from URL after it's been consumed
  useEffect(() => {
    if (initialTag) setSearchParams({}, { replace: true });
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    works.forEach(w => w.tags?.forEach(t => tagSet.add(t)));
    return [...tagSet];
  }, [works]);

  const filteredWorks = useMemo(() => {
    if (selectedTags.length === 0) return works;
    return works
      .map(w => ({ ...w, _matchCount: w.tags.filter(t => selectedTags.includes(t)).length }))
      .filter(w => w._matchCount > 0)
      .sort((a, b) => b._matchCount - a._matchCount);
  }, [works, selectedTags]);

  // When tags are selected show all matches; when browsing all, paginate
  const visibleWorks = selectedTags.length > 0
    ? filteredWorks
    : filteredWorks.slice(0, displayCount);

  const allLoaded = selectedTags.length > 0 || displayCount >= filteredWorks.length;

  const searchBarHeight = isSearchFixed && searchBarRef.current
    ? searchBarRef.current.offsetHeight
    : 0;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14">
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          資料載入失敗，請重新整理頁面
        </p>
      </div>
    );
  }

  const resultLabel = selectedTags.length > 0
    ? `${selectedTags.join(' + ')} · ${filteredWorks.length} 件`
    : `全部作品 · ${works.length} 件`;

  return (
    <div className="min-h-screen pt-14">
      {/* Hero */}
      <section ref={heroRef} className="max-w-[940px] mx-auto px-4 pt-16 pb-10">
        <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Hi, I&apos;m Chain Huei Ju
        </p>
        <div className="p-hero-title" style={{ color: 'var(--color-text-main)' }}>
          尋找{' '}
          <RotatingTag tags={allTags} selectedTags={selectedTags} />
          {' '}的作品
        </div>
      </section>

      {/* Search bar */}
      <div ref={searchBarRef}>
        {isSearchFixed && <div style={{ height: searchBarHeight }} />}
        <SearchBar
          allTags={allTags}
          selectedTags={selectedTags}
          onSearch={setSelectedTags}
          isFixed={isSearchFixed}
        />
      </div>

      {/* Result count — always visible after load */}
      {!loading && (
        <div className="max-w-[940px] mx-auto px-4 flex items-center gap-4 py-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-default)' }} />
          <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
            {resultLabel}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-default)' }} />
        </div>
      )}

      {/* Work grid */}
      <main className="max-w-[940px] mx-auto px-4 pb-16 mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              目前沒有符合的作品，試試其他標籤？
            </p>
            <button
              onClick={() => setSelectedTags([])}
              className="h-12 px-6 text-label transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: 'var(--color-brand-primary-bg)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              清除篩選
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleWorks.map(work => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {!allLoaded && <div ref={sentinelRef} className="h-px" />}

            {/* Footer — all loaded */}
            {allLoaded && (
              <div className="flex items-center gap-4 mt-12 mb-4">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-default)' }} />
                <span className="text-caption" style={{ color: 'var(--color-text-disabled)' }}>
                  已是全部 {filteredWorks.length} 件作品
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-default)' }} />
              </div>
            )}
          </>
        )}
      </main>

      <BackToTop />
    </div>
  );
}

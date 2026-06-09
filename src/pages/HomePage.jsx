import { useState, useEffect, useMemo, useRef } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import WorkCard from '../components/WorkCard.jsx';
import BackToTop from '../components/BackToTop.jsx';

function SkeletonCard() {
  return (
    <div
      className="rounded-lg overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '0.5px solid var(--color-border-default)' }}
    >
      <div className="aspect-[4/3]" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded-full w-16" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        <div className="h-5 rounded w-4/5" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        <div className="flex gap-1.5">
          <div className="h-[26px] rounded-pill w-14" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
          <div className="h-[26px] rounded-pill w-18" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        </div>
      </div>
    </div>
  );
}

function RotatingTag({ tags, selectedTags }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const activeTag = selectedTags.length > 0 ? selectedTags[0] : (tags[index] ?? '');

  useEffect(() => {
    if (selectedTags.length > 0 || tags.length < 2) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % tags.length);
        setVisible(true);
      }, 250);
    }, 2500);

    return () => clearInterval(interval);
  }, [tags, selectedTags]);

  return (
    <span
      className="inline-block px-3 py-1 rounded-pill transition-all duration-250"
      style={{
        backgroundColor: 'var(--color-brand-primary-bg)',
        color: 'var(--color-brand-primary)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {activeTag}
    </span>
  );
}

export default function HomePage() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSearchFixed, setIsSearchFixed] = useState(false);

  const heroRef = useRef(null);
  const searchBarRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

  // Fetch works
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

  // Fix search bar after hero scrolls out
  useEffect(() => {
    function handleScroll() {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      setIsSearchFixed(heroBottom < 56);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    works.forEach(w => w.tags?.forEach(t => tagSet.add(t)));
    return [...tagSet];
  }, [works]);

  // Filter + sort by tag match count (descending)
  const filteredWorks = useMemo(() => {
    if (selectedTags.length === 0) return works;
    return works
      .map(w => ({ ...w, _matchCount: w.tags.filter(t => selectedTags.includes(t)).length }))
      .filter(w => w._matchCount > 0)
      .sort((a, b) => b._matchCount - a._matchCount);
  }, [works, selectedTags]);

  // Height of search bar area (for placeholder when fixed)
  const searchBarHeight = isSearchFixed && searchBarRef.current
    ? searchBarRef.current.offsetHeight
    : 0;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          資料載入失敗，請重新整理頁面
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Hero */}
      <section ref={heroRef} className="max-w-[940px] mx-auto px-4 pt-16 pb-10">
        <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Hi, I&apos;m Chain Huai Ju
        </p>
        <div className="text-h1" style={{ color: 'var(--color-text-main)' }}>
          尋找{' '}
          <RotatingTag tags={allTags} selectedTags={selectedTags} />
          {' '}的作品
        </div>
      </section>

      {/* Search bar — placeholder when fixed */}
      <div ref={searchBarRef}>
        {isSearchFixed && <div style={{ height: searchBarHeight }} />}
        <SearchBar
          allTags={allTags}
          selectedTags={selectedTags}
          onSearch={setSelectedTags}
          isFixed={isSearchFixed}
        />
      </div>

      {/* Result count */}
      {selectedTags.length > 0 && !loading && (
        <div className="max-w-[940px] mx-auto px-4 flex items-center gap-4 py-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-default)' }} />
          <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {selectedTags.join(' + ')} · {filteredWorks.length} 件
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-default)' }} />
        </div>
      )}

      {/* Work grid */}
      <main className="max-w-[940px] mx-auto px-4 pb-24 mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              目前沒有符合的作品，試試其他標籤？
            </p>
            <button
              onClick={() => setSelectedTags([])}
              className="h-12 px-6 rounded-md text-label transition-opacity hover:opacity-80"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorks.map(work => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </main>

      <BackToTop />
    </div>
  );
}

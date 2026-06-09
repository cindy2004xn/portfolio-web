import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import WorkCard from '../components/WorkCard.jsx';
import BackToTop from '../components/BackToTop.jsx';

function Skeleton() {
  return (
    <div className="pt-14 min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="max-w-[680px] mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-3 rounded w-36" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        <div className="h-9 rounded w-3/4" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        <div className="flex gap-1.5">
          <div className="h-[26px] rounded-pill w-16" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
          <div className="h-[26px] rounded-pill w-20" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        </div>
        <div className="aspect-[4/3] rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-4 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        ))}
      </div>
    </div>
  );
}

function getRecommended(current, allWorks) {
  const others = allWorks.filter(w => w.id !== current.id);
  const scored = others.map(w => ({
    ...w,
    score: w.tags.filter(t => current.tags.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score || new Date(b.createdTime) - new Date(a.createdTime));
  return scored.slice(0, 4);
}

export default function WorkDetailPage() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/works/${id}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API_BASE}/works`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    ])
      .then(([workData, worksData]) => {
        setWork(workData);
        setAllWorks(worksData.works ?? []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-base)' }}>
        <div className="text-center">
          <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>作品載入失敗</p>
          <Link
            to="/"
            className="inline-block h-12 px-6 rounded-md text-label leading-[48px] transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary-bg)', borderRadius: 'var(--radius-md)' }}
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const page = work.display?.page ?? {};
  const recommended = getRecommended(work, allWorks);
  const formattedDate = work.createdTime
    ? new Date(work.createdTime).toISOString().slice(0, 10)
    : '';

  return (
    <div className="min-h-screen pt-14" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="max-w-[680px] mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 text-caption" style={{ color: 'var(--color-text-disabled)' }}>
          <Link to="/" className="hover:underline">首頁</Link>
          <span>—</span>
          <span>{work.type || '作品'}</span>
        </div>

        {/* Title — always shown */}
        <h1 className="text-h1 mb-5" style={{ color: 'var(--color-text-main)' }}>
          {work.title}
        </h1>

        {/* Meta row: type + tags + date */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {page.type !== false && work.type && (
            <span className="text-label-caps" style={{ color: 'var(--color-text-secondary)' }}>
              {work.type}
            </span>
          )}
          {page.tags !== false && work.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center h-[26px] px-3 rounded-pill text-label-caps"
              style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary-bg)' }}
            >
              {tag}
            </span>
          ))}
          {page.date !== false && formattedDate && (
            <span className="text-caption" style={{ color: 'var(--color-text-disabled)' }}>
              {formattedDate}
            </span>
          )}
        </div>

        {/* Notion content */}
        <div
          className="rounded-lg p-8 mb-16"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '0.5px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '420px',
          }}
        >
          {work.content
            ? <MarkdownRenderer content={work.content} />
            : <p className="text-body" style={{ color: 'var(--color-text-disabled)' }}>尚無內容</p>
          }
        </div>
      </div>

      {/* Recommended works */}
      {recommended.length > 0 && (
        <section className="max-w-[940px] mx-auto px-4 pb-24">
          <h2 className="text-h3 mb-6" style={{ color: 'var(--color-text-main)' }}>推薦其他作品</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended.map(w => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
        </section>
      )}

      <BackToTop />
    </div>
  );
}

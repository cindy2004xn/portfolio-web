import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import NotionBlockRenderer from '../components/NotionBlockRenderer.jsx';
import { fetchWork, fetchWorks } from '../lib/data.js';
import { distributeMasonry } from '../lib/masonry.js';
import WorkCard from '../components/WorkCard.jsx';
import BackToTop from '../components/BackToTop.jsx';

function CountDivider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1, height: 0.5, background: 'var(--ju-border)' }} />
      <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text2)', textAlign: 'center' }}>{children}</span>
      <div style={{ flex: 1, height: 0.5, background: 'var(--ju-border)' }} />
    </div>
  );
}

function TagChip({ label }) {
  return (
    <span
      className="ju-mono"
      style={{
        display: 'inline-block', height: 28, lineHeight: '26px',
        padding: '0 11px', borderRadius: 999, fontSize: 10.5,
        letterSpacing: '0.08em', background: 'transparent',
        border: '1px solid var(--ju-green)', color: 'var(--ju-green)',
      }}
    >
      {label}
    </span>
  );
}

function Skeleton() {
  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div className="animate-pulse" style={{ maxWidth: 728, margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 12, width: 120, borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        <div style={{ height: 36, width: '75%', borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ height: 28, width: 64, borderRadius: 999, backgroundColor: 'var(--ju-surface)' }} />
          <div style={{ height: 28, width: 80, borderRadius: 999, backgroundColor: 'var(--ju-surface)' }} />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 16, width: i % 3 === 2 ? '66%' : '100%', borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        ))}
      </div>
    </div>
  );
}

export default function WorkDetailPage() {
  const { id } = useParams();
  const [work, setWork] = useState(null);
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchWork(id), fetchWorks()])
      .then(([workData, worksData]) => {
        setWork(workData);
        setAllWorks(worksData);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (work?.title) document.title = `${work.title}｜朱千慧作品集`;
  }, [work]);

  const recommended = useMemo(() => {
    if (!work) return [];
    return allWorks
      .filter(w => w && w.id !== work.id)
      .map(w => ({ ...w, _s: w.tags.filter(t => work.tags.includes(t)).length }))
      .sort((a, b) => b._s - a._s || (b.year ?? '').localeCompare(a.year ?? ''))
      .slice(0, 4);
  }, [work, allWorks]);

  if (loading) return <Skeleton />;

  if (error || !work) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', marginBottom: 16 }}>作品載入失敗</p>
          <Link to="/works" className="ju-mono" style={{ display: 'inline-block', height: 40, lineHeight: '40px', padding: '0 20px', background: 'var(--ju-green)', color: 'var(--ju-on-green)', borderRadius: 999, fontSize: 11, letterSpacing: '0.14em', textDecoration: 'none' }}>
            返回作品列表
          </Link>
        </div>
      </div>
    );
  }

  const page = work.display?.page ?? {};
  const formattedDate = work.date ?? (work.createdTime ? new Date(work.createdTime).toISOString().slice(0, 10) : '');
  const recBuckets = distributeMasonry(recommended, 2);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56 }}>
      <div style={{ maxWidth: 'clamp(600px, 74vw, 960px)', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 24px 0' }}>

        {/* Breadcrumb */}
        <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text3)', margin: 0 }}>
          <Link to="/works" style={{ color: 'var(--ju-green)', textDecoration: 'none' }}>作品</Link>
          <span>　—　{work.tags?.[0] ?? '作品'}</span>
        </p>

        {/* Title */}
        <h1 className="ju-serif p-detail-title" style={{ margin: '28px 0 0', fontWeight: 500 }}>
          {work.title}
        </h1>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 12px', margin: '20px 0 0' }}>
          {page.client !== false && work.client && (
            <>
              <span className="ju-sans" style={{ fontSize: 13, color: 'var(--ju-text2)' }}>{work.client}</span>
              <span style={{ color: 'var(--ju-border)' }}>|</span>
            </>
          )}
          {page.tags !== false && work.tags?.map(t => (
            <TagChip key={t} label={t} />
          ))}
          {page.date !== false && formattedDate && (
            <span className="ju-mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--ju-text3)' }}>{formattedDate}</span>
          )}
        </div>

        {/* Article content — 開放閱讀面，不關進浮框；限制行長以利閱讀 */}
        <div style={{ marginTop: 40, maxWidth: 720 }}>
          {work.blocks?.length > 0
            ? <NotionBlockRenderer blocks={work.blocks} />
            : <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text3)', margin: 0 }}>尚無內容</p>
          }
        </div>
      </div>

      {/* Recommended — masonry */}
      {recommended.length > 0 && (
        <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) 24px 120px' }}>
          <CountDivider>推薦其他作品</CountDivider>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(32px, 5vw, 40px)', alignItems: 'start' }}>
            {recBuckets.map((bucket, k) => (
              <div key={k} style={{ display: 'grid', gap: 'clamp(40px, 6vw, 56px)', alignContent: 'start' }}>
                {bucket.map(w => (
                  <WorkCard key={w.id} work={w} index={allWorks.findIndex(x => x.id === w.id)} />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <BackToTop />
    </div>
  );
}

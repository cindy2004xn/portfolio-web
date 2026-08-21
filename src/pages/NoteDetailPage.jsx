import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NotionBlockRenderer from '../components/NotionBlockRenderer.jsx';
import { fetchNote } from '../lib/data.js';
import BackToTop from '../components/BackToTop.jsx';

function Skeleton() {
  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div className="animate-pulse" style={{ maxWidth: 728, margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 12, width: 120, borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        <div style={{ height: 36, width: '75%', borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 16, width: i % 3 === 2 ? '66%' : '100%', borderRadius: 4, backgroundColor: 'var(--ju-surface)' }} />
        ))}
      </div>
    </div>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchNote(id)
      .then(data => { setNote(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (note?.title) document.title = `${note.title}｜朱千慧作品集`;
  }, [note]);

  if (loading) return <Skeleton />;

  if (error || !note) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text2)', marginBottom: 16 }}>課程心得載入失敗</p>
          <Link to="/" className="ju-mono" style={{ display: 'inline-block', height: 40, lineHeight: '40px', padding: '0 20px', background: 'var(--ju-accent)', color: 'var(--ju-on-accent)', borderRadius: 999, fontSize: 11, letterSpacing: '0.14em', textDecoration: 'none' }}>
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56 }}>
      <div style={{ maxWidth: 'clamp(600px, 74vw, 820px)', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 24px 0' }}>

        {/* Breadcrumb */}
        <p className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text3)', margin: 0 }}>
          <Link to="/" style={{ color: 'var(--ju-accent)', textDecoration: 'none' }}>首頁</Link>
          <span>　—　課程心得</span>
        </p>

        {/* Title */}
        <h1 className="ju-sans p-detail-title" style={{ margin: '28px 0 0', fontWeight: 600 }}>
          {note.title}
        </h1>

        {/* Article content — 與作品內頁共用 .ju-light 淺紙閱讀面板 */}
        <div className="ju-light" style={{ marginTop: 40, background: 'var(--ju-card)', border: '1px solid var(--ju-border-card)', borderRadius: 20, boxShadow: 'var(--ju-shadow-rest)', padding: 'clamp(24px, 5vw, 56px)' }}>
          {note.blocks?.length > 0
            ? <NotionBlockRenderer blocks={note.blocks} />
            : <p className="ju-sans" style={{ fontSize: 14, color: 'var(--ju-text3)', margin: 0 }}>尚無內容</p>
          }
        </div>
      </div>

      <div style={{ height: 'clamp(80px, 12vw, 120px)' }} />

      <BackToTop />
    </div>
  );
}

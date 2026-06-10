import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkCard({ work, index = 0, openInNewTab = false }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  if (!work) return null;

  const card = work.display?.card ?? {};
  const ratio = work.ratio ?? '4 / 3';

  const metaParts = [];
  if (card.client !== false && work.client) metaParts.push(work.client);
  if (card.tags !== false && work.tags?.length > 0) metaParts.push(work.tags.slice(0, 3).join('・'));
  if (card.year !== false && work.year) metaParts.push(work.year);

  return (
    <div
      onClick={() => openInNewTab ? window.open(`/work/${work.id}`, '_blank', 'noopener') : navigate(`/work/${work.id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Thumbnail — only the thumbnail gets the border */}
      <div
        style={{
          aspectRatio: ratio,
          overflow: 'hidden',
          border: `0.5px solid ${hov ? 'var(--ju-green)' : 'var(--ju-border)'}`,
          transition: 'border-color .15s ease',
          backgroundColor: 'var(--ju-surface)',
        }}
      >
        {work.coverImage ? (
          <img
            src={work.coverImage}
            alt={work.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              background: `repeating-linear-gradient(${45 + (index % 3) * 45}deg, var(--ju-surface) 0px, var(--ju-surface) 7px, #efe9df 7px, #efe9df 14px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span
              className="ju-mono"
              style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ju-text3)', background: 'var(--ju-base)', padding: '3px 8px', border: '0.5px solid var(--ju-border)', whiteSpace: 'nowrap' }}
            >
              {ratio.replace(/ /g, '')}
            </span>
          </div>
        )}
      </div>

      {/* Title + meta — no card container */}
      <div style={{ paddingTop: 16 }}>
        <h3
          className="ju-serif"
          style={{
            fontSize: 20, lineHeight: 1.45, margin: 0,
            color: hov ? 'var(--ju-green)' : 'var(--ju-text)',
            transition: 'color .15s ease',
          }}
        >
          {work.title}
          <span style={{ opacity: hov ? 1 : 0, transition: 'opacity .15s ease' }}> ↗</span>
        </h3>
        {metaParts.length > 0 && (
          <p
            className="ju-mono"
            style={{ fontSize: 10.5, letterSpacing: '0.14em', margin: '8px 0 0', color: 'var(--ju-text3)', lineHeight: 1.8 }}
          >
            {metaParts.join('　/　')}
          </p>
        )}
      </div>
    </div>
  );
}

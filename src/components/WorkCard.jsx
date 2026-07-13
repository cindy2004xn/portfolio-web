import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WorkCard({ work, index = 0, openInNewTab = false }) {
  const [hov, setHov] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  if (!work) return null;

  const card = work.display?.card ?? {};
  const ratio = work.ratio ?? '4 / 3';

  const metaParts = [];
  if (card.client !== false && work.client) metaParts.push(work.client);
  if (card.tags !== false && work.tags?.length > 0) metaParts.push(work.tags.slice(0, 3).join('・'));
  if (card.year !== false && work.year) metaParts.push(work.year);

  const linkProps = openInNewTab ? { target: '_blank', rel: 'noopener' } : {};

  return (
    <Link
      to={`/work/${work.id}`}
      {...linkProps}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      style={{ display: 'block', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
    >
      {/* Thumbnail — only the thumbnail gets the border */}
      <div
        style={{
          position: 'relative',
          aspectRatio: ratio,
          overflow: 'hidden',
          borderRadius: 12,
          border: `0.5px solid ${hov ? 'var(--ju-green)' : 'var(--ju-border)'}`,
          boxShadow: hov ? '0 16px 34px -18px rgba(40, 50, 25, 0.45)' : 'none',
          transform: hov ? 'translateY(-4px)' : 'none',
          transition: 'border-color .15s ease, box-shadow .2s ease, transform .2s ease',
          backgroundColor: 'var(--ju-surface)',
        }}
      >
        {work.coverImage ? (
          <>
            {!imgLoaded && (
              <div className="animate-pulse" style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--ju-surface)' }} />
            )}
            <img
              src={work.coverImage}
              alt={work.title}
              onLoad={() => setImgLoaded(true)}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity .3s ease',
              }}
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              background: `repeating-linear-gradient(${45 + (index % 3) * 45}deg, var(--ju-surface) 0px, var(--ju-surface) 7px, var(--ju-card2) 7px, var(--ju-card2) 14px)`,
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
          <span style={{ opacity: hov ? 1 : 0, transition: 'opacity .15s ease' }} aria-hidden="true"> ↗</span>
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
    </Link>
  );
}

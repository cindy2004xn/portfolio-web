import { useNavigate } from 'react-router-dom';

export default function WorkCard({ work }) {
  const navigate = useNavigate();
  if (!work) return null;
  const card = work.display?.card ?? {};

  const ratio = work.ratio ?? '4 / 3';

  const metaParts = [
    card.client !== false ? work.client : null,
    card.tags !== false && work.tags?.length > 0 ? work.tags.join('・') : null,
    card.year !== false ? work.year : null,
  ].filter(Boolean);

  return (
    <div
      onClick={() => navigate(`/work/${work.id}`)}
      className="work-card rounded-lg overflow-hidden cursor-pointer"
      style={{ borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-card)' }}
    >
      {/* Thumbnail — ratio from data */}
      <div className="overflow-hidden bg-bg-surface" style={{ aspectRatio: ratio }}>
        {work.coverImage ? (
          <img
            src={work.coverImage}
            alt={work.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        <h3 className="text-card-title work-card-title mb-2 line-clamp-2">
          {work.title}
          <span className="work-card-arrow ml-1" style={{ color: 'var(--color-brand-primary)' }}>
            →
          </span>
        </h3>
        {metaParts.length > 0 && (
          <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
            {metaParts.join(' / ')}
          </p>
        )}
      </div>
    </div>
  );
}

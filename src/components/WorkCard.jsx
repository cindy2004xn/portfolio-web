import { useNavigate } from 'react-router-dom';

export default function WorkCard({ work }) {
  const navigate = useNavigate();
  const card = work.display?.card ?? {};

  return (
    <div
      onClick={() => navigate(`/work/${work.id}`)}
      className="
        bg-bg-card rounded-lg overflow-hidden cursor-pointer
        border border-border-default
        hover:border-brand-primary hover:-translate-y-0.5
        transition-all duration-150
      "
      style={{ borderWidth: '0.5px' }}
    >
      {/* Thumbnail 4:3 */}
      <div className="aspect-[4/3] overflow-hidden bg-bg-surface">
        {work.coverImage ? (
          <img
            src={work.coverImage}
            alt={work.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-bg-surface" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {card.type !== false && work.type && (
          <p className="text-label-caps text-brand-primary mb-1">{work.type}</p>
        )}
        <h3 className="text-h3 text-text-main mb-2 line-clamp-2">{work.title}</h3>
        {card.tags !== false && work.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {work.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center h-[26px] px-3 rounded-pill border text-label-caps text-text-main bg-transparent"
                style={{ borderWidth: '0.5px', borderColor: 'var(--color-border-strong)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* 原型原子元件 */

function PThumb({ i = 0, ratio = '4 / 3', label = 'COVER', hovered = false }) {
  const angles = [45, -45, 90, 45, -45, 90];
  return (
    <div
      style={{
        aspectRatio: ratio,
        background: `repeating-linear-gradient(${angles[i % 6]}deg, var(--ju-surface) 0px, var(--ju-surface) 7px, #efe9df 7px, #efe9df 14px)`,
        border: `0.5px solid ${hovered ? 'var(--ju-green)' : 'var(--ju-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color .15s ease',
      }}
    >
      <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.12em', whiteSpace: 'nowrap', color: 'var(--ju-text3)', background: 'var(--ju-base)', padding: '3px 8px', border: '0.5px solid var(--ju-border)' }}>
        {label} · {ratio.replace(/ /g, '')}
      </span>
    </div>
  );
}

/* 輪播標籤:整個 tag 由下往上翻動 */
function PRotatingTag({ tags, lockedTag = null }) {
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState('in'); /* in | out | enter */
  React.useEffect(() => {
    if (lockedTag || tags.length < 2) return;
    const t = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIndex(i => (i + 1) % tags.length);
        setPhase('enter');
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')));
      }, 300);
    }, 2600);
    return () => clearInterval(t);
  }, [tags, lockedTag]);
  const word = lockedTag ?? tags[index] ?? '';
  const y = (lockedTag || phase === 'in') ? '0%' : (phase === 'out' ? '-112%' : '112%');
  return (
    <span style={{ display: 'inline-flex', overflow: 'hidden', verticalAlign: 'bottom' }}>
      <span className="ju-serif" style={{
        display: 'inline-block', color: 'var(--ju-green)', borderBottom: '0.5px solid var(--ju-green)', padding: '0 6px',
        transform: `translateY(${y})`,
        transition: phase === 'enter' ? 'none' : 'transform .3s cubic-bezier(.33, 0, .2, 1)',
      }}>{word}</span>
    </span>
  );
}

function PHeader({ onHome }) {
  return (
    <header className="p-header">
      <a onClick={onHome} className="ju-serif" style={{ fontSize: 22, color: 'var(--ju-green)', cursor: 'pointer', lineHeight: 1 }}>Ju</a>
      <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ju-text3)' }}>PORTFOLIO — CHAIN HUEI JU</span>
    </header>
  );
}

/* 標籤 chip:互動節點 → 墨綠 */
function PTagChip({ label, count = null, selected = false, onClick, small = false }) {
  return (
    <button
      onClick={onClick}
      className="ju-mono p-chip"
      style={{
        height: small ? 28 : 32,
        padding: small ? '0 11px' : '0 14px',
        borderRadius: 999,
        fontSize: small ? 10.5 : 11,
        letterSpacing: '0.08em',
        cursor: 'pointer',
        background: 'transparent',
        whiteSpace: 'nowrap',
        border: selected ? '0.5px solid var(--ju-green)' : '0.5px solid var(--ju-border)',
        color: selected ? 'var(--ju-green)' : 'var(--ju-text2)',
        transition: 'color .15s ease, border-color .15s ease',
      }}
    >
      {label}
      {count !== null && <span style={{ marginLeft: 6, opacity: 0.55, fontSize: '0.9em' }}>{count}</span>}
      {selected && <span style={{ marginLeft: 6 }}>×</span>}
    </button>
  );
}

function PCountDivider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: 1, height: 0.5, background: 'var(--ju-border)' }}></div>
      <span className="ju-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ju-text2)', textAlign: 'center' }}>{children}</span>
      <div style={{ flex: 1, height: 0.5, background: 'var(--ju-border)' }}></div>
    </div>
  );
}

/* 作品卡:固定欄宽、高度隨封面比例;顯示項目由資料庫 display.card 控制 */
function PWorkCard({ work, i, onOpen }) {
  const [hov, setHov] = React.useState(false);
  const flags = (work.display && work.display.card) || {};
  const metaParts = [];
  if (flags.client !== false) metaParts.push(work.client);
  if (flags.tags !== false) metaParts.push(work.tags.slice(0, 3).join('・'));
  if (flags.year !== false) metaParts.push(work.year);
  return (
    <div
      onClick={() => onOpen(work.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer' }}
    >
      <PThumb i={i} ratio={work.ratio || '4 / 3'} hovered={hov} />
      <div style={{ paddingTop: 16 }}>
        <h3 className="ju-serif" style={{
          fontSize: 'var(--p-card-title, 20px)', lineHeight: 1.45, margin: 0,
          color: hov ? 'var(--ju-green)' : 'var(--ju-text)', transition: 'color .15s ease',
        }}>
          {work.title}<span style={{ opacity: hov ? 1 : 0, transition: 'opacity .15s ease' }}> ↗</span>
        </h3>
        {metaParts.length > 0 && (
          <p className="ju-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', margin: '8px 0 0', color: 'var(--ju-text3)', lineHeight: 1.8 }}>
            {metaParts.join('　/　')}
          </p>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PThumb, PRotatingTag, PHeader, PTagChip, PCountDivider, PWorkCard });

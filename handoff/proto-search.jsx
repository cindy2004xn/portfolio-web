/* 搜尋:下拉多選 combobox — 草稿選取 → 點「搜尋」才套用(PRD) */

function PSearchPanel({ applied, onApply, popover = true, onDone }) {
  const [draft, setDraft] = React.useState(applied);
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(!popover);
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  /* 外部套用值變動時同步草稿 */
  React.useEffect(() => { setDraft(applied); }, [applied]);

  /* 點外面收合下拉 */
  React.useEffect(() => {
    if (!popover) return;
    function handle(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [popover]);

  const q = query.trim();
  const shown = q ? P_TAG_COUNTS.filter(([t]) => t.includes(q)) : P_TAG_COUNTS;
  const dirty = draft.length !== applied.length || draft.some(t => !applied.includes(t));

  function toggleDraft(t) {
    setDraft(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }
  function doSearch() {
    onApply(draft);
    setQuery('');
    setOpen(!popover);
    onDone && onDone();
  }
  function onKeyDown(e) {
    if (e.key === 'Enter') {
      const candidates = shown.filter(([t]) => !draft.includes(t));
      if (q && candidates.length > 0) { toggleDraft(candidates[0][0]); setQuery(''); }
      else doSearch();
    }
    if (e.key === 'Backspace' && query === '' && draft.length > 0) toggleDraft(draft[draft.length - 1]);
    if (e.key === 'Escape') setOpen(!popover);
  }

  const tagList = (
    <div>
      {/* 全選 / 一鍵清除 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setDraft([...P_TAGS])} className="ju-mono p-chip" style={{ height: 28, padding: '0 11px', borderRadius: 999, fontSize: 10.5, letterSpacing: '0.08em', cursor: 'pointer', background: 'transparent', border: '0.5px solid var(--ju-text)', color: 'var(--ju-text)' }}>
          全選
        </button>
        <button onClick={() => setDraft([])} className="ju-mono p-chip" style={{ height: 28, padding: '0 11px', borderRadius: 999, fontSize: 10.5, letterSpacing: '0.08em', cursor: 'pointer', background: 'transparent', border: '0.5px solid var(--ju-border)', color: 'var(--ju-text2)' }}>
          清除
        </button>
        <span className="ju-mono" style={{ marginLeft: 'auto', fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--ju-text3)' }}>
          已選 {draft.length} / {P_TAGS.length}
        </span>
      </div>
      {/* 全部標籤(打字即過濾) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {shown.map(([t, c]) => (
          <PTagChip key={t} label={t} count={c} small selected={draft.includes(t)} onClick={() => toggleDraft(t)} />
        ))}
        {shown.length === 0 && (
          <span className="ju-mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--ju-text3)', padding: '4px 0' }}>沒有符合「{q}」的標籤</span>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* 輸入列:草稿 chips + 輸入 + 搜尋鈕 */}
      <div
        onClick={() => { setOpen(true); inputRef.current && inputRef.current.focus(); }}
        style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
          minHeight: 52, padding: '8px 8px 8px 14px', cursor: 'text',
          background: 'var(--ju-card)', border: `0.5px solid ${open && popover ? 'var(--ju-text)' : 'var(--ju-border)'}`, borderRadius: 8,
          transition: 'border-color .15s ease',
        }}
      >
        <span className="ju-mono" style={{ fontSize: 12, color: 'var(--ju-text3)', flexShrink: 0 }}>⌕</span>
        {draft.map(t => (
          <PTagChip key={t} label={t} selected small onClick={(e) => { e.stopPropagation(); toggleDraft(t); }} />
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={draft.length === 0 ? '輸入或下拉選擇關鍵字' : ''}
          className="ju-sans"
          style={{ flex: 1, minWidth: 110, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--ju-text)', padding: '6px 0' }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); doSearch(); }}
          className="ju-mono"
          style={{
            height: 38, padding: '0 18px', borderRadius: 6, fontSize: 11.5, letterSpacing: '0.16em',
            cursor: 'pointer', flexShrink: 0, alignSelf: 'center',
            background: dirty ? 'var(--ju-green)' : 'transparent',
            border: '0.5px solid var(--ju-green)',
            color: dirty ? 'var(--ju-green-bg)' : 'var(--ju-green)',
            transition: 'background .15s ease, color .15s ease',
          }}
        >
          搜尋
        </button>
      </div>

      {/* 下拉:popover(桌面) 或 直接展開(面板) */}
      {popover ? (
        open && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)', zIndex: 30,
            padding: 16, background: 'var(--ju-card)', border: '0.5px solid var(--ju-border)', borderRadius: 8,
          }}>
            {tagList}
          </div>
        )
      ) : (
        <div style={{ marginTop: 16 }}>{tagList}</div>
      )}
    </div>
  );
}

/* 行動版:吸底搜尋列 + 上滑面板 */
function PBottomDock({ applied, onApply, resultCount }) {
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <div className="p-dock">
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 16px',
            background: 'var(--ju-card)', border: '0.5px solid var(--ju-border)', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span className="ju-mono" style={{ fontSize: 12, color: 'var(--ju-green)' }}>⌕</span>
          <span className="ju-sans" style={{ flex: 1, fontSize: 13, color: applied.length ? 'var(--ju-text)' : 'var(--ju-text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {applied.length ? applied.join('・') : '輸入或下拉選擇關鍵字'}
          </span>
          <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ju-text3)', flexShrink: 0 }}>{resultCount} 件</span>
        </button>
      </div>
      {open && (
        <div className="p-sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="p-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ju-text3)' }}>搜尋作品</span>
              <button onClick={() => setOpen(false)} className="ju-mono" style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--ju-text2)', cursor: 'pointer', padding: 4 }}>✕</button>
            </div>
            <PSearchPanel applied={applied} onApply={onApply} popover={false} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

Object.assign(window, { PSearchPanel, PBottomDock });

import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ allTags, selectedTags, onSearch, isFixed }) {
  const [draft, setDraft] = useState(selectedTags);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync draft when selectedTags changes externally (e.g., clear from hero)
  useEffect(() => {
    setDraft(selectedTags);
  }, [selectedTags]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleTag(tag) {
    setDraft(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function selectAll() {
    setDraft([...allTags]);
  }

  function clearAll() {
    setDraft([]);
    onSearch([]);
    setIsOpen(false);
  }

  function handleSearch() {
    onSearch(draft);
    setIsOpen(false);
  }

  const wrapperClass = isFixed
    ? 'fixed left-0 right-0 z-40'
    : '';

  const wrapperStyle = isFixed
    ? { top: '56px', backgroundColor: 'var(--color-bg-base)', borderBottom: '0.5px solid var(--color-border-default)' }
    : {};

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="max-w-[940px] mx-auto px-4 py-4" ref={containerRef}>
        {/* Input field */}
        <div
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center flex-wrap gap-2 min-h-[55px] px-4 py-2 cursor-pointer rounded-md"
          style={{
            border: '0.5px solid var(--color-border-strong)',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {draft.length === 0 && (
            <span className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              選擇關鍵字
            </span>
          )}
          {draft.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-pill text-label-caps"
              style={{
                border: '0.5px solid var(--color-border-strong)',
                color: 'var(--color-text-main)',
              }}
            >
              {tag}
              <button
                onClick={e => { e.stopPropagation(); toggleTag(tag); }}
                className="leading-none hover:opacity-60 transition-opacity"
                aria-label={`移除 ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <span className="ml-auto text-text-secondary select-none">▾</span>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="mt-1 p-4 rounded-md"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '0.5px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAll}
                className="inline-flex items-center h-[30px] px-3 rounded-pill text-label-caps transition-colors"
                style={{
                  border: '0.5px solid var(--color-border-strong)',
                  color: 'var(--color-text-main)',
                }}
              >
                全選
              </button>
              {allTags.map(tag => {
                const active = draft.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center h-[30px] px-3 rounded-pill text-label-caps transition-colors"
                    style={
                      active
                        ? { backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary-bg)', border: 'none' }
                        : { border: '0.5px solid var(--color-border-default)', color: 'var(--color-text-main)' }
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="mt-3 w-full h-[54px] rounded-md text-label transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-brand-primary)',
            color: 'var(--color-brand-primary-bg)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          開始探索
        </button>

        {/* Clear all link */}
        {(draft.length > 0 || selectedTags.length > 0) && (
          <button
            onClick={clearAll}
            className="mt-2 w-full text-center text-caption text-text-disabled hover:text-text-secondary transition-colors"
          >
            清除全部
          </button>
        )}
      </div>
    </div>
  );
}

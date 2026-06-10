import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ allTags, selectedTags, onSearch, isFixed }) {
  const [draft, setDraft] = useState(selectedTags);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(selectedTags); }, [selectedTags]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredTags = allTags.filter(tag =>
    inputValue === '' || tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  function toggleTag(tag) {
    setDraft(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function clearAll() {
    setDraft([]);
    onSearch([]);
    setInputValue('');
    setIsOpen(false);
  }

  function handleSearch() {
    onSearch(draft);
    setInputValue('');
    setIsOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Backspace' && inputValue === '' && draft.length > 0) {
      setDraft(prev => prev.slice(0, -1));
    }
    if (e.key === 'Enter') {
      if (inputValue && filteredTags.length > 0) {
        const first = filteredTags.find(t => !draft.includes(t));
        if (first) { setDraft(prev => [...prev, first]); }
        setInputValue('');
      } else if (!inputValue) {
        handleSearch();
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  const hasDiff = JSON.stringify(draft.slice().sort()) !== JSON.stringify(selectedTags.slice().sort());

  const wrapperClass = isFixed ? 'fixed left-0 right-0 z-40' : '';
  const wrapperStyle = isFixed
    ? { top: '56px', backgroundColor: 'var(--color-bg-base)', borderBottom: '0.5px solid var(--color-border-default)' }
    : {};

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="max-w-[940px] mx-auto px-4 py-4" ref={containerRef}>

        {/* Input row */}
        <div
          className="flex items-center flex-wrap gap-2 min-h-[52px] px-4 py-2 cursor-text"
          style={{
            border: isOpen
              ? '0.5px solid var(--color-brand-primary)'
              : '0.5px solid var(--color-border-strong)',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            transition: 'border-color 150ms ease',
          }}
          onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
        >
          {draft.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 h-[30px] px-3 text-mono-label"
              style={{
                border: '0.5px solid var(--color-border-strong)',
                borderRadius: '999px',
                color: 'var(--color-text-main)',
                backgroundColor: 'transparent',
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

          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={draft.length === 0 ? '選擇或輸入關鍵字' : ''}
            className="flex-1 min-w-[80px] bg-transparent outline-none text-body"
            style={{
              color: 'var(--color-text-main)',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={e => { e.stopPropagation(); setIsOpen(v => !v); }}
            className="ml-auto text-text-secondary select-none transition-transform duration-150"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            tabIndex={-1}
          >
            ▾
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="mt-1 p-4"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '0.5px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setDraft([...allTags]); }}
                className="inline-flex items-center h-[30px] px-3 text-mono-label transition-colors"
                style={{ border: '0.5px solid var(--color-border-strong)', borderRadius: '999px', color: 'var(--color-text-main)' }}
              >
                全選
              </button>
              {filteredTags.map(tag => {
                const active = draft.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center h-[30px] px-3 text-mono-label transition-colors"
                    style={
                      active
                        ? { backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary-bg)', borderRadius: '999px', border: 'none' }
                        : { border: '0.5px solid var(--color-border-default)', borderRadius: '999px', color: 'var(--color-text-main)' }
                    }
                  >
                    {tag}
                  </button>
                );
              })}
              {filteredTags.length === 0 && (
                <span className="text-caption" style={{ color: 'var(--color-text-disabled)' }}>
                  無符合標籤
                </span>
              )}
            </div>
          </div>
        )}

        {/* Search button — prominent when draft differs from current selection */}
        <button
          onClick={handleSearch}
          className="mt-3 w-full h-[52px] text-label transition-opacity hover:opacity-90"
          style={{
            backgroundColor: hasDiff
              ? 'var(--color-brand-primary)'
              : 'var(--color-bg-surface)',
            color: hasDiff
              ? 'var(--color-brand-primary-bg)'
              : 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-md)',
            border: hasDiff ? 'none' : '0.5px solid var(--color-border-default)',
            transition: 'background-color 200ms ease, color 200ms ease',
          }}
        >
          {draft.length === 0 ? '探索全部' : '開始搜尋'}
        </button>

        {(draft.length > 0 || selectedTags.length > 0) && (
          <button
            onClick={clearAll}
            className="mt-2 w-full text-center text-caption transition-colors"
            style={{ color: 'var(--color-text-disabled)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-disabled)'}
          >
            清除全部
          </button>
        )}
      </div>
    </div>
  );
}

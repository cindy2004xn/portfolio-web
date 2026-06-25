import { useState } from 'react';

// Notion text/background color tokens
const TEXT_COLORS = {
  gray: '#787774', brown: '#9f6b53', orange: '#d9730d',
  yellow: '#cb912f', green: '#448361', blue: '#337ea9',
  purple: '#9065b0', pink: '#c14c8a', red: '#d44c47',
};

const BG_COLORS = {
  gray_background: '#f1f1ef', brown_background: '#f4eeee',
  orange_background: '#fbecdd', yellow_background: '#fbf3db',
  green_background: '#edf3ec', blue_background: '#e7f3f8',
  purple_background: '#f4f0f7', pink_background: '#f9eef3',
  red_background: '#fdebec',
};

// Callout bg mapped from callout.color (which may end with _background or not)
function calloutBg(color = 'default') {
  if (color.endsWith('_background')) return BG_COLORS[color] ?? '#f1f1ef';
  return BG_COLORS[`${color}_background`] ?? '#f1f1ef';
}

export function renderRichText(arr) {
  if (!arr?.length) return null;
  return arr.map((rt, i) => {
    const text = rt.plain_text || '';
    if (!text) return null;
    const a = rt.annotations || {};
    const href = rt.href;

    const spanStyle = {};
    if (a.color && a.color !== 'default') {
      if (a.color.endsWith('_background')) {
        spanStyle.backgroundColor = BG_COLORS[a.color];
        spanStyle.padding = '0 4px';
        spanStyle.borderRadius = 3;
      } else {
        spanStyle.color = TEXT_COLORS[a.color];
      }
    }
    if (a.underline) spanStyle.textDecoration = 'underline';

    let node;
    if (a.code) {
      node = (
        <code style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.875em',
          background: 'rgba(135,131,120,0.15)',
          borderRadius: 3,
          padding: '0.1em 0.4em',
        }}>
          {text}
        </code>
      );
    } else {
      node = <>{text}</>;
      if (a.bold) node = <strong>{node}</strong>;
      if (a.italic) node = <em>{node}</em>;
      if (a.strikethrough) node = <s>{node}</s>;
      if (Object.keys(spanStyle).length) node = <span style={spanStyle}>{node}</span>;
    }

    if (href) {
      node = (
        <a href={href} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--ju-green)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          {node}
        </a>
      );
    }

    return <span key={i}>{node}</span>;
  });
}

function Toggle({ block }) {
  const [open, setOpen] = useState(false);
  const rt = block.toggle?.rich_text || [];

  return (
    <div style={{ margin: '3px 0' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', userSelect: 'none', lineHeight: 1.75 }}
      >
        <span style={{
          display: 'inline-block', flexShrink: 0, marginTop: '0.35em',
          fontSize: 9, color: 'var(--ju-text3)',
          transform: `rotate(${open ? 90 : 0}deg)`,
          transition: 'transform .15s ease',
        }}>▶</span>
        <span>{renderRichText(rt)}</span>
      </div>
      {open && block.children?.length > 0 && (
        <div style={{ marginLeft: 20, marginTop: 4 }}>
          <NotionBlocks blocks={block.children} />
        </div>
      )}
    </div>
  );
}

function NotionBlock({ block }) {
  const { type } = block;
  const d = block[type] || {};

  switch (type) {
    case 'paragraph': {
      const rt = d.rich_text || [];
      const color = d.color;
      const sty = {};
      if (color && color !== 'default') {
        if (color.endsWith('_background')) sty.backgroundColor = BG_COLORS[color];
        else sty.color = TEXT_COLORS[color];
      }
      if (!rt.length) return <div style={{ height: '0.7em' }} />;
      return (
        <p className="ju-sans" style={{ margin: '3px 0', lineHeight: 1.75, fontSize: 16, ...sty }}>
          {renderRichText(rt)}
        </p>
      );
    }

    case 'heading_1':
      return (
        <h1 className="ju-serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.4, margin: '48px 0 6px', color: 'var(--ju-text)' }}>
          {renderRichText(d.rich_text || [])}
        </h1>
      );

    case 'heading_2':
      return (
        <h2 className="ju-serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.4, margin: '40px 0 4px', color: 'var(--ju-text)' }}>
          {renderRichText(d.rich_text || [])}
        </h2>
      );

    case 'heading_3':
      return (
        <h3 className="ju-sans" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, margin: '28px 0 2px', color: 'var(--ju-text)' }}>
          {renderRichText(d.rich_text || [])}
        </h3>
      );

    case 'quote': {
      return (
        <blockquote style={{
          margin: '16px 0', paddingLeft: 16,
          borderLeft: '3px solid var(--ju-border)',
          color: 'var(--ju-text2)',
        }}>
          <p className="ju-sans" style={{ margin: 0, lineHeight: 1.75, fontSize: 16 }}>
            {renderRichText(d.rich_text || [])}
          </p>
          {block.children?.length > 0 && (
            <div style={{ marginTop: 8 }}><NotionBlocks blocks={block.children} /></div>
          )}
        </blockquote>
      );
    }

    case 'callout': {
      const icon = d.icon;
      const bg = calloutBg(d.color || 'default');
      return (
        <div style={{
          display: 'flex', gap: 12, padding: '14px 16px', margin: '16px 0',
          backgroundColor: bg, borderRadius: 6, lineHeight: 1.75,
        }}>
          {icon && (
            <span style={{ flexShrink: 0, fontSize: 18, lineHeight: 1.4, marginTop: 1 }}>
              {icon.type === 'emoji' ? icon.emoji : '💡'}
            </span>
          )}
          <div className="ju-sans" style={{ flex: 1, fontSize: 16 }}>
            {renderRichText(d.rich_text || [])}
            {block.children?.length > 0 && (
              <div style={{ marginTop: 8 }}><NotionBlocks blocks={block.children} /></div>
            )}
          </div>
        </div>
      );
    }

    case 'divider':
      return <hr style={{ margin: '28px 0', border: 'none', borderTop: '0.5px solid var(--ju-border)' }} />;

    case 'image': {
      const url = d.type === 'file' ? d.file?.url : d.external?.url;
      const caption = d.caption || [];
      const captionText = caption.map(rt => rt.plain_text || '').join('');
      if (!url) return null;
      return (
        <div style={{ margin: '32px 0' }}>
          <img
            src={url} alt={captionText || ''}
            style={{ width: '100%', display: 'block', borderRadius: 4 }}
            loading="lazy"
            decoding="async"
          />
          {captionText && (
            <p className="ju-mono" style={{
              fontSize: 10, letterSpacing: '0.08em', color: 'var(--ju-text3)',
              margin: '10px 0 0', textAlign: 'center', lineHeight: 1.6,
            }}>
              {captionText}
            </p>
          )}
        </div>
      );
    }

    case 'video': {
      const url = d.type === 'external' ? d.external?.url : d.file?.url;
      if (!url) return null;
      const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?\s/]+)/);
      if (ytMatch) {
        return (
          <div style={{ margin: '32px 0', aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytMatch[1]}`}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 4 }}
              allowFullScreen title="Video"
            />
          </div>
        );
      }
      return (
        <div style={{ margin: '32px 0' }}>
          <video src={url} controls style={{ width: '100%', borderRadius: 4 }} />
        </div>
      );
    }

    case 'code': {
      const code = (d.rich_text || []).map(rt => rt.plain_text || '').join('');
      const caption = (d.caption || []).map(rt => rt.plain_text || '').join('');
      return (
        <div style={{ margin: '24px 0' }}>
          <pre style={{
            padding: '20px', backgroundColor: '#1a1a1a', color: '#f5f1eb',
            borderRadius: 6, overflowX: 'auto',
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, lineHeight: 1.7,
            margin: 0,
          }}>
            <code>{code}</code>
          </pre>
          {caption && (
            <p className="ju-mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--ju-text3)', margin: '8px 0 0' }}>
              {caption}
            </p>
          )}
        </div>
      );
    }

    case 'toggle':
      return <Toggle block={block} />;

    case 'to_do': {
      const checked = d.checked ?? false;
      return (
        <div className="ju-sans" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '3px 0', lineHeight: 1.75, fontSize: 16 }}>
          <input type="checkbox" checked={checked} readOnly
            style={{ marginTop: '0.35em', accentColor: 'var(--ju-green)', flexShrink: 0, cursor: 'default' }} />
          <span style={{ textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--ju-text3)' : 'inherit' }}>
            {renderRichText(d.rich_text || [])}
          </span>
        </div>
      );
    }

    case 'bookmark': {
      const url = d.url;
      const captionText = (d.caption || []).map(rt => rt.plain_text || '').join('');
      if (!url) return null;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', margin: '16px 0', padding: '14px 16px',
          border: '0.5px solid var(--ju-border)', borderRadius: 6,
          textDecoration: 'none', color: 'var(--ju-text)',
          transition: 'border-color .15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ju-green)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ju-border)'}
        >
          <span className="ju-mono" style={{ fontSize: 11, color: 'var(--ju-text3)', wordBreak: 'break-all', display: 'block' }}>{url}</span>
          {captionText && <p className="ju-sans" style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ju-text2)' }}>{captionText}</p>}
        </a>
      );
    }

    case 'embed': {
      const url = d.url;
      if (!url) return null;
      return (
        <div style={{ margin: '24px 0', border: '0.5px solid var(--ju-border)', borderRadius: 6, overflow: 'hidden' }}>
          <iframe src={url} style={{ width: '100%', height: 480, display: 'block', border: 'none' }} title="Embedded content" />
        </div>
      );
    }

    case 'table': {
      if (!block.children?.length) return null;
      const hasColHeader = d.has_column_header;
      return (
        <div style={{ margin: '24px 0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {block.children.map((row, ri) => {
                const cells = row.table_row?.cells || [];
                return (
                  <tr key={row.id}>
                    {cells.map((cell, ci) => {
                      const isHeader = hasColHeader && ri === 0;
                      const Tag = isHeader ? 'th' : 'td';
                      return (
                        <Tag key={ci} className="ju-sans" style={{
                          padding: '8px 14px', border: '0.5px solid var(--ju-border)',
                          textAlign: 'left', lineHeight: 1.6,
                          fontWeight: isHeader ? 600 : 400,
                          backgroundColor: isHeader ? 'var(--ju-surface)' : 'transparent',
                        }}>
                          {renderRichText(cell)}
                        </Tag>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case 'column_list': {
      if (!block.children?.length) return null;
      return (
        <div style={{ display: 'flex', gap: 24, margin: '12px 0', flexWrap: 'wrap' }}>
          {block.children.map(col => (
            <div key={col.id} style={{ flex: 1, minWidth: 180 }}>
              {col.children?.length > 0 && <NotionBlocks blocks={col.children} />}
            </div>
          ))}
        </div>
      );
    }

    case 'column':
      return null; // rendered by column_list

    default:
      return null;
  }
}

function NotionBlocks({ blocks }) {
  if (!blocks?.length) return null;

  const result = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === 'bulleted_list_item') {
      const items = [];
      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') items.push(blocks[i++]);
      result.push(
        <ul key={`ul-${items[0].id}`} style={{ paddingLeft: 24, margin: '4px 0', lineHeight: 1.75 }}>
          {items.map(item => (
            <li key={item.id} className="ju-sans" style={{ margin: '3px 0', fontSize: 16 }}>
              {renderRichText(item.bulleted_list_item?.rich_text || [])}
              {item.children?.length > 0 && <div style={{ marginTop: 4 }}><NotionBlocks blocks={item.children} /></div>}
            </li>
          ))}
        </ul>
      );
    } else if (block.type === 'numbered_list_item') {
      const items = [];
      while (i < blocks.length && blocks[i].type === 'numbered_list_item') items.push(blocks[i++]);
      result.push(
        <ol key={`ol-${items[0].id}`} style={{ paddingLeft: 24, margin: '4px 0', lineHeight: 1.75 }}>
          {items.map(item => (
            <li key={item.id} className="ju-sans" style={{ margin: '3px 0', fontSize: 16 }}>
              {renderRichText(item.numbered_list_item?.rich_text || [])}
              {item.children?.length > 0 && <div style={{ marginTop: 4 }}><NotionBlocks blocks={item.children} /></div>}
            </li>
          ))}
        </ol>
      );
    } else {
      result.push(<NotionBlock key={block.id} block={block} />);
      i++;
    }
  }

  return <>{result}</>;
}

export default NotionBlocks;

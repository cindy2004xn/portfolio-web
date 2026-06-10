import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkUnwrapImages from 'remark-unwrap-images';

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function MarkdownRenderer({ content }) {
  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkUnwrapImages]}
        components={{
          img({ src, alt }) {
            if (src && isYouTubeUrl(src)) {
              const videoId = extractYouTubeId(src);
              if (videoId) {
                return (
                  <div className="img-wrapper">
                    <div style={{ aspectRatio: '16/9', width: '100%' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        style={{ width: '100%', height: '100%', borderRadius: 4 }}
                        allowFullScreen
                        title={alt || 'YouTube video'}
                      />
                    </div>
                    {alt && <p className="img-caption">{alt}</p>}
                  </div>
                );
              }
            }
            return (
              <span className="img-wrapper" style={{ display: 'block' }}>
                <img src={src} alt={alt || ''} />
                {alt && <span className="img-caption" style={{ display: 'block' }}>{alt}</span>}
              </span>
            );
          },
          a({ href, children, ...props }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          pre({ children, ...props }) {
            return (
              <pre
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#f5f1eb',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  overflowX: 'auto',
                  margin: '24px 0',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
                {...props}
              >
                {children}
              </pre>
            );
          },
          code({ className, children, ...props }) {
            if (className) {
              return <code className={className} {...props}>{children}</code>;
            }
            return (
              <code
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  backgroundColor: 'var(--color-bg-surface)',
                  borderRadius: 3,
                  padding: '2px 6px',
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

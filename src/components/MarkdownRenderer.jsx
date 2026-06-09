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
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkUnwrapImages]}
        components={{
          img({ src, alt }) {
            if (src && isYouTubeUrl(src)) {
              const videoId = extractYouTubeId(src);
              if (videoId) {
                return (
                  <div className="aspect-video w-full my-6 not-prose">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title={alt || 'YouTube video'}
                    />
                  </div>
                );
              }
            }
            return (
              <img src={src} alt={alt || ''} className="w-full rounded-lg my-4" />
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
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4" {...props}>
                {children}
              </pre>
            );
          },
          code({ className, children, ...props }) {
            if (className) {
              return <code className={className} {...props}>{children}</code>;
            }
            return (
              <code className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
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

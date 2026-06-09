import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-40 w-10 h-10 rounded-full flex items-center justify-center transition-opacity duration-200"
      style={{
        backgroundColor: 'var(--color-bg-dark)',
        color: 'var(--color-bg-base)',
      }}
      aria-label="回到頂端"
    >
      ↑
    </button>
  );
}

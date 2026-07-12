import { useState, useEffect } from 'react';
import { scrollToY } from '../lib/masonry.js';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const f = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="p-backtop"
      onClick={() => scrollToY(0)}
      aria-label="回到頂端"
    >
      ↑
    </button>
  );
}

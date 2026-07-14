import { useState, useEffect } from 'react';
import { scrollToY } from '../lib/masonry.js';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const f = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  /* footer 進場就讓位：按鈕（fixed 右下）與 footer 的 Ju 字標會疊在一起。
     沒有 footer 的頁面（/works、/work/:id）查不到節點，維持原行為。 */
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  if (!visible || footerInView) return null;

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

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between"
      style={{
        padding: '0 clamp(20px, 4vw, 32px)',
        /* 半透明近黑 + 輕模糊：header 浮在 landing 的光軌 canvas 上仍保持導覽可讀。
           與 .lp-glass 同屬 DESIGN.md 的玻璃系統（功能性優先）。 */
        backgroundColor: 'rgba(12, 12, 12, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--ju-border)',
      }}
    >
      <Link to="/" aria-label="回首頁" style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
        <img src="/logo.svg" alt="朱千慧" style={{ width: 30, height: 'auto', display: 'block' }} />
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link
          to="/works"
          className="ju-mono"
          style={{ fontSize: 12, letterSpacing: '0.16em', color: 'var(--ju-accent)', textDecoration: 'none', borderBottom: '1px solid var(--ju-accent)', paddingBottom: 2 }}
        >
          搜尋作品
        </Link>
      </nav>
    </header>
  );
}

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between"
      style={{
        padding: '0 clamp(20px, 4vw, 32px)',
        backgroundColor: 'var(--ju-base)',
        borderBottom: '0.5px solid var(--ju-border)',
      }}
    >
      <Link
        to="/"
        className="ju-serif"
        style={{ fontSize: 22, color: 'var(--ju-green)', lineHeight: 1, textDecoration: 'none' }}
      >
        Ju
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link
          to="/works"
          className="ju-mono"
          style={{ fontSize: 12, letterSpacing: '0.16em', color: 'var(--ju-green)', textDecoration: 'none', borderBottom: '1px solid var(--ju-green)', paddingBottom: 2 }}
        >
          作品
        </Link>
        <span
          className="ju-mono p-header-label"
          style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--ju-text3)' }}
        >
          PORTFOLIO — CHAIN HUEI JU
        </span>
      </nav>
    </header>
  );
}

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        borderBottom: '0.5px solid var(--color-border-default)',
      }}
    >
      <Link
        to="/"
        className="text-h2 font-normal tracking-tight"
        style={{ color: 'var(--color-brand-primary)' }}
      >
        Ju
      </Link>
    </header>
  );
}

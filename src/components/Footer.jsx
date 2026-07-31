import { Link } from 'react-router-dom';

/* 全站 footer。正本 Figma 255-2 的 Frame 1788（1440×146）。
   左「Contact me」＋信箱、右 Ju 字標。

   對稿的三處刻意偏離（均已與她確認）：
   - 底色稿上是 #131313，改用 --ju-surface（#141414）。差 1/255，肉眼不可見，
     不值得為 0.4% 的差異多開一個 token。
   - 稿上的 Ju 是 MuseoModerno 40px 字體；改用 public/logo.svg（同一個字標），
     不為了兩個字母載一支字體。
   - 稿上信箱是純文字；改成 mailto 連結——「Contact me」旁邊的信箱不能點很怪。
   左右留白也改成對稱、與 header 同一組值，讓兩處的 Ju 對齊同一條垂直線
   （稿上是左 87 右 65，看得出是隨手放的）。 */
export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--ju-surface)',
        borderTop: '1px solid var(--ju-border)',
        padding: 'clamp(32px, 5vw, 54px) clamp(20px, 4vw, 32px)',
      }}
    >
      <div
        className="lp-footer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(16px, 3vw, 32px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(16px, 3vw, 37px)', flexWrap: 'wrap' }}>
          <span className="ju-sans" style={{ fontSize: 'clamp(24px, 2.22vw, 32px)', fontWeight: 500, color: 'var(--ju-text)', lineHeight: 1.2 }}>
            Contact me
          </span>
          <a
            href="mailto:cindy2004xn@gmail.com"
            className="ju-sans lp-mail"
            style={{ fontSize: 16, letterSpacing: '0.8px', color: 'var(--ju-text)', textDecoration: 'none', lineHeight: 1.2 }}
          >
            cindy2004xn@gmail.com
          </a>
        </div>
        <Link to="/" aria-label="回首頁" style={{ display: 'flex', alignItems: 'center', lineHeight: 0, flex: '0 0 auto' }}>
          <img src="/logo.svg" alt="朱千慧" style={{ width: 30, height: 'auto', display: 'block' }} />
        </Link>
      </div>
    </footer>
  );
}

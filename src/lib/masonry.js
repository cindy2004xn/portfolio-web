// 依累積高度把作品分配到最短的欄位（HomePage 與 WorkDetailPage 共用）
export function distributeMasonry(works, cols) {
  const heights = Array(cols).fill(0);
  const buckets = Array.from({ length: cols }, () => []);
  works.forEach(w => {
    const [rw, rh] = (w.ratio || '4 / 3').split('/').map(s => parseFloat(s.trim()));
    const h = rh / rw + 0.42;
    const k = heights.indexOf(Math.min(...heights));
    buckets[k].push(w);
    heights[k] += h;
  });
  return buckets;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 平滑捲動，但尊重使用者的減少動態偏好
export function scrollToY(top) {
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

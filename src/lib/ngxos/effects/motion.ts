const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return window.matchMedia(QUERY).matches;
}

// Calls `onChange` with the current value whenever the media query flips.
export function subscribeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  const mql = window.matchMedia(QUERY);
  const listener = () => onChange(mql.matches);

  mql.addEventListener('change', listener);

  return () => mql.removeEventListener('change', listener);
}

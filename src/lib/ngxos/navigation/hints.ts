// Hint-mode target collection, label allocation, and narrowing state.
//
// This is a plain `.ts` module (not `.svelte.ts`), so it can't declare Svelte
// runes state directly. `HintOverlay.svelte` needs to re-render as the user
// types, so this module dispatches a raw DOM CustomEvent
// (`ngxos:hints-update`, deliberately NOT routed through `core/events.ts`'s
// typed `emit()` since that would require widening its `NgxEventName` union)
// on `document` every time the active target set or typed prefix changes.
// `HintOverlay.svelte` mirrors the payload into its own local `$state`.
//
// v1 scope: hint targets are `a[href]`/`button` elements only — not
// `[data-ngx-section]` records — per the milestone spec.
export interface HintTarget {
  el: HTMLElement;
  label: string;
  rect: DOMRect;
}

export type HintKeyResult = 'no-match' | 'narrowed' | 'matched';

// Standard Vimium-style scheme: single characters from this alphabet until
// exhausted, then two-character pairs. Because every tier uses a uniform
// label length, the resulting set is automatically prefix-free (no shorter
// label is ever a prefix of a longer one).
const HINT_ALPHABET = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];

let activeTargets: HintTarget[] = [];
let typedPrefix = '';

export function isHintLabelChar(key: string): boolean {
  return key.length === 1 && HINT_ALPHABET.includes(key.toLowerCase());
}

function isInsideNgxOverlay(el: Element): boolean {
  // Our own overlay roots (HintOverlay/HelpOverlay/StatusHint) carry
  // `data-ngx-ui` precisely so hint collection can skip them. Note: the
  // terminal window is NOT tagged with this attribute (out of scope for
  // this change), so its buttons are currently still hintable — see report.
  return el.closest('[data-ngx-ui]') !== null;
}

function isVisibleInViewport(el: HTMLElement): boolean {
  if (el.hidden) {
    return false;
  }

  const style = window.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') {
    return false;
  }

  if (el.offsetParent === null && style.position !== 'fixed') {
    return false;
  }

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.bottom > 0 && rect.right > 0 && rect.top < viewportHeight && rect.left < viewportWidth;
}

function allocateLabels(count: number): string[] {
  if (count <= HINT_ALPHABET.length) {
    return HINT_ALPHABET.slice(0, count);
  }

  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const first = HINT_ALPHABET[Math.floor(i / HINT_ALPHABET.length) % HINT_ALPHABET.length];
    const second = HINT_ALPHABET[i % HINT_ALPHABET.length];
    labels.push(first + second);
  }

  return labels;
}

export function collectHintTargets(): HintTarget[] {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('a[href], button'));

  const visible = candidates.filter((el) => {
    if (el.getAttribute('data-ngx-hint') === 'false') {
      return false;
    }

    if (isInsideNgxOverlay(el)) {
      return false;
    }

    return isVisibleInViewport(el);
  });

  const labels = allocateLabels(visible.length);

  return visible.map((el, index) => ({ el, label: labels[index], rect: el.getBoundingClientRect() }));
}

function notify(): void {
  document.dispatchEvent(
    new CustomEvent('ngxos:hints-update', { detail: { targets: activeTargets, typed: typedPrefix } })
  );
}

export function startHints(): HintTarget[] {
  activeTargets = collectHintTargets();
  typedPrefix = '';
  notify();
  return activeTargets;
}

export function stopHints(): void {
  activeTargets = [];
  typedPrefix = '';
  notify();
}

export function getActiveTargets(): HintTarget[] {
  return activeTargets;
}

export function getTypedPrefix(): string {
  return typedPrefix;
}

export function typeHintChar(char: string): HintKeyResult {
  const attempt = typedPrefix + char.toLowerCase();
  const matches = activeTargets.filter((target) => target.label.startsWith(attempt));

  if (matches.length === 0) {
    return 'no-match';
  }

  typedPrefix = attempt;
  notify();

  if (matches.length === 1 && matches[0].label === attempt) {
    return 'matched';
  }

  return 'narrowed';
}

export function getMatchedTarget(): HintTarget | undefined {
  return activeTargets.find((target) => target.label === typedPrefix);
}

// Scans the live DOM for `[data-ngx-section]` markers and keeps a
// module-level cache the terminal commands can read synchronously
// (`ls`, `cd`). Re-scanned whenever content swaps under the current page
// (see `ngxos:content-swapped` in events.ts).
import type { SectionRecord } from '../core/registry';
import { on, emit } from '../core/events';
import { ngx } from '../core/store.svelte';
import { normalizeRoutePath } from './routes';

let cache: SectionRecord[] = [];
let subscribed = false;

// The `on()` subscription touches `document` immediately, which breaks
// Astro's SSR/prerender pass (this module is transitively imported by a
// client component, and Node has no `document`). Deferred until the first
// real (client-side) scan instead of a module-scope side effect.
function ensureSubscribed(): void {
  if (subscribed) {
    return;
  }

  subscribed = true;
  on('ngxos:content-swapped', () => {
    scanSections();
  });
}

export function scanSections(): SectionRecord[] {
  ensureSubscribed();

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-ngx-section]'));

  cache = nodes.map((el) => {
    const id = el.getAttribute('data-ngx-section') ?? '';
    const label = el.getAttribute('data-ngx-label') || id;
    const routeEl = el.closest<HTMLElement>('[data-ngx-route]');
    const route = normalizeRoutePath(routeEl?.getAttribute('data-ngx-route') ?? location.pathname);
    const focusable = el.getAttribute('data-ngx-focusable') !== 'false';

    return { id, label, route, el, focusable };
  });

  return cache;
}

export function getSections(): SectionRecord[] {
  return cache;
}

// --- Focus helpers (normal-mode j/k/gg/G/Enter navigation) ---------------
// Kept here rather than in keybinds.ts since focus is fundamentally a
// section-registry concern (it mutates the same DOM markers/cache this
// module owns) — keybinds.ts just decides *when* to call these.

export function focusSectionById(id: string): void {
  const sections = getSections();
  const target = sections.find((section) => section.id === id);

  if (!target) {
    return;
  }

  const previous = sections.find((section) => section.id === ngx.focusedSectionId);
  previous?.el.removeAttribute('data-ngx-focused');

  target.el.setAttribute('data-ngx-focused', 'true');
  ngx.focusedSectionId = target.id;
  target.el.scrollIntoView({ block: 'start', behavior: ngx.reducedMotion ? 'auto' : 'smooth' });
  emit('ngxos:section-focus', { id: target.id });
}

export function clearSectionFocus(): void {
  const current = getSections().find((section) => section.id === ngx.focusedSectionId);
  current?.el.removeAttribute('data-ngx-focused');
  ngx.focusedSectionId = null;
}

// direction: 1 = next (j), -1 = previous (k). Document order, no
// wrap-around; first press with nothing focused jumps to the first
// (direction 1) or last (direction -1) focusable section.
export function focusAdjacentSection(direction: 1 | -1): void {
  const focusable = getSections().filter((section) => section.focusable);

  if (focusable.length === 0) {
    return;
  }

  const currentIndex = focusable.findIndex((section) => section.id === ngx.focusedSectionId);

  let nextIndex: number;
  if (currentIndex === -1) {
    nextIndex = direction === 1 ? 0 : focusable.length - 1;
  } else {
    nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= focusable.length) {
      return;
    }
  }

  focusSectionById(focusable[nextIndex].id);
}

export function focusFirstSection(): void {
  const focusable = getSections().filter((section) => section.focusable);

  if (focusable.length > 0) {
    focusSectionById(focusable[0].id);
  }
}

export function focusLastSection(): void {
  const focusable = getSections().filter((section) => section.focusable);

  if (focusable.length > 0) {
    focusSectionById(focusable[focusable.length - 1].id);
  }
}

// Enter: move real DOM focus to the first interactive element inside the
// currently focused section. Returns whether it found something to focus,
// so callers can decide whether the keypress was actually handled.
export function activateFocusedSection(): boolean {
  const current = getSections().find((section) => section.id === ngx.focusedSectionId);

  if (!current) {
    return false;
  }

  const target = current.el.querySelector<HTMLElement>('a[href], button');

  if (!target) {
    return false;
  }

  target.focus();
  return true;
}

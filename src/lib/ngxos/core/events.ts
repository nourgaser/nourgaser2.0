// Typed thin helpers over CustomEvent, dispatched on `document`.
export type NgxEventName =
  | 'ngxos:boot'
  | 'ngxos:power-on'
  | 'ngxos:power-off'
  | 'ngxos:theme-change'
  | 'ngxos:section-focus'
  | 'ngxos:terminal-open'
  | 'ngxos:content-swapped';

export function emit(name: NgxEventName, detail?: unknown): void {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on(name: NgxEventName, handler: (event: CustomEvent) => void): () => void {
  const listener = handler as EventListener;
  document.addEventListener(name, listener);

  return () => document.removeEventListener(name, listener);
}

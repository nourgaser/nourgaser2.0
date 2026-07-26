// Theme catalog for the `theme` command and the terminal's hamburger menu.
// Colors themselves live entirely in `src/styles/themes.css` — this module
// only knows ids/labels so it never has to duplicate a palette in TS.
import { ngx } from '../core/store.svelte';
import { setItem } from '../core/persist';
import { emit } from '../core/events';
import { applyTheme } from './power';

export interface ThemeInfo {
  id: string;
  label: string;
}

export const themes: ThemeInfo[] = [
  { id: 'default', label: 'Default' },
  { id: 'vgcolors', label: 'VG Colors' },
  { id: 'ubuntu', label: 'Ubuntu' },
  { id: 'fedora', label: 'Fedora' },
];

export function isThemeId(id: string): boolean {
  return themes.some((theme) => theme.id === id);
}

// Shared by the `theme <id>` command and the hamburger menu's theme rows so
// both apply a selection the same way.
export function applyThemeChoice(id: string): void {
  if (!isThemeId(id)) {
    return;
  }

  applyTheme(id);
  ngx.theme = id;
  setItem('ngx.theme', id);
  emit('ngxos:theme-change', { theme: id });
}

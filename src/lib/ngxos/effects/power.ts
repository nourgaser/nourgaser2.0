import { getItem } from '../core/persist';

const VALID_THEMES = ['default', 'vgcolors', 'ubuntu', 'fedora'];

export function applyTheme(id: string): void {
  const theme = VALID_THEMES.includes(id) ? id : 'default';
  document.documentElement.setAttribute('data-theme', theme);
}

export function applyPowerState(on: boolean): void {
  if (on) {
    document.documentElement.setAttribute('data-ngxos', 'on');
  } else {
    document.documentElement.removeAttribute('data-ngxos');
    // The chosen theme stays remembered in storage; only the live attribute reverts.
    applyTheme('default');
  }
}

// Re-stamp both attributes from storage, used on bfcache restore (`pageshow`)
// where the page's DOM may reflect a stale in-memory state.
export function syncFromStorage(): void {
  const isOn = getItem('ngx.power') === 'on';
  applyPowerState(isOn);

  if (isOn) {
    applyTheme(getItem('ngx.theme') ?? 'default');
  }
}

import { ngx } from './store.svelte';
import { emit } from './events';
import { getItem, setItem } from './persist';
import { applyPowerState, applyTheme, syncFromStorage } from '../effects/power';
import { prefersReducedMotion } from '../effects/motion';

let booted = false;

export function powerOn(): void {
  ngx.poweredOn = true;
  setItem('ngx.power', 'on');
  applyPowerState(true);
  applyTheme(ngx.theme);
  emit('ngxos:power-on');
}

export function powerOff(): void {
  ngx.poweredOn = false;
  setItem('ngx.power', 'off');
  applyPowerState(false);
  emit('ngxos:power-off');
}

export function togglePower(): void {
  if (ngx.poweredOn) {
    powerOff();
  } else {
    powerOn();
  }
}

// Writes the current `ngx.terminal` state to storage. Exported so callers
// that mutate the terminal in a way that leads to real navigation (e.g. the
// `cd` command) or a drag/resize gesture ending can flush it synchronously.
export function persistTerminalState(): void {
  setItem(
    'ngx.terminal',
    JSON.stringify({
      open: ngx.terminal.open,
      minimized: ngx.terminal.minimized,
      x: ngx.terminal.x,
      y: ngx.terminal.y,
      width: ngx.terminal.width,
      height: ngx.terminal.height,
    })
  );
}

export function openTerminal(): void {
  ngx.terminal.open = true;
  ngx.terminal.minimized = false;
  ngx.mode = 'terminal';
  persistTerminalState();
  emit('ngxos:terminal-open');
}

// Was `minimizeTerminal` (collapsed to just the title bar). The floating
// title bar turned out to be intrusive on its own — users kept having to
// drag it out of the way — so there's no more partial/collapsed state: the
// chevron, Escape, and `exit` now close the window completely instead.
// `ngx.terminal.minimized` is left dormant in the store (unused, always
// false) rather than removed, since the store isn't in scope this round.
export function closeTerminal(): void {
  if (!ngx.terminal.open) {
    return;
  }

  ngx.terminal.open = false;
  ngx.mode = 'normal';
  persistTerminalState();
}

// Ctrl+Backquote is the VS Code-style terminal toggle. Exported so
// `navigation/keybinds.ts` can recognize the same chord once ngxos is
// powered on, without duplicating the modifier logic.
export function isTerminalToggleChord(event: KeyboardEvent): boolean {
  return event.ctrlKey && event.code === 'Backquote' && !event.altKey && !event.metaKey && !event.shiftKey;
}

// Always-on ignition listener (installed once in `boot()`, never removed):
// Ctrl+Backquote powers ngxos on and opens the terminal in one stroke. Once
// powered on, `navigation/keybinds.ts`'s own listener takes over handling of
// this chord (open/minimize toggle), so this handler no-ops when already on.
function handleKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented) {
    return;
  }

  if (!isTerminalToggleChord(event)) {
    return;
  }

  if (ngx.poweredOn) {
    return;
  }

  event.preventDefault();
  powerOn();
  openTerminal();
}

function handleClick(event: MouseEvent): void {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest('[data-ngx-command="power"]')) {
    togglePower();
  }
}

interface StoredTerminalState {
  open: boolean;
  minimized: boolean;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

const EMPTY_TERMINAL_STATE: StoredTerminalState = {
  open: false,
  minimized: false,
  x: null,
  y: null,
  width: null,
  height: null,
};

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readTerminalState(): StoredTerminalState {
  try {
    const raw = getItem('ngx.terminal');

    if (!raw) {
      return { ...EMPTY_TERMINAL_STATE };
    }

    const parsed = JSON.parse(raw);

    return {
      open: Boolean(parsed.open),
      minimized: Boolean(parsed.minimized),
      x: numberOrNull(parsed.x),
      y: numberOrNull(parsed.y),
      width: numberOrNull(parsed.width),
      height: numberOrNull(parsed.height),
    };
  } catch {
    return { ...EMPTY_TERMINAL_STATE };
  }
}

function initFromUrlParam(): void {
  const params = new URLSearchParams(location.search);

  if (params.get('ngxos') === 'on') {
    setItem('ngx.power', 'on');
  }
}

function initStoreFromPersist(): void {
  ngx.poweredOn = getItem('ngx.power') === 'on';
  ngx.theme = getItem('ngx.theme') ?? 'default';
  ngx.terminal = readTerminalState();
  ngx.route = location.pathname;
  ngx.reducedMotion = prefersReducedMotion();
}

export function boot(): void {
  if (booted) {
    return;
  }

  booted = true;

  try {
    initFromUrlParam();
    initStoreFromPersist();

    applyPowerState(ngx.poweredOn);
    if (ngx.poweredOn) {
      applyTheme(ngx.theme);
    }

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('click', handleClick);
    window.addEventListener('pageshow', syncFromStorage);

    const powerButton = document.querySelector('[data-ngx-command="power"]');
    if (powerButton instanceof HTMLElement) {
      powerButton.removeAttribute('hidden');
    }

    emit('ngxos:boot');
    if (ngx.poweredOn) {
      emit('ngxos:power-on');
    }
  } catch (error) {
    console.error('[ngxos] boot failed', error);
  }
}

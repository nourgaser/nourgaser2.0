// The single window keydown dispatcher for ngxos. Structured as a small
// mode-dispatch table so later milestones (hints mode, etc.) can extend it
// without touching the guard logic below.
import { ngx } from '../core/store.svelte';
import { openTerminal, closeTerminal, isTerminalToggleChord } from '../core/kernel';
import {
  focusAdjacentSection,
  focusFirstSection,
  focusLastSection,
  clearSectionFocus,
  activateFocusedSection,
} from './section-registry';
import { startHints, stopHints, typeHintChar, getMatchedTarget, isHintLabelChar } from './hints';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

function isTerminalOpenShortcut(event: KeyboardEvent): boolean {
  if (event.key === '/') {
    return true;
  }

  return event.shiftKey && (event.key === ' ' || event.code === 'Space');
}

// --- Hints mode -------------------------------------------------------
let hintsScrollListenersInstalled = false;

function handleHintsScrollOrResize(): void {
  exitHints();
}

function installHintsScrollListeners(): void {
  if (hintsScrollListenersInstalled) {
    return;
  }

  hintsScrollListenersInstalled = true;
  window.addEventListener('scroll', handleHintsScrollOrResize, { passive: true, capture: true });
  window.addEventListener('resize', handleHintsScrollOrResize);
}

function removeHintsScrollListeners(): void {
  if (!hintsScrollListenersInstalled) {
    return;
  }

  hintsScrollListenersInstalled = false;
  window.removeEventListener('scroll', handleHintsScrollOrResize, true);
  window.removeEventListener('resize', handleHintsScrollOrResize);
}

function enterHints(): void {
  ngx.mode = 'hints';
  startHints();
  installHintsScrollListeners();
}

function exitHints(): void {
  ngx.mode = 'normal';
  stopHints();
  removeHintsScrollListeners();
}

function handleHintsMode(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    exitHints();
    return;
  }

  if (!isHintLabelChar(event.key)) {
    exitHints();
    return;
  }

  const result = typeHintChar(event.key);

  if (result === 'no-match') {
    exitHints();
    return;
  }

  event.preventDefault();

  if (result === 'matched') {
    const target = getMatchedTarget();
    exitHints();
    target?.el.click();
  }
}

// --- Normal mode --------------------------------------------------------
// Two-key `gg` sequence: a pending `g` expires after ~500ms if not followed
// by a second `g`.
let pendingGTimeout: ReturnType<typeof setTimeout> | null = null;

function clearPendingG(): void {
  if (pendingGTimeout !== null) {
    clearTimeout(pendingGTimeout);
    pendingGTimeout = null;
  }
}

function handleNormalMode(event: KeyboardEvent): void {
  if (isTerminalOpenShortcut(event)) {
    clearPendingG();
    event.preventDefault();
    openTerminal();
    return;
  }

  if (event.key === 'Escape') {
    clearPendingG();

    if (ngx.terminal.open) {
      event.preventDefault();
      closeTerminal();
      return;
    }

    if (ngx.focusedSectionId) {
      event.preventDefault();
      clearSectionFocus();
    }

    return;
  }

  if (event.key === '?') {
    clearPendingG();
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('ngxos:help-toggle'));
    return;
  }

  if (event.key === 'f') {
    clearPendingG();
    event.preventDefault();
    enterHints();
    return;
  }

  if (event.key === 'G') {
    clearPendingG();
    event.preventDefault();
    focusLastSection();
    return;
  }

  if (event.key === 'g') {
    if (pendingGTimeout !== null) {
      clearPendingG();
      event.preventDefault();
      focusFirstSection();
    } else {
      pendingGTimeout = setTimeout(() => {
        pendingGTimeout = null;
      }, 500);
    }

    return;
  }

  if (event.key === 'j') {
    clearPendingG();
    event.preventDefault();
    focusAdjacentSection(1);
    return;
  }

  if (event.key === 'k') {
    clearPendingG();
    event.preventDefault();
    focusAdjacentSection(-1);
    return;
  }

  if (event.key === 'Enter') {
    clearPendingG();

    if (ngx.focusedSectionId && activateFocusedSection()) {
      event.preventDefault();
    }

    return;
  }

  clearPendingG();
}

const MODE_HANDLERS: Record<typeof ngx.mode, (event: KeyboardEvent) => void> = {
  normal: handleNormalMode,
  terminal: handleNormalMode,
  hints: handleHintsMode,
};

function handleKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented) {
    return;
  }

  // Ctrl+Backquote must work everywhere ngxos is powered on — including
  // while focus sits inside the terminal's own input — so it's handled
  // before the modifier and editable-target bails below.
  if (isTerminalToggleChord(event)) {
    event.preventDefault();

    if (ngx.poweredOn) {
      if (ngx.terminal.open) {
        closeTerminal();
      } else {
        openTerminal();
      }
    }

    return;
  }

  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }

  if (isEditableTarget(event.target)) {
    return;
  }

  if (!ngx.poweredOn) {
    return;
  }

  (MODE_HANDLERS[ngx.mode] ?? handleNormalMode)(event);
}

let installed = false;

export function installKeybinds(): void {
  if (installed) {
    return;
  }

  installed = true;
  window.addEventListener('keydown', handleKeydown);
}

export function removeKeybinds(): void {
  if (!installed) {
    return;
  }

  installed = false;
  window.removeEventListener('keydown', handleKeydown);
}

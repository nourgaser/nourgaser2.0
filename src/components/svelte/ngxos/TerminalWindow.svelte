<script lang="ts">
  import { tick, onMount } from 'svelte';
  import { ngx } from '../../../lib/ngxos/core/store.svelte';
  import { closeTerminal, persistTerminalState } from '../../../lib/ngxos/core/kernel';
  import {
    shellState,
    submitLine,
    historyPrev,
    historyNext,
    cwdDisplay,
    promptLabel,
    tabComplete,
    resetCompletion,
    moveCompletionSelection,
  } from '../../../lib/ngxos/core/shell.svelte';
  import { themes, applyThemeChoice } from '../../../lib/ngxos/effects/themes';
  import TerminalLine from './TerminalLine.svelte';
  import shieldUrl from '../../../assets/icons/ngxos-shield.svg?url';

  let inputEl: HTMLInputElement | undefined;
  let bodyEl: HTMLDivElement | undefined;
  let terminalEl: HTMLDivElement | undefined;
  let value = $state('');
  let menuOpen = $state(false);

  // Keydowns that don't change the input value (or are the shift half of
  // Shift+Tab) shouldn't reset an in-progress Tab-completion cycle.
  const NON_RESETTING_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

  const MIN_WIDTH = 360;
  const MIN_HEIGHT = 240;

  function clamp(input: number, min: number, max: number): number {
    return Math.min(Math.max(input, min), Math.max(min, max));
  }

  // Custom left/top/width/height override the default CSS top-right
  // placement/size once the user has dragged or resized. Computed as plain
  // functions (not `$derived`) since they're read directly in the template
  // on every render, which is all a `$derived` would do anyway here.
  function positionStyle(): string {
    if (ngx.terminal.x === null || ngx.terminal.y === null) {
      return '';
    }

    return `left: ${ngx.terminal.x}px; top: ${ngx.terminal.y}px; right: auto;`;
  }

  function sizeStyle(): string {
    let style = '';

    if (ngx.terminal.width !== null) {
      style += `width: ${ngx.terminal.width}px; `;
    }

    if (ngx.terminal.height !== null) {
      style += `height: ${ngx.terminal.height}px;`;
    }

    return style;
  }

  // Stored position/size may be stale (or simply absent) relative to the
  // current viewport — e.g. the browser window was resized since the last
  // visit. Clamp once on mount so a restored window is never off-screen.
  onMount(() => {
    if (!terminalEl) {
      return;
    }

    const rect = terminalEl.getBoundingClientRect();

    if (ngx.terminal.x !== null) {
      ngx.terminal.x = clamp(ngx.terminal.x, 0, Math.max(0, window.innerWidth - rect.width));
    }

    if (ngx.terminal.y !== null) {
      ngx.terminal.y = clamp(ngx.terminal.y, 0, Math.max(0, window.innerHeight - rect.height));
    }
  });

  // --- Drag (title bar) ---------------------------------------------------
  // Pointer capture on the header itself means drag tracking needs no
  // window-level listeners: once captured, the header keeps receiving
  // pointermove/up for that pointer even if it strays outside its bounds.
  let dragOffset: { dx: number; dy: number } | null = null;

  function handleHeaderPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !terminalEl) {
      return;
    }

    const target = event.target;
    if (target instanceof Element && target.closest('button')) {
      return;
    }

    const rect = terminalEl.getBoundingClientRect();
    dragOffset = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    document.body.style.userSelect = 'none';
  }

  function handleHeaderPointerMove(event: PointerEvent): void {
    if (!dragOffset || !terminalEl) {
      return;
    }

    event.preventDefault();

    const rect = terminalEl.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth - rect.width);
    const maxY = Math.max(0, window.innerHeight - rect.height);

    ngx.terminal.x = clamp(event.clientX - dragOffset.dx, 0, maxX);
    ngx.terminal.y = clamp(event.clientY - dragOffset.dy, 0, maxY);
  }

  function handleHeaderPointerUp(): void {
    if (!dragOffset) {
      return;
    }

    dragOffset = null;
    document.body.style.userSelect = '';
    persistTerminalState();
  }

  // --- Resize (bottom-right corner handle) --------------------------------
  // A custom pointer-driven handle rather than native CSS `resize: both`:
  // native resize can't be restyled to match the terminal's rounded/mono
  // chrome, and reading the result back still needs a ResizeObserver to
  // persist it — a plain pointer drag (same pattern as the header drag
  // above) gets min/max clamping and persistence for free with less
  // machinery.
  let resizeStart: { startX: number; startY: number; startWidth: number; startHeight: number } | null = null;

  function handleResizePointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !terminalEl) {
      return;
    }

    const rect = terminalEl.getBoundingClientRect();
    resizeStart = { startX: event.clientX, startY: event.clientY, startWidth: rect.width, startHeight: rect.height };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    document.body.style.userSelect = 'none';
    event.stopPropagation();
  }

  function handleResizePointerMove(event: PointerEvent): void {
    if (!resizeStart || !terminalEl) {
      return;
    }

    event.preventDefault();

    const rect = terminalEl.getBoundingClientRect();
    const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - rect.left);
    const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - rect.top);

    ngx.terminal.width = clamp(resizeStart.startWidth + (event.clientX - resizeStart.startX), MIN_WIDTH, maxWidth);
    ngx.terminal.height = clamp(resizeStart.startHeight + (event.clientY - resizeStart.startY), MIN_HEIGHT, maxHeight);
  }

  function handleResizePointerUp(): void {
    if (!resizeStart) {
      return;
    }

    resizeStart = null;
    document.body.style.userSelect = '';
    persistTerminalState();
  }

  // Pins scroll to the absolute bottom — must run on every scrollback
  // append, on terminal open/restore, and on prompt focus/keydown, or the
  // input row can end up sitting just past the visible edge.
  function scrollToBottom(): void {
    if (bodyEl) {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }
  }

  // Autofocus the input whenever the terminal opens.
  $effect(() => {
    if (ngx.terminal.open) {
      tick().then(() => {
        inputEl?.focus();
        scrollToBottom();
      });
    }
  });

  // Auto-scroll to bottom whenever scrollback grows, program mode toggles,
  // or the completion row appears/changes (its height shifts the prompt row
  // without touching `lines`, so it needs its own tracked dependency here).
  $effect(() => {
    void shellState.lines.length;
    void shellState.programPrompt;
    void shellState.completion;

    tick().then(scrollToBottom);
  });

  // Readline-style word motion (whitespace-delimited — plenty for a shell
  // input). Shared by Alt+Backspace and Alt+Left/Right below.
  function wordBoundaryBefore(text: string, caret: number): number {
    let i = caret;
    while (i > 0 && /\s/.test(text[i - 1])) i--;
    while (i > 0 && !/\s/.test(text[i - 1])) i--;
    return i;
  }

  function wordBoundaryAfter(text: string, caret: number): number {
    let i = caret;
    while (i < text.length && /\s/.test(text[i])) i++;
    while (i < text.length && !/\s/.test(text[i])) i++;
    return i;
  }

  function moveCaretByWord(direction: -1 | 1): void {
    if (!inputEl) return;
    const caret = inputEl.selectionStart ?? value.length;
    const target = direction === -1 ? wordBoundaryBefore(value, caret) : wordBoundaryAfter(value, caret);
    inputEl.setSelectionRange(target, target);
  }

  function deleteWordBeforeCaret(): void {
    if (!inputEl) return;
    const caret = inputEl.selectionStart ?? value.length;
    const start = wordBoundaryBefore(value, caret);
    value = value.slice(0, start) + value.slice(caret);
    // `value` only takes effect in the DOM after Svelte re-renders.
    tick().then(() => inputEl?.setSelectionRange(start, start));
  }

  function handleInputKeydownInner(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      // Tab must never move focus off the input, whether or not there's
      // anything to complete.
      event.preventDefault();
      value = tabComplete(value, event.shiftKey ? -1 : 1);
      return;
    }

    // Alt-word-motion (readline-style). Handled before anything else: Alt is
    // not itself a completion action, but Alt+Left/Right must always be
    // prevented (browsers treat them as page-history back/forward, which
    // would navigate away mid-typing) regardless of menu state, and word
    // motion resets any open completion like any other typing/caret key.
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      resetCompletion();
      moveCaretByWord(event.key === 'ArrowLeft' ? -1 : 1);
      return;
    }

    if (event.altKey && event.key === 'Backspace') {
      event.preventDefault();
      resetCompletion();
      deleteWordBeforeCaret();
      return;
    }

    // While the Tab-completion menu is active, arrow keys belong to it
    // (menu-select navigation) instead of their normal jobs (caret move /
    // command history) — Up/Down history only applies once the menu closes.
    if (shellState.completion) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        value = moveCompletionSelection(-1) ?? value;
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        value = moveCompletionSelection(1) ?? value;
        return;
      }

      if (event.key === 'Enter') {
        // The highlighted candidate is already reflected in `value` (every
        // selection change rewrites it) — Enter just confirms/closes the
        // menu instead of submitting the line.
        event.preventDefault();
        resetCompletion();
        return;
      }

      if (event.key === 'Escape') {
        // Closes the menu only, leaving the input exactly as-is.
        event.preventDefault();
        resetCompletion();
        return;
      }
    }

    if (!NON_RESETTING_KEYS.has(event.key)) {
      resetCompletion();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const previous = historyPrev();
      if (previous !== undefined) {
        value = previous;
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = historyNext();
      if (next !== undefined) {
        value = next;
      }
      return;
    }

    if (event.key === 'Escape') {
      // Collapse-to-title-bar is gone — Escape now closes the terminal
      // completely, same as the chevron and `exit`.
      closeTerminal();
    }
  }

  // Wraps the real handler so every keydown — regardless of which branch
  // above ran or returned early — re-pins scroll to the bottom afterward,
  // once Svelte's flushed any `value`/DOM change the branch made.
  function handleInputKeydown(event: KeyboardEvent): void {
    handleInputKeydownInner(event);
    tick().then(scrollToBottom);
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const raw = value;
    value = '';
    void submitLine(raw);
  }

  function closeMenu(): void {
    menuOpen = false;
  }

  function handleMenuButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    menuOpen = !menuOpen;
  }

  function handleThemeChoice(id: string): void {
    applyThemeChoice(id);
    closeMenu();
  }

  function handleHelpChoice(): void {
    closeMenu();
    void submitLine('help');
  }

  function handlePowerOffChoice(): void {
    closeMenu();
    void submitLine('poweroff');
  }

  // Click-anywhere-focuses-input (user-reported UX fix). Uses `click`
  // (fires after mouseup, once any text selection has settled) rather than
  // `mousedown`, so checking `getSelection()` is enough to skip focusing
  // when the click was actually a text-selection drag — no separate
  // mousedown/mouseup bookkeeping needed.
  function handleWindowClick(event: MouseEvent): void {
    const target = event.target;

    if (target instanceof Element && target.closest('button, a, input, [role="button"]')) {
      return;
    }

    if (window.getSelection()?.toString()) {
      return;
    }

    inputEl?.focus();
  }

  function handleWindowKeydown(event: KeyboardEvent): void {
    if (menuOpen && event.key === 'Escape') {
      closeMenu();
    }
  }
</script>

{#if ngx.terminal.open}
  <div
    class="ngxos-terminal"
    style={`${positionStyle()} ${sizeStyle()}`}
    data-ngx-ui
    bind:this={terminalEl}
    onclick={handleWindowClick}
    onkeydown={handleWindowKeydown}
  >
    <div
      class="ngxos-terminal-header"
      onpointerdown={handleHeaderPointerDown}
      onpointermove={handleHeaderPointerMove}
      onpointerup={handleHeaderPointerUp}
      onpointercancel={handleHeaderPointerUp}
    >
      <span class="ngxos-terminal-brand">
        <img src={shieldUrl} alt="" aria-hidden="true" class="ngxos-terminal-brand-icon" />
        <span>ngxos</span>
      </span>
      <span class="ngxos-terminal-breadcrumb">guest@ngxos:{cwdDisplay()}</span>
      <span class="ngxos-terminal-actions">
        <button
          type="button"
          class="ngxos-terminal-icon-button"
          aria-label="Terminal menu"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onclick={handleMenuButtonClick}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <button
          type="button"
          class="ngxos-terminal-icon-button ngxos-terminal-chevron"
          aria-label="Close terminal"
          onclick={(event) => {
            event.stopPropagation();
            closeTerminal();
          }}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M5 12l5-5 5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
          <span class="ngxos-terminal-esc-hint">esc</span>
        </button>
      </span>
    </div>

    {#if menuOpen}
      <button type="button" class="ngxos-terminal-menu-backdrop" aria-label="Close menu" onclick={closeMenu}></button>
      <div class="ngxos-terminal-menu" role="menu">
        <div class="ngxos-terminal-menu-label">Themes</div>
        {#each themes as theme (theme.id)}
          <button
            type="button"
            class="ngxos-terminal-menu-row"
            role="menuitem"
            onclick={() => handleThemeChoice(theme.id)}
          >
            <span class="ngxos-terminal-menu-swatches" data-theme={theme.id}>
              {#each Array.from({ length: 6 }) as _, index (index)}
                <span class="ngxos-mini-swatch" style={`background: var(--swatch-${index})`}></span>
              {/each}
            </span>
            <span>{theme.label}</span>
          </button>
        {/each}
        <div class="ngxos-terminal-menu-divider"></div>
        <button type="button" class="ngxos-terminal-menu-row" role="menuitem" onclick={handleHelpChoice}>
          Help
        </button>
        <button type="button" class="ngxos-terminal-menu-row" role="menuitem" onclick={handlePowerOffChoice}>
          Power off
        </button>
      </div>
    {/if}

    <div class="ngxos-terminal-body" bind:this={bodyEl}>
      {#each shellState.lines as line, index (index)}
        <TerminalLine {line} />
      {/each}

      <form class="ngxos-terminal-prompt" onsubmit={handleSubmit}>
        <span class="ngxos-terminal-prompt-label">{promptLabel()}</span>
        <input
          type="text"
          class="ngxos-terminal-input"
          bind:this={inputEl}
          bind:value
          onkeydown={handleInputKeydown}
          onfocus={scrollToBottom}
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="ngxos terminal input"
        />
      </form>

      {#if shellState.completion}
        <div class="ngxos-terminal-completions">
          {#each shellState.completion.candidates as candidate, index (candidate)}
            <span class:ngxos-terminal-completions-selected={index === shellState.completion.selected}>{candidate}</span>
          {/each}
        </div>
      {/if}
    </div>

    <div
      class="ngxos-terminal-resize-handle"
      onpointerdown={handleResizePointerDown}
      onpointermove={handleResizePointerMove}
      onpointerup={handleResizePointerUp}
      onpointercancel={handleResizePointerUp}
      aria-label="Resize terminal"
    ></div>
  </div>
{/if}

<style>
  .ngxos-terminal {
    position: fixed;
    top: calc(var(--nav-height) + 16px);
    right: 16px;
    width: var(--terminal-width);
    max-width: calc(100vw - 32px);
    height: var(--terminal-height);
    z-index: var(--z-terminal);
    display: flex;
    flex-direction: column;
    background: var(--bg-terminal);
    border: 1px solid var(--border-terminal);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-terminal);
    font-family: var(--font-mono);
    color: var(--text-primary);
    /* `visible` (not `hidden`) so the hamburger dropdown, which is
       positioned absolute within this box, isn't clipped — the header/body
       reapply the corner radius below so the rounded frame still reads
       correctly. */
    overflow: visible;
  }

  .ngxos-terminal-header {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: var(--terminal-header-height);
    min-height: var(--terminal-header-height);
    padding: 0 var(--space-4);
    background: var(--bg-terminal-header);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    /* Structural separator between title bar and body — works in every
       theme (including vgcolors, where the header/body backgrounds are
       nearly identical) without needing a theme-specific hack. */
    border-bottom: 1px solid var(--border-terminal);
    cursor: grab;
    touch-action: none;
  }

  .ngxos-terminal-brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 700;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .ngxos-terminal-brand-icon {
    width: 18px;
    height: 18px;
    display: block;
  }

  .ngxos-terminal-breadcrumb {
    flex: 1;
    text-align: center;
    color: var(--text-accent);
    font-size: var(--text-sm);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ngxos-terminal-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .ngxos-terminal-icon-button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px;
    border-radius: var(--radius-sm);
    color: var(--text-accent);
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  .ngxos-terminal-icon-button:hover,
  .ngxos-terminal-icon-button:focus-visible {
    background: color-mix(in srgb, var(--text-accent) 15%, transparent);
  }

  .ngxos-terminal-icon-button svg {
    width: 18px;
    height: 18px;
  }

  .ngxos-terminal-chevron {
    flex-direction: column;
    line-height: 1;
  }

  .ngxos-terminal-esc-hint {
    font-size: 9px;
    color: var(--text-dimmed);
  }

  .ngxos-terminal-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    scrollbar-width: thin;
    scrollbar-color: var(--text-dimmed) transparent;
  }

  .ngxos-terminal-body::-webkit-scrollbar {
    width: 6px;
  }

  .ngxos-terminal-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .ngxos-terminal-body::-webkit-scrollbar-thumb {
    background: var(--text-dimmed);
    border-radius: 3px;
  }

  .ngxos-terminal-body::-webkit-scrollbar-thumb:hover {
    background: var(--text-accent);
  }

  .ngxos-terminal-body::-webkit-scrollbar-corner {
    background: transparent;
  }

  .ngxos-terminal-resize-handle {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 14px;
    height: 14px;
    cursor: nwse-resize;
    touch-action: none;
    background: linear-gradient(
      135deg,
      transparent 0 40%,
      var(--text-dimmed) 40% 46%,
      transparent 46% 60%,
      var(--text-dimmed) 60% 66%,
      transparent 66%
    );
  }

  .ngxos-terminal-menu-backdrop {
    all: unset;
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-terminal) + 1);
    cursor: default;
  }

  .ngxos-terminal-menu {
    position: absolute;
    top: calc(var(--terminal-header-height) + var(--space-2));
    right: var(--space-3);
    z-index: calc(var(--z-terminal) + 2);
    display: flex;
    flex-direction: column;
    min-width: 180px;
    padding: var(--space-2);
    background: var(--bg-terminal-header);
    border: 1px solid var(--border-terminal);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-terminal);
    font-family: var(--font-mono);
  }

  .ngxos-terminal-menu-label {
    padding: var(--space-1) var(--space-2);
    color: var(--text-dimmed);
    font-size: var(--text-sm);
  }

  .ngxos-terminal-menu-row {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2);
    color: var(--text-primary);
    font-family: inherit;
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .ngxos-terminal-menu-row:hover,
  .ngxos-terminal-menu-row:focus-visible {
    background: var(--bg-button);
  }

  .ngxos-terminal-menu-swatches {
    display: inline-flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .ngxos-mini-swatch {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    display: inline-block;
  }

  .ngxos-terminal-menu-divider {
    margin: var(--space-2) 0;
    border-top: 1px solid var(--border-terminal);
  }

  .ngxos-terminal-completions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: 2px 0;
    font-size: var(--text-sm);
  }

  .ngxos-terminal-completions span {
    color: var(--text-dimmed);
    padding: 0 4px;
    border-radius: var(--radius-sm);
  }

  /* zsh menu-select: the highlighted candidate reads as inverse video
     against the dimmed rest of the row. */
  .ngxos-terminal-completions-selected {
    color: var(--bg-terminal);
    background: var(--text-accent);
  }

  .ngxos-terminal-prompt {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: 2px 0;
  }

  .ngxos-terminal-prompt-label {
    color: var(--text-primary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ngxos-terminal-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
    caret-color: var(--text-accent);
  }

  @media (max-width: 768px), (pointer: coarse) {
    .ngxos-terminal {
      display: none;
    }
  }
</style>

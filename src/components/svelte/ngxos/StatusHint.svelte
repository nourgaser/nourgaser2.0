<script lang="ts">
  import { onMount } from 'svelte';
  import { getItem, setItem } from '../../../lib/ngxos/core/persist';

  // Default hidden to avoid a flash-then-hide before the persisted
  // dismissal state (localStorage) can be checked in `onMount`.
  let dismissed = $state(true);

  onMount(() => {
    dismissed = getItem('ngx.statushint') === 'dismissed';
  });

  function dismiss(): void {
    dismissed = true;
    setItem('ngx.statushint', 'dismissed');
  }
</script>

{#if !dismissed}
  <div class="ngx-status-hint" data-ngx-ui>
    <span>? keys &middot; ctrl+` terminal</span>
    <button type="button" class="ngx-status-hint-close" aria-label="Dismiss hint" onclick={dismiss}>&times;</button>
  </div>
{/if}

<style>
  .ngx-status-hint {
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: var(--z-overlay);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    background: var(--bg-terminal);
    border: 1px solid var(--border-terminal);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-dimmed);
  }

  .ngx-status-hint-close {
    all: unset;
    cursor: pointer;
    color: var(--text-dimmed);
    line-height: 1;
  }

  /* The hints it advertises (keyboard shortcuts, the terminal toggle) are
     desktop-only — the terminal itself is hidden under this same condition
     — so the hint is just noise on mobile/coarse pointers. */
  @media (max-width: 768px), (pointer: coarse) {
    .ngx-status-hint {
      display: none;
    }
  }
</style>

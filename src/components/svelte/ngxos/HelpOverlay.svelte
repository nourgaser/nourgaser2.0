<script lang="ts">
  import { onMount } from 'svelte';
  import { listCommands } from '../../../lib/ngxos/core/registry';

  let open = $state(false);
  let panelEl: HTMLDivElement | undefined;

  const keybindings: Array<{ keys: string; description: string }> = [
    { keys: 'Ctrl+`', description: 'Open / minimize the terminal' },
    { keys: '/', description: 'Open the terminal' },
    { keys: 'j / k', description: 'Focus next / previous section' },
    { keys: 'gg / G', description: 'Focus first / last section' },
    { keys: 'f', description: 'Enter hint mode — click a link/button by its label' },
    { keys: 'Enter', description: "Activate the focused section's first link/button" },
    { keys: '?', description: 'Toggle this help overlay' },
    { keys: 'Esc', description: 'Close overlays / minimize terminal / clear section focus' },
  ];

  function close(): void {
    open = false;
  }

  function handleToggle(): void {
    open = !open;
  }

  function handleWindowKeydown(event: KeyboardEvent): void {
    if (open && event.key === 'Escape') {
      close();
    }
  }

  function handleOutsideClick(event: MouseEvent): void {
    if (!open || !panelEl) {
      return;
    }

    if (event.target instanceof Node && !panelEl.contains(event.target)) {
      close();
    }
  }

  onMount(() => {
    document.addEventListener('ngxos:help-toggle', handleToggle);
    window.addEventListener('keydown', handleWindowKeydown);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('ngxos:help-toggle', handleToggle);
      window.removeEventListener('keydown', handleWindowKeydown);
      document.removeEventListener('click', handleOutsideClick);
    };
  });
</script>

{#if open}
  <div class="ngx-help-backdrop" data-ngx-ui>
    <div class="ngx-help-panel" bind:this={panelEl} role="dialog" aria-modal="true" aria-label="ngxos help">
      <button type="button" class="ngx-help-close" aria-label="Close help" onclick={close}>&times;</button>

      <h2 class="ngx-help-title">Keybindings</h2>
      <dl class="ngx-help-list">
        {#each keybindings as bind (bind.keys)}
          <dt>{bind.keys}</dt>
          <dd>{bind.description}</dd>
        {/each}
      </dl>

      <h2 class="ngx-help-title">Commands</h2>
      <dl class="ngx-help-list">
        {#each listCommands() as command (command.name)}
          <dt>{command.name}</dt>
          <dd>{command.description}</dd>
        {/each}
      </dl>
    </div>
  </div>
{/if}

<style>
  .ngx-help-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .ngx-help-panel {
    position: relative;
    width: min(480px, calc(100vw - 32px));
    max-height: min(600px, calc(100vh - 64px));
    overflow-y: auto;
    padding: var(--space-6);
    background: var(--bg-terminal);
    border: 1px solid var(--border-terminal);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-terminal);
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .ngx-help-close {
    all: unset;
    position: absolute;
    top: var(--space-3);
    right: var(--space-4);
    cursor: pointer;
    color: var(--text-accent);
    font-size: var(--text-lg);
    line-height: 1;
  }

  .ngx-help-title {
    margin: 0 0 var(--space-2);
    font-size: var(--text-base);
    color: var(--text-accent);
  }

  .ngx-help-list {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--space-1) var(--space-4);
    margin: 0 0 var(--space-6);
    font-size: var(--text-sm);
  }

  .ngx-help-list dt {
    color: var(--text-accent-2);
    white-space: nowrap;
  }

  .ngx-help-list dd {
    margin: 0;
    color: var(--text-primary);
  }
</style>

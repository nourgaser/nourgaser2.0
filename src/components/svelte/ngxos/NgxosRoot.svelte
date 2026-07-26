<script lang="ts">
  import { onMount, type Component } from 'svelte';
  import { boot } from '../../../lib/ngxos/core/kernel';
  import { ngx } from '../../../lib/ngxos/core/store.svelte';
  import { initShell } from '../../../lib/ngxos/core/shell.svelte';
  import { initRoutes } from '../../../lib/ngxos/navigation/routes';
  import { scanSections } from '../../../lib/ngxos/navigation/section-registry';
  import { installKeybinds, removeKeybinds } from '../../../lib/ngxos/navigation/keybinds';
  import { registerBaseCommands } from '../../../lib/ngxos/commands';
  import HintOverlay from './HintOverlay.svelte';
  import HelpOverlay from './HelpOverlay.svelte';
  import StatusHint from './StatusHint.svelte';
  import ThemeDock from './ThemeDock.svelte';

  let { projectSlugs = [] }: { projectSlugs?: string[] } = $props();

  let TerminalWindowComponent: Component | null = $state(null);

  async function ensureTerminalLoaded(): Promise<void> {
    if (TerminalWindowComponent) {
      return;
    }

    const mod = await import('./TerminalWindow.svelte');
    TerminalWindowComponent = mod.default;
  }

  onMount(() => {
    initRoutes(projectSlugs);
    initShell();
    scanSections();
    registerBaseCommands();
    boot();
  });

  // Reactively installs/removes the keydown dispatcher and lazy-loads the
  // terminal chunk only once it's actually needed (power on + previously
  // open, e.g. restored via `ngx.terminal` after a `cd` navigation).
  $effect(() => {
    if (ngx.poweredOn) {
      installKeybinds();
      // Re-scan on power-on: guarantees the section cache (and the
      // `ngxos:content-swapped` re-scan subscription it lazily installs)
      // is fresh even if the DOM changed while ngxos was off.
      scanSections();

      if (ngx.terminal.open) {
        void ensureTerminalLoaded();
      }
    } else {
      removeKeybinds();
    }
  });
</script>

{#if ngx.poweredOn && ngx.terminal.open && TerminalWindowComponent}
  <TerminalWindowComponent />
{/if}

{#if ngx.poweredOn}
  <HelpOverlay />
  <StatusHint />
  <ThemeDock />
{/if}

{#if ngx.poweredOn && ngx.mode === 'hints'}
  <HintOverlay />
{/if}

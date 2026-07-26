<script lang="ts">
  // Mobile-only theme switcher: on coarse/narrow viewports the terminal
  // (and with it, the `theme` command + hamburger menu — the only other
  // switchers) is hidden entirely, so there's otherwise no way to change
  // themes at all on a phone.
  //
  // Rendered inline in the footer rather than as a floating overlay (it
  // used to float fixed-bottom, which overlapped footer content) — on
  // mount, the root element is physically moved into the empty
  // `[data-ngx-slot="theme-dock"]` placeholder MainLayout.astro renders
  // right after "Powered by ngxos", so it becomes a normal row in the
  // document flow and scrolls with the page. If that slot isn't present
  // (e.g. a layout that doesn't include it), it falls back to the original
  // fixed-corner placement so the component still works standalone.
  import { onMount } from 'svelte';
  import { ngx } from '../../../lib/ngxos/core/store.svelte';
  import { themes, applyThemeChoice } from '../../../lib/ngxos/effects/themes';

  let rootEl: HTMLDivElement | undefined;
  let slotted = $state(false);

  onMount(() => {
    const slot = document.querySelector('[data-ngx-slot="theme-dock"]');

    if (slot && rootEl) {
      slot.appendChild(rootEl);
      slotted = true;
    }
  });
</script>

<div
  class="ngx-theme-dock"
  class:ngx-theme-dock--slotted={slotted}
  data-ngx-ui
  role="group"
  aria-label="Theme"
  bind:this={rootEl}
>
  {#each themes as theme (theme.id)}
    <button
      type="button"
      class="ngx-theme-dock-dot"
      class:ngx-theme-dock-dot--active={ngx.theme === theme.id}
      aria-label={`Switch to ${theme.label} theme`}
      aria-pressed={ngx.theme === theme.id}
      onclick={() => applyThemeChoice(theme.id)}
    >
      <span class="ngx-theme-dock-swatch" data-theme={theme.id}></span>
    </button>
  {/each}
</div>

<style>
  /* Default/fallback: floating pill, used only when the footer slot isn't
     found (see `onMount` above). */
  .ngx-theme-dock {
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: var(--z-overlay);
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 var(--space-1);
    background: color-mix(in srgb, var(--bg-terminal) 85%, transparent);
    border: 1px solid var(--border-terminal);
    border-radius: var(--radius-lg);
    font-family: var(--font-mono);
  }

  /* Once moved into the footer slot: a normal in-flow row, centered to
     match the footer's own centered typography rhythm — no more
     fixed/overlay positioning. */
  .ngx-theme-dock--slotted {
    position: static;
    bottom: auto;
    right: auto;
    z-index: auto;
    justify-content: center;
    gap: var(--space-1);
    padding: var(--space-2) 0 0;
    background: none;
    border: none;
    border-radius: 0;
  }

  /* Real 44px-ish touch targets even though the visible dot is small — the
     button is the hit area, the span is just the swatch. */
  .ngx-theme-dock-dot {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    cursor: pointer;
  }

  .ngx-theme-dock-swatch {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--swatch-0);
    border: 1px solid var(--border-terminal);
    transition: transform 120ms ease;
  }

  .ngx-theme-dock-dot--active .ngx-theme-dock-swatch {
    transform: scale(1.2);
    box-shadow:
      0 0 0 2px var(--bg-terminal),
      0 0 0 3px var(--text-accent);
  }

  /* Shown only on mobile/coarse pointers — the exact inverse (De Morgan's)
     of the terminal's own `(max-width: 768px), (pointer: coarse)` hide
     query, so the two conditions can never both be true or both be false. */
  @media (min-width: 769px) and (pointer: fine) {
    .ngx-theme-dock {
      display: none;
    }
  }
</style>

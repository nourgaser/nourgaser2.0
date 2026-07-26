<script lang="ts">
  import { onMount } from 'svelte';
  import { getActiveTargets, getTypedPrefix, type HintTarget } from '../../../lib/ngxos/navigation/hints';

  // `hints.ts` is a plain `.ts` module (no Svelte runes available there), so
  // it dispatches a raw `ngxos:hints-update` CustomEvent on `document`
  // whenever the target set or typed prefix changes. We mirror that payload
  // into local `$state` here so the badge list re-renders as the user types.
  // Seed from the getters (not just the event) so the very first paint is
  // correct even if `startHints()` fired before this component finished
  // mounting and attaching its listener.
  let targets = $state<HintTarget[]>(getActiveTargets());
  let typed = $state(getTypedPrefix());

  function handleHintsUpdate(event: Event): void {
    const detail = (event as CustomEvent<{ targets: HintTarget[]; typed: string }>).detail;
    targets = detail.targets;
    typed = detail.typed;
  }

  onMount(() => {
    document.addEventListener('ngxos:hints-update', handleHintsUpdate);

    return () => {
      document.removeEventListener('ngxos:hints-update', handleHintsUpdate);
    };
  });
</script>

<div class="ngx-hint-overlay" data-ngx-ui aria-hidden="true">
  {#each targets as target (target.label)}
    {#if target.label.startsWith(typed)}
      <span
        class="ngx-hint-badge"
        style="top: {Math.max(target.rect.top, 0)}px; left: {Math.max(target.rect.left, 0)}px;"
      >
        <span class="ngx-hint-badge-matched">{target.label.slice(0, typed.length)}</span>{target.label.slice(
          typed.length
        )}
      </span>
    {/if}
  {/each}
</div>

<style>
  .ngx-hint-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-overlay);
    pointer-events: none;
  }

  .ngx-hint-badge {
    position: fixed;
    transform: translateY(-2px);
    padding: 1px 4px;
    background: var(--text-accent);
    color: var(--bg-terminal);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    line-height: 1.4;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-terminal);
    white-space: nowrap;
  }

  .ngx-hint-badge-matched {
    opacity: 0.45;
  }
</style>

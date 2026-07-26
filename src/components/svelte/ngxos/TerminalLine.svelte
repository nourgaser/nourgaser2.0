<script lang="ts">
  import type { TermLine } from '../../../lib/ngxos/core/registry';

  let { line }: { line: TermLine } = $props();
</script>

{#if line.kind === 'plain'}
  <p class="ngxos-line ngxos-line--plain">{line.text}</p>
{:else if line.kind === 'accent'}
  <p class="ngxos-line ngxos-line--accent">{line.text}</p>
{:else if line.kind === 'error'}
  <p class="ngxos-line ngxos-line--error">{line.text}</p>
{:else if line.kind === 'ascii'}
  <pre class="ngxos-line ngxos-line--ascii">{line.text}</pre>
{:else if line.kind === 'swatch-row'}
  <div class="ngxos-line ngxos-line--swatch-row" data-theme={line.theme}>
    {#each Array.from({ length: 6 }) as _, index (index)}
      <span class="ngxos-swatch" style={`background: var(--swatch-${index})`}></span>
    {/each}
  </div>
{:else if line.kind === 'kv'}
  <p class="ngxos-line ngxos-line--kv">
    <span class="ngxos-kv-key">{line.key}</span><span class="ngxos-kv-value">{line.value}</span>
  </p>
{:else if line.kind === 'neofetch'}
  <div class="ngxos-line ngxos-neofetch">
    <pre class="ngxos-neofetch-ascii">{#each line.ascii as row, rowIndex (rowIndex)}{#if rowIndex > 0}{'\n'}{/if}{#each row as segment, segmentIndex (segmentIndex)}<span
          class={segment.bright ? 'ngxos-ascii-bright' : 'ngxos-ascii-dim'}>{segment.text}</span>{/each}{/each}</pre>
    <div class="ngxos-neofetch-stats">
      <p class="ngxos-neofetch-heading">{line.heading}</p>
      <p class="ngxos-neofetch-rule">{'-'.repeat(line.heading.length)}</p>
      {#each line.stats as stat (stat.key)}
        <p class="ngxos-line--kv">
          <span class="ngxos-kv-key">{stat.key}:</span><span class="ngxos-kv-value">{stat.value}</span>
        </p>
      {/each}
      <div class="ngxos-line--swatch-row" data-theme={line.swatchTheme}>
        {#each Array.from({ length: 6 }) as _, index (index)}
          <span class="ngxos-swatch" style={`background: var(--swatch-${index})`}></span>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .ngxos-line {
    margin: 0;
    padding: 2px 0;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: var(--leading-base);
  }

  .ngxos-line--plain {
    color: var(--text-primary);
  }

  .ngxos-line--accent {
    color: var(--text-accent);
  }

  .ngxos-line--error {
    color: var(--text-error, #e5534b);
  }

  .ngxos-line--ascii {
    color: var(--text-accent);
    font-family: inherit;
    margin: 0;
  }

  .ngxos-line--swatch-row {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2) 0;
  }

  .ngxos-swatch {
    width: 20px;
    height: 20px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-terminal);
    display: inline-block;
  }

  .ngxos-line--kv {
    display: flex;
    gap: var(--space-2);
    color: var(--text-primary);
  }

  .ngxos-kv-key {
    color: var(--text-accent);
  }

  .ngxos-neofetch {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-2) 0;
  }

  .ngxos-neofetch-ascii {
    flex-shrink: 0;
    margin: 0;
    font-family: inherit;
    line-height: 1.2;
  }

  .ngxos-ascii-bright {
    color: var(--text-accent);
  }

  .ngxos-ascii-dim {
    color: var(--text-dimmed);
    opacity: 0.3;
  }

  .ngxos-neofetch-stats {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ngxos-neofetch-heading {
    margin: 0;
    color: var(--text-primary);
    font-weight: 700;
  }

  .ngxos-neofetch-rule {
    margin: 0 0 4px 0;
    color: var(--text-dimmed);
  }
</style>

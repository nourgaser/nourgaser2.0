<script lang="ts">
  import { onMount } from 'svelte';
  import type { ResolvedGame } from '../../lib/rawg/resolve';
  import { GAME_TAG_LABEL } from '../../data/games';
  import {
    DEFAULT_GAMES_LIST_STATE,
    type EraFilter,
    type GamesListState,
    type PageSizeMode,
    parseGamesListState,
    type SortDirection,
    type SortMode,
    type TagFilter,
    writeGamesListStateToSearchParams,
  } from '../../lib/rawg/games-ui-state';

  export let games: ResolvedGame[];
  export let eraCutoff = 2010;
  export let pageSize = 12;
  export let mobilePageSize = 6;
  export let initialState: GamesListState = DEFAULT_GAMES_LIST_STATE;

  function resolveInitialState(seedState: GamesListState, availableGames: ResolvedGame[]): GamesListState {
    if (typeof window === 'undefined') return seedState;
    return parseGamesListState(new URL(window.location.href).searchParams, availableGames);
  }

  const resolvedInitialState = resolveInitialState(initialState, games);

  let isOpen = resolvedInitialState.isOpen;
  let query = resolvedInitialState.query;
  let activeTag: TagFilter = resolvedInitialState.activeTag;
  let activePlatform = resolvedInitialState.activePlatform;
  let activeEra: EraFilter = resolvedInitialState.activeEra;
  let activeGenre = resolvedInitialState.activeGenre;
  let pageSizeMode: PageSizeMode = resolvedInitialState.pageSizeMode;
  let sortMode: SortMode = resolvedInitialState.sortMode;
  let sortDirection: SortDirection = resolvedInitialState.sortDirection;
  let currentPage = resolvedInitialState.currentPage;
  let isMobile = false;
  let hasMounted = false;
  let previousControlsKey: string | null = null;

  function uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }

  function compareText(left: string, right: string): number {
    return left.localeCompare(right, undefined, { sensitivity: 'base' });
  }

  function applySortDirection(value: number, direction: SortDirection): number {
    return direction === 'desc' ? -value : value;
  }

  function compareOptionalValue<T>(
    left: T | null | undefined,
    right: T | null | undefined,
    compare: (left: T, right: T) => number,
    direction: SortDirection
  ): number {
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return applySortDirection(compare(left, right), direction);
  }

  function firstSortedValue(values: string[]): string | null {
    return uniqueSorted(values)[0] ?? null;
  }

  function releaseTimestamp(value: string | null): number | null {
    if (!value) return null;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  function buildPageSizeOptions(baseSize: number): Array<{ id: PageSizeMode; label: string; value: number | 'all' }> {
    const candidates: Array<{ id: PageSizeMode; label: string; value: number | 'all' }> = [
      { id: 'less', label: `${Math.max(1, Math.floor(baseSize / 2))} per page`, value: Math.max(1, Math.floor(baseSize / 2)) },
      { id: 'default', label: `${baseSize} per page`, value: baseSize },
      { id: 'more', label: `${Math.max(baseSize + 1, baseSize * 2)} per page`, value: Math.max(baseSize + 1, baseSize * 2) },
      { id: 'all', label: 'All', value: 'all' },
    ];

    const seen = new Set<number | 'all'>();
    return candidates.filter((option) => {
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
  }

  $: availablePlatforms = uniqueSorted(games.flatMap((g) => g.platforms));
  $: availableGenres = uniqueSorted(games.flatMap((g) => g.genres));

  $: normalizedQuery = query.trim().toLowerCase();
  $: hasQuery = normalizedQuery.length > 0;

  $: filtered = games.filter((g) => {
    if (hasQuery && !g.name.toLowerCase().includes(normalizedQuery)) return false;
    if (activeTag !== 'all' && g.tag !== activeTag) return false;
    if (activePlatform !== 'all' && !g.platforms.includes(activePlatform)) return false;
    if (activeEra !== 'all') {
      if (g.year === null) return false;
      if (activeEra === 'old' && g.year >= eraCutoff) return false;
      if (activeEra === 'new' && g.year < eraCutoff) return false;
    }
    if (activeGenre !== 'all' && !g.genres.includes(activeGenre)) return false;
    return true;
  });

  $: hasActiveFilters =
    activeTag !== 'all' || activePlatform !== 'all' || activeEra !== 'all' || activeGenre !== 'all';
  $: queryHasZeroResults = hasQuery && filtered.length === 0;
  $: effectiveSortDirection = sortMode === 'default' ? 'asc' : sortDirection;
  $: sorted = sortMode === 'default'
    ? filtered
    : [...filtered].sort((left, right) => {
        const titleComparison = applySortDirection(compareText(left.name, right.name), effectiveSortDirection);
        switch (sortMode) {
          case 'title':
            return titleComparison;
          case 'genre':
            return (
              compareOptionalValue(firstSortedValue(left.genres), firstSortedValue(right.genres), compareText, effectiveSortDirection) ||
              titleComparison
            );
          case 'release':
            return (
              compareOptionalValue(
                releaseTimestamp(left.released),
                releaseTimestamp(right.released),
                (a, b) => a - b,
                effectiveSortDirection
              ) ||
              titleComparison
            );
          case 'platform':
            return (
              compareOptionalValue(firstSortedValue(left.platforms), firstSortedValue(right.platforms), compareText, effectiveSortDirection) ||
              titleComparison
            );
          default:
            return 0;
        }
      });

  // Reset to page 1 whenever the controls change after the initial state has been applied.
  $: controlsKey = [normalizedQuery, activeTag, activePlatform, activeEra, activeGenre, pageSizeMode, sortMode, effectiveSortDirection].join('|');
  $: if (previousControlsKey === null) {
    previousControlsKey = controlsKey;
  } else if (controlsKey !== previousControlsKey) {
    currentPage = 1;
    previousControlsKey = controlsKey;
  }

  $: pageSizeOptions = buildPageSizeOptions(isMobile ? mobilePageSize : pageSize);
  $: selectedPageSize = pageSizeOptions.find((option) => option.id === pageSizeMode);
  $: effectivePageSize = selectedPageSize?.value === 'all'
    ? Math.max(sorted.length, 1)
    : (selectedPageSize?.value ?? (isMobile ? mobilePageSize : pageSize));
  $: totalPages = Math.max(1, Math.ceil(sorted.length / effectivePageSize));
  $: safePage = Math.min(currentPage, totalPages);
  $: pageStart = (safePage - 1) * effectivePageSize;
  $: pageEnd = Math.min(pageStart + effectivePageSize, sorted.length);
  $: pagedGames = sorted.slice(pageStart, pageEnd);

  function syncUrlState(state: GamesListState) {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    writeGamesListStateToSearchParams(url.searchParams, state);

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }

  $: if (hasMounted) {
    syncUrlState({
      isOpen,
      query,
      activeTag,
      activePlatform,
      activeEra,
      activeGenre,
      pageSizeMode,
      sortMode,
      sortDirection: effectiveSortDirection,
      currentPage: safePage,
    });
  }

  function getPageWindow(current: number, total: number): Array<number | 'ellipsis-l' | 'ellipsis-r'> {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: Array<number | 'ellipsis-l' | 'ellipsis-r'> = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) pages.push('ellipsis-l');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('ellipsis-r');
    pages.push(total);
    return pages;
  }

  $: pageWindow = getPageWindow(safePage, totalPages);

  function goToPage(p: number) {
    currentPage = Math.max(1, Math.min(p, totalPages));
    if (typeof document !== 'undefined') {
      document.getElementById('games-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetFilters() {
    query = '';
    activeTag = 'all';
    activePlatform = 'all';
    activeEra = 'all';
    activeGenre = 'all';
    pageSizeMode = 'default';
    sortMode = 'default';
    sortDirection = 'asc';
    currentPage = 1;
  }

  const tagFilters: Array<{ id: TagFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'all-time-favorite', label: GAME_TAG_LABEL['all-time-favorite'] },
    { id: 'played-loved', label: GAME_TAG_LABEL['played-loved'] },
    { id: 'want-to-play', label: GAME_TAG_LABEL['want-to-play'] },
  ];

  onMount(() => {
    const mq = window.matchMedia('(max-width: 780px)');
    isMobile = mq.matches;
    const handler = (event: MediaQueryListEvent) => (isMobile = event.matches);
    mq.addEventListener('change', handler);
    hasMounted = true;
    return () => mq.removeEventListener('change', handler);
  });
</script>

<section
  class="games-section"
  class:games-section--open={isOpen}
  data-ngx-section="games-i-love"
  data-ngx-label="Games I Love"
  data-ngx-focusable="true"
>
  <button
    type="button"
    class="games-toggle"
    aria-expanded={isOpen}
    aria-controls="games-panel"
    on:click={() => (isOpen = !isOpen)}
  >
    <span class="games-toggle__chevron" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
    <span class="games-toggle__label">Games I Love</span>
    <span class="games-toggle__count">({games.length})</span>
  </button>

  {#if isOpen}
    <div id="games-panel" class="games-panel">
      <div class="search-row">
        <label class="search-label" for="games-search">
          <span class="search-label__text">Search a game I might know</span>
          <span class="search-label__icon" aria-hidden="true">⌕</span>
          <input
            id="games-search"
            class="search-input"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Try “Hollow Knight”, “Final Fantasy”, “Yu-Gi-Oh”…"
            bind:value={query}
          />
          {#if hasQuery}
            <button type="button" class="search-clear" on:click={() => (query = '')} aria-label="Clear search">×</button>
          {/if}
        </label>
      </div>

      <div class="filters">
        <fieldset class="filter-group">
          <legend>Status</legend>
          <div class="chip-row">
            {#each tagFilters as t (t.id)}
              <button
                type="button"
                class="chip"
                class:chip--active={activeTag === t.id}
                on:click={() => (activeTag = t.id)}
              >
                {t.label}
              </button>
            {/each}
          </div>
        </fieldset>

        <fieldset class="filter-group">
          <legend>Era</legend>
          <div class="chip-row">
            <button type="button" class="chip" class:chip--active={activeEra === 'all'} on:click={() => (activeEra = 'all')}>All</button>
            <button type="button" class="chip" class:chip--active={activeEra === 'old'} on:click={() => (activeEra = 'old')}>Pre-{eraCutoff}</button>
            <button type="button" class="chip" class:chip--active={activeEra === 'new'} on:click={() => (activeEra = 'new')}>{eraCutoff} and later</button>
          </div>
        </fieldset>

        <div class="filter-group filter-group--inline">
          <label class="select-label" for="platform-select">Platform</label>
          <select id="platform-select" bind:value={activePlatform}>
            <option value="all">All platforms</option>
            {#each availablePlatforms as p (p)}
              <option value={p}>{p}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group filter-group--inline">
          <label class="select-label" for="genre-select">Genre</label>
          <select id="genre-select" bind:value={activeGenre}>
            <option value="all">All genres</option>
            {#each availableGenres as g (g)}
              <option value={g}>{g}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group filter-group--inline">
          <label class="select-label" for="page-size-select">Items per page</label>
          <select id="page-size-select" bind:value={pageSizeMode}>
            {#each pageSizeOptions as option (option.id)}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group filter-group--inline">
          <label class="select-label" for="sort-select">Sort by</label>
          <select id="sort-select" bind:value={sortMode}>
            <option value="default">Default order</option>
            <option value="title">Title</option>
            <option value="genre">Genre</option>
            <option value="release">Release</option>
            <option value="platform">Platform</option>
          </select>
        </div>

        <div class="filter-group filter-group--inline">
          <label class="select-label" for="sort-direction-select">Direction</label>
          <select id="sort-direction-select" bind:value={sortDirection} disabled={sortMode === 'default'}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <button type="button" class="reset-btn" on:click={resetFilters}>Reset</button>
      </div>

      <p class="result-count" aria-live="polite">
        {#if filtered.length === 0}
          0 of {games.length} games
        {:else if filtered.length <= effectivePageSize}
          {filtered.length} of {games.length} game{games.length === 1 ? '' : 's'}
        {:else}
          Showing {pageStart + 1}–{pageEnd} of {filtered.length} match{filtered.length === 1 ? '' : 'es'}
          ({games.length} total)
        {/if}
      </p>

      {#if filtered.length === 0}
        {#if queryHasZeroResults && !hasActiveFilters}
          <p class="empty">
            Nothing in my list matches “{query}” — either I haven’t played it or it’s not on my radar yet.
          </p>
        {:else if queryHasZeroResults}
          <p class="empty">
            No matches for “{query}” with the current filters. Try clearing the filters.
          </p>
        {:else}
          <p class="empty">No games match the current filters.</p>
        {/if}
      {:else}
        <ul class="games-grid">
          {#each pagedGames as game (game.slug)}
            <li class="game-card">
              <a class="game-card__link" href={game.rawgUrl} target="_blank" rel="noopener noreferrer">
                <div class="game-card__media">
                  {#if game.backgroundImage}
                    <img src={game.backgroundImage} alt="" loading="lazy" decoding="async" />
                  {/if}
                  <span class="game-card__tag game-card__tag--{game.tag}">
                    {GAME_TAG_LABEL[game.tag]}
                  </span>
                </div>
                <div class="game-card__body">
                  <h3 class="game-card__title">{game.name}</h3>
                  <p class="game-card__meta">
                    {#if game.year}<span>{game.year}</span>{/if}
                    {#if game.platforms.length}<span>{game.platforms.slice(0, 3).join(', ')}{game.platforms.length > 3 ? '…' : ''}</span>{/if}
                  </p>
                  {#if game.genres.length}
                    <ul class="game-card__genres">
                      {#each game.genres.slice(0, 3) as genre (genre)}
                        <li>{genre}</li>
                      {/each}
                    </ul>
                  {/if}
                  {#if game.note}<p class="game-card__note">{game.note}</p>{/if}
                </div>
              </a>
            </li>
          {/each}
        </ul>

        {#if totalPages > 1}
          <nav class="pagination" aria-label="Games pagination">
            <button
              type="button"
              class="page-btn page-btn--nav"
              on:click={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {#each pageWindow as item (item)}
              {#if item === 'ellipsis-l' || item === 'ellipsis-r'}
                <span class="page-ellipsis" aria-hidden="true">…</span>
              {:else}
                <button
                  type="button"
                  class="page-btn"
                  class:page-btn--active={item === safePage}
                  aria-current={item === safePage ? 'page' : undefined}
                  on:click={() => goToPage(item)}
                >
                  {item}
                </button>
              {/if}
            {/each}

            <button
              type="button"
              class="page-btn page-btn--nav"
              on:click={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        {/if}
      {/if}

      <p class="attribution">
        Game metadata and cover art from
        <a href="https://rawg.io" target="_blank" rel="noopener noreferrer">RAWG</a>.
      </p>
    </div>
  {/if}
</section>

<style>
  .games-section {
    width: var(--content-shell-width-desktop);
    margin: var(--space-8) auto;
    border: 1px solid var(--border-muted-strong);
    background: var(--surface-panel);
  }

  .games-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: transparent;
    border: 0;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: clamp(1rem, 1.6vw, 1.25rem);
    cursor: pointer;
    text-align: left;
  }

  .games-toggle:hover,
  .games-toggle:focus-visible {
    background: rgba(255, 255, 255, 0.03);
    outline: none;
  }

  .games-toggle__chevron {
    color: var(--text-accent);
    width: 1.2em;
    display: inline-block;
  }

  .games-toggle__count {
    color: var(--text-accent-2);
    margin-left: auto;
    font-size: 0.9em;
  }

  .games-panel {
    padding: var(--space-5);
    border-top: 1px solid var(--border-muted-strong);
    display: grid;
    gap: var(--space-5);
  }

  .search-row {
    display: flex;
  }

  .search-label {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .search-label__text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .search-label__icon {
    position: absolute;
    left: var(--space-3);
    color: var(--text-accent-2);
    font-size: 1.1rem;
    pointer-events: none;
  }

  .search-input {
    flex: 1;
    width: 100%;
    background: var(--bg-button);
    border: 1px solid var(--border-muted-strong);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: var(--text-base);
    padding: var(--space-3) var(--space-8) var(--space-3) var(--space-8);
    border-radius: var(--radius-sm);
    outline: none;
    transition: border-color var(--duration-fast) var(--ease-default);
  }

  .search-input::placeholder {
    color: var(--text-dimmed);
  }

  .search-input:focus-visible {
    border-color: var(--text-accent);
  }

  .search-clear {
    position: absolute;
    right: var(--space-2);
    background: transparent;
    border: 0;
    color: var(--text-accent-2);
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 var(--space-2);
  }

  .search-clear:hover {
    color: var(--text-primary);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    align-items: flex-end;
  }

  .filter-group {
    border: 0;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-2);
  }

  .filter-group legend,
  .select-label {
    font-size: var(--text-xs);
    color: var(--text-accent-2);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0;
  }

  .filter-group--inline {
    grid-auto-flow: row;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    background: transparent;
    border: 1px solid var(--border-muted-strong);
    color: var(--text-accent);
    padding: var(--space-1) var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background var(--duration-fast) var(--ease-default), color var(--duration-fast) var(--ease-default);
  }

  .chip:hover {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-primary);
  }

  .chip--active {
    background: var(--text-accent);
    color: var(--bg-page);
    border-color: var(--text-accent);
  }

  select {
    background: var(--bg-button);
    color: var(--text-primary);
    border: 1px solid var(--border-muted-strong);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
  }

  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reset-btn {
    background: transparent;
    border: 1px dashed var(--border-muted-strong);
    color: var(--text-accent-2);
    padding: var(--space-1) var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
    border-radius: var(--radius-sm);
    align-self: flex-end;
  }

  .reset-btn:hover {
    color: var(--text-primary);
  }

  .result-count {
    margin: 0;
    color: var(--text-accent-2);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
  }

  .empty {
    margin: 0;
    color: var(--text-accent-2);
    font-style: italic;
  }

  .games-grid {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-4);
  }

  .game-card {
    border: 1px solid var(--border-muted-strong);
    background: rgba(0, 0, 0, 0.35);
    transition: transform var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default);
  }

  .game-card:hover {
    border-color: var(--text-accent);
    transform: translateY(-2px);
  }

  .game-card__link {
    display: grid;
    grid-template-rows: auto 1fr;
    color: inherit;
    text-decoration: none;
    height: 100%;
  }

  .game-card__media {
    position: relative;
    aspect-ratio: 16 / 9;
    background: var(--bg-terminal);
    overflow: hidden;
  }

  .game-card__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .game-card__tag {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    padding: 2px var(--space-2);
    background: rgba(0, 0, 0, 0.75);
    border: 1px solid var(--border-muted-strong);
    color: var(--text-primary);
    border-radius: var(--radius-sm);
  }

  .game-card__tag--all-time-favorite {
    border-color: #f4c542;
    color: #f4c542;
  }

  .game-card__tag--played-loved {
    border-color: var(--text-accent);
    color: var(--text-accent);
  }

  .game-card__tag--want-to-play {
    border-style: dashed;
  }

  .game-card__body {
    padding: var(--space-3);
    display: grid;
    gap: var(--space-2);
  }

  .game-card__title {
    margin: 0;
    font-size: var(--text-base);
    line-height: var(--leading-tight);
  }

  .game-card__meta {
    margin: 0;
    color: var(--text-accent-2);
    font-size: var(--text-xs);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-family: var(--font-mono);
  }

  .game-card__genres {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .game-card__genres li {
    font-size: var(--text-xs);
    color: var(--text-accent);
    border: 1px solid var(--border-muted-strong);
    padding: 0 var(--space-2);
    border-radius: var(--radius-sm);
  }

  .game-card__note {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-accent);
    line-height: var(--leading-base);
  }

  .pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: var(--space-1);
    margin-top: var(--space-2);
  }

  .page-btn {
    background: transparent;
    border: 1px solid var(--border-muted-strong);
    color: var(--text-accent);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 var(--space-2);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition:
      background var(--duration-fast) var(--ease-default),
      color var(--duration-fast) var(--ease-default),
      border-color var(--duration-fast) var(--ease-default);
  }

  .page-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-primary);
  }

  .page-btn--active {
    background: var(--text-accent);
    color: var(--bg-page);
    border-color: var(--text-accent);
  }

  .page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .page-btn--nav {
    font-size: 1.1rem;
    line-height: 1;
  }

  .page-ellipsis {
    color: var(--text-dimmed);
    padding: 0 var(--space-1);
    font-family: var(--font-mono);
  }

  .attribution {
    margin: 0;
    padding-top: var(--space-3);
    border-top: 1px solid var(--border-muted-strong);
    font-size: var(--text-xs);
    color: var(--text-dimmed);
    font-family: var(--font-mono);
    text-align: right;
  }

  .attribution a {
    color: var(--text-accent-2);
    text-decoration: none;
    border-bottom: 1px dotted currentColor;
  }

  .attribution a:hover {
    color: var(--text-accent);
  }

  @media (max-width: 780px) {
    .games-section {
      width: var(--content-shell-width-mobile);
    }
    .games-panel {
      padding: var(--space-4);
    }
    .games-grid {
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
  }
</style>

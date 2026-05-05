import type { GameTag } from '../../data/games';
import type { ResolvedGame } from './resolve';

export type TagFilter = 'all' | GameTag;
export type EraFilter = 'all' | 'old' | 'new';
export type PageSizeMode = 'less' | 'default' | 'more' | 'all';
export type SortMode = 'default' | 'title' | 'genre' | 'release' | 'platform';
export type SortDirection = 'asc' | 'desc';

export type GamesListState = {
  isOpen: boolean;
  query: string;
  activeTag: TagFilter;
  activePlatform: string;
  activeEra: EraFilter;
  activeGenre: string;
  pageSizeMode: PageSizeMode;
  sortMode: SortMode;
  sortDirection: SortDirection;
  currentPage: number;
};

export const DEFAULT_GAMES_LIST_STATE: GamesListState = {
  isOpen: false,
  query: '',
  activeTag: 'all',
  activePlatform: 'all',
  activeEra: 'all',
  activeGenre: 'all',
  pageSizeMode: 'default',
  sortMode: 'default',
  sortDirection: 'asc',
  currentPage: 1,
};

export const GAMES_LIST_QUERY_PARAMS = {
  isOpen: 'games-open',
  query: 'games-q',
  tag: 'games-tag',
  platform: 'games-platform',
  era: 'games-era',
  genre: 'games-genre',
  pageSize: 'games-size',
  sort: 'games-sort',
  direction: 'games-dir',
  page: 'games-page',
} as const;

const TRUE_VALUES = ['1', 'true', 'open'];
const FALSE_VALUES = ['0', 'false', 'closed'];
const VALID_TAG_FILTERS: TagFilter[] = ['all', 'all-time-favorite', 'played-loved', 'want-to-play'];
const VALID_ERA_FILTERS: EraFilter[] = ['all', 'old', 'new'];
const VALID_PAGE_SIZE_MODES: PageSizeMode[] = ['less', 'default', 'more', 'all'];
const VALID_SORT_MODES: SortMode[] = ['default', 'title', 'genre', 'release', 'platform'];
const VALID_SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc'];

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function isOneOf<T extends string>(value: string | null, allowed: readonly T[]): value is T {
  return value !== null && allowed.includes(value as T);
}

function parseIsOpen(value: string | null): boolean {
  if (value === null) return DEFAULT_GAMES_LIST_STATE.isOpen;
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.includes(normalized)) return true;
  if (FALSE_VALUES.includes(normalized)) return false;
  return DEFAULT_GAMES_LIST_STATE.isOpen;
}

function parsePositiveInt(value: string | null): number {
  if (value === null) return DEFAULT_GAMES_LIST_STATE.currentPage;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_GAMES_LIST_STATE.currentPage;
}

function clearGamesListSearchParams(searchParams: URLSearchParams): void {
  for (const key of Object.values(GAMES_LIST_QUERY_PARAMS)) {
    searchParams.delete(key);
  }
}

export function parseGamesListState(searchParams: URLSearchParams, games: ResolvedGame[]): GamesListState {
  const availablePlatforms = new Set(uniqueSorted(games.flatMap((game) => game.platforms)));
  const availableGenres = new Set(uniqueSorted(games.flatMap((game) => game.genres)));

  const activeTag = searchParams.get(GAMES_LIST_QUERY_PARAMS.tag);
  const activeEra = searchParams.get(GAMES_LIST_QUERY_PARAMS.era);
  const pageSizeMode = searchParams.get(GAMES_LIST_QUERY_PARAMS.pageSize);
  const sortMode = searchParams.get(GAMES_LIST_QUERY_PARAMS.sort);
  const sortDirection = searchParams.get(GAMES_LIST_QUERY_PARAMS.direction);
  const activePlatform = searchParams.get(GAMES_LIST_QUERY_PARAMS.platform);
  const activeGenre = searchParams.get(GAMES_LIST_QUERY_PARAMS.genre);

  return {
    isOpen: parseIsOpen(searchParams.get(GAMES_LIST_QUERY_PARAMS.isOpen)),
    query: searchParams.get(GAMES_LIST_QUERY_PARAMS.query)?.trim() ?? DEFAULT_GAMES_LIST_STATE.query,
    activeTag: isOneOf(activeTag, VALID_TAG_FILTERS) ? activeTag : DEFAULT_GAMES_LIST_STATE.activeTag,
    activePlatform:
      activePlatform !== null && availablePlatforms.has(activePlatform)
        ? activePlatform
        : DEFAULT_GAMES_LIST_STATE.activePlatform,
    activeEra: isOneOf(activeEra, VALID_ERA_FILTERS) ? activeEra : DEFAULT_GAMES_LIST_STATE.activeEra,
    activeGenre:
      activeGenre !== null && availableGenres.has(activeGenre)
        ? activeGenre
        : DEFAULT_GAMES_LIST_STATE.activeGenre,
    pageSizeMode: isOneOf(pageSizeMode, VALID_PAGE_SIZE_MODES) ? pageSizeMode : DEFAULT_GAMES_LIST_STATE.pageSizeMode,
    sortMode: isOneOf(sortMode, VALID_SORT_MODES) ? sortMode : DEFAULT_GAMES_LIST_STATE.sortMode,
    sortDirection:
      isOneOf(sortMode, VALID_SORT_MODES) && sortMode !== 'default' && isOneOf(sortDirection, VALID_SORT_DIRECTIONS)
        ? sortDirection
        : DEFAULT_GAMES_LIST_STATE.sortDirection,
    currentPage: parsePositiveInt(searchParams.get(GAMES_LIST_QUERY_PARAMS.page)),
  };
}

export function writeGamesListStateToSearchParams(searchParams: URLSearchParams, state: GamesListState): void {
  clearGamesListSearchParams(searchParams);

  const normalizedQuery = state.query.trim();
  const normalizedPage = Number.isInteger(state.currentPage) && state.currentPage > 0 ? state.currentPage : 1;
  const normalizedDirection = state.sortMode === 'default' ? 'asc' : state.sortDirection;

  const hasNonDefaultState =
    state.isOpen !== DEFAULT_GAMES_LIST_STATE.isOpen ||
    normalizedQuery !== DEFAULT_GAMES_LIST_STATE.query ||
    state.activeTag !== DEFAULT_GAMES_LIST_STATE.activeTag ||
    state.activePlatform !== DEFAULT_GAMES_LIST_STATE.activePlatform ||
    state.activeEra !== DEFAULT_GAMES_LIST_STATE.activeEra ||
    state.activeGenre !== DEFAULT_GAMES_LIST_STATE.activeGenre ||
    state.pageSizeMode !== DEFAULT_GAMES_LIST_STATE.pageSizeMode ||
    state.sortMode !== DEFAULT_GAMES_LIST_STATE.sortMode ||
    normalizedDirection !== DEFAULT_GAMES_LIST_STATE.sortDirection ||
    normalizedPage !== DEFAULT_GAMES_LIST_STATE.currentPage;

  if (!hasNonDefaultState) return;

  searchParams.set(GAMES_LIST_QUERY_PARAMS.isOpen, state.isOpen ? '1' : '0');

  if (normalizedQuery) searchParams.set(GAMES_LIST_QUERY_PARAMS.query, normalizedQuery);
  if (state.activeTag !== 'all') searchParams.set(GAMES_LIST_QUERY_PARAMS.tag, state.activeTag);
  if (state.activePlatform !== 'all') searchParams.set(GAMES_LIST_QUERY_PARAMS.platform, state.activePlatform);
  if (state.activeEra !== 'all') searchParams.set(GAMES_LIST_QUERY_PARAMS.era, state.activeEra);
  if (state.activeGenre !== 'all') searchParams.set(GAMES_LIST_QUERY_PARAMS.genre, state.activeGenre);
  if (state.pageSizeMode !== 'default') searchParams.set(GAMES_LIST_QUERY_PARAMS.pageSize, state.pageSizeMode);
  if (state.sortMode !== 'default') {
    searchParams.set(GAMES_LIST_QUERY_PARAMS.sort, state.sortMode);
    if (normalizedDirection !== 'asc') searchParams.set(GAMES_LIST_QUERY_PARAMS.direction, normalizedDirection);
  }
  if (normalizedPage > 1) searchParams.set(GAMES_LIST_QUERY_PARAMS.page, String(normalizedPage));
}

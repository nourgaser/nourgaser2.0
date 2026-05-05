import { getCachedGame } from './cache';
import { gamesILove, type GameEntry, type GameTag } from '../../data/games';

export type ResolvedGame = {
  slug: string;
  name: string;
  tag: GameTag;
  note?: string;
  year: number | null;
  released: string | null;
  backgroundImage: string | null;
  rating: number;
  metacritic: number | null;
  description: string;
  platforms: string[];
  parentPlatforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  rawgUrl: string;
};

function shape(entry: GameEntry, raw: Awaited<ReturnType<typeof getCachedGame>>): ResolvedGame {
  const year = raw.released ? Number(raw.released.slice(0, 4)) : null;
  return {
    slug: entry.slug,
    name: raw.name ?? entry.slug,
    tag: entry.tag,
    note: entry.note,
    year: year !== null && Number.isFinite(year) ? year : null,
    released: raw.released ?? null,
    backgroundImage: raw.background_image ?? null,
    rating: raw.rating ?? 0,
    metacritic: raw.metacritic ?? null,
    description: raw.description_raw ?? '',
    platforms: (raw.platforms ?? []).map((p) => p.platform.name),
    parentPlatforms: (raw.parent_platforms ?? []).map((p) => p.platform.name),
    genres: (raw.genres ?? []).map((g) => g.name),
    developers: (raw.developers ?? []).map((d) => d.name),
    publishers: (raw.publishers ?? []).map((p) => p.name),
    rawgUrl: `https://rawg.io/games/${entry.slug}`,
  };
}

export async function resolveGamesILove(): Promise<ResolvedGame[]> {
  const results = await Promise.all(
    gamesILove.map(async (entry) => {
      try {
        const raw = await getCachedGame(entry.slug);
        return shape(entry, raw);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[rawg] Skipping "${entry.slug}": ${message}`);
        return null;
      }
    })
  );
  return results.filter((g): g is ResolvedGame => g !== null);
}

const RAWG_BASE = 'https://api.rawg.io/api';

function readRawgApiKeyFromEnv(): string | undefined {
  const viteKey = import.meta.env?.RAWG_API_KEY;
  if (typeof viteKey === 'string' && viteKey.trim()) {
    return viteKey.trim();
  }

  const processKey = process.env.RAWG_API_KEY;
  if (typeof processKey === 'string' && processKey.trim()) {
    return processKey.trim();
  }

  return undefined;
}

export type RawgPlatform = {
  id: number;
  name: string;
  slug: string;
};

export type RawgGenre = {
  id: number;
  name: string;
  slug: string;
};

export type RawgStore = {
  id: number;
  name: string;
  slug: string;
};

export type RawgGameDetail = {
  id: number;
  slug: string;
  name: string;
  name_original?: string;
  description_raw?: string;
  released?: string | null;
  tba?: boolean;
  background_image?: string | null;
  background_image_additional?: string | null;
  rating?: number;
  rating_top?: number;
  ratings_count?: number;
  metacritic?: number | null;
  playtime?: number;
  platforms?: Array<{ platform: RawgPlatform }> | null;
  parent_platforms?: Array<{ platform: RawgPlatform }> | null;
  genres?: RawgGenre[];
  stores?: Array<{ store: RawgStore }> | null;
  developers?: Array<{ id: number; name: string; slug: string }>;
  publishers?: Array<{ id: number; name: string; slug: string }>;
  website?: string;
};

function getApiKey(): string {
  const key = readRawgApiKeyFromEnv();
  if (!key) {
    throw new Error(
      'RAWG_API_KEY is not set. Add it to your .env file (locally) or to repository secrets (CI/CD).'
    );
  }
  return key;
}

export async function fetchGameBySlug(slug: string): Promise<RawgGameDetail> {
  const url = new URL(`${RAWG_BASE}/games/${encodeURIComponent(slug)}`);
  url.searchParams.set('key', getApiKey());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG fetch failed for "${slug}": ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as RawgGameDetail;
}

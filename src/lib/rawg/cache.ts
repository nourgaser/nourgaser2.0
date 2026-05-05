import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fetchGameBySlug, type RawgGameDetail } from './client';

const CACHE_DIR = resolve(process.cwd(), 'node_modules/.cache/rawg');
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type CacheEnvelope = {
  fetchedAt: number;
  data: RawgGameDetail;
};

async function readCache(slug: string): Promise<RawgGameDetail | null> {
  const path = resolve(CACHE_DIR, `${slug}.json`);
  try {
    const raw = await readFile(path, 'utf8');
    const envelope = JSON.parse(raw) as CacheEnvelope;
    if (Date.now() - envelope.fetchedAt > CACHE_TTL_MS) return null;
    return envelope.data;
  } catch {
    return null;
  }
}

async function writeCache(slug: string, data: RawgGameDetail): Promise<void> {
  const path = resolve(CACHE_DIR, `${slug}.json`);
  await mkdir(dirname(path), { recursive: true });
  const envelope: CacheEnvelope = { fetchedAt: Date.now(), data };
  await writeFile(path, JSON.stringify(envelope), 'utf8');
}

export async function getCachedGame(slug: string): Promise<RawgGameDetail> {
  const cached = await readCache(slug);
  if (cached) return cached;

  const fresh = await fetchGameBySlug(slug);
  await writeCache(slug, fresh);
  return fresh;
}

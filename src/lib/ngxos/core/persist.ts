// Namespaced localStorage wrapper. Every read/write is guarded so a hostile
// or unavailable storage (private mode, quota, disabled) never throws — it
// silently falls back to an in-memory map for the rest of the session.
const memoryFallback = new Map<string, string>();

export function getItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback.has(key) ? memoryFallback.get(key)! : null;
  }
}

export function setItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryFallback.set(key, value);
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    memoryFallback.delete(key);
  }
}

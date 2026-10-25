type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();
const pending = new Map<string, Promise<unknown>>();

/** Share one remote read across the pages Next renders at the same time. */
export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.value as T);

  const inflight = pending.get(key);
  if (inflight) return inflight as Promise<T>;

  const promise = load()
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs });
      pending.delete(key);
      return value;
    })
    .catch((error: unknown) => {
      pending.delete(key);
      throw error;
    });

  pending.set(key, promise);
  return promise;
}

export function clearTtlCache() {
  store.clear();
}

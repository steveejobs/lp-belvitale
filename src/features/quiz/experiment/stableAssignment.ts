export interface StableAssignment {
  readonly variant: "a" | "b";
  readonly source: "random" | "stored" | "forced";
}
interface Lock extends StableAssignment { readonly expiresAt: number }
const memory = new Map<string, Lock>();
const memoryOnly = new Set<string>();
export function browserStorage(): Storage | undefined {
  try { return typeof window === "undefined" ? undefined : window.localStorage; } catch { return undefined; }
}
function valid(value: unknown): value is Lock {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<Lock>;
  return (item.variant === "a" || item.variant === "b") && ["random", "stored", "forced"].includes(item.source ?? "") && typeof item.expiresAt === "number" && item.expiresAt > Date.now();
}
export function resolveStableAssignment(key: string, search: string, storage = browserStorage(), random = Math.random): StableAssignment {
  const lockKey = `${key}.session`;
  let storageReadable = false;
  try {
    const lock: unknown = JSON.parse(storage?.getItem(lockKey) ?? "null");
    storageReadable = storage !== undefined;
    if (valid(lock)) { memoryOnly.delete(key); memory.set(key, lock); return lock; }
  } catch { /* fallback */ }
  const cached = memory.get(key);
  if ((!storageReadable || memoryOnly.has(key)) && valid(cached)) return cached;
  const params = new URLSearchParams(search);
  const forced = params.get("ab")?.toLowerCase();
  let stored: string | null = null;
  try { stored = storage?.getItem(key) ?? null; } catch { /* first assignment */ }
  let assignment: Lock = {
    variant: forced === "a" || forced === "b" ? forced : stored === "a" || stored === "b" ? stored : random() < .5 ? "a" : "b",
    source: forced === "a" || forced === "b" ? "forced" : stored === "a" || stored === "b" ? "stored" : "random",
    expiresAt: Date.now() + 86400000,
  };
  try {
    if (storage === undefined) throw new Error("Storage unavailable");
    storage.setItem(lockKey, JSON.stringify(assignment));
    if (assignment.source !== "forced") storage.setItem(key, assignment.variant);
    memoryOnly.delete(key);
  } catch {
    memoryOnly.add(key);
    if (typeof window !== "undefined") {
      params.set("ab", assignment.variant);
      window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}${window.location.hash}`);
      assignment = { ...assignment, source: "forced" };
    }
  }
  memory.set(key, assignment);
  return assignment;
}
export function clearStableAssignment(key: string, storage = browserStorage()): void {
  memory.delete(key);
  memoryOnly.delete(key);
  try { storage?.removeItem(key); storage?.removeItem(`${key}.session`); } catch { /* memory cleared */ }
}

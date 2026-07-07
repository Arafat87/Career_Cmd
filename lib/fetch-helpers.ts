/**
 * Safe fetch that always returns an array.
 * APIs may return {error: "..."} on failure — this normalizes to [].
 */
export async function fetchArray(url: string): Promise<any[]> {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Safe fetch that returns parsed JSON or null on failure.
 */
export async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, init);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getJson(url, { headers = {}, timeoutMs = 15000 } = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
  
    try {
      const resp = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal
      });
  
      const text = await resp.text();
  
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} from ${url}: ${text.slice(0, 300)}`);
      }
  
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 300)}`);
      }
    } finally {
      clearTimeout(id);
    }
  }
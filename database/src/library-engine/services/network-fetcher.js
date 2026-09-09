export class NetworkFetcher {
  #cache;
  #baseUrl;

  constructor(cacheManager, baseUrl = './') {
    this.#cache = cacheManager;
    this.#baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  async fetchManifest(resourcePath) {
    const cleanPath = resourcePath.startsWith('/') ? resourcePath.substring(1) : resourcePath;
    
    const cachedData = await this.#cache.get(cleanPath);
    if (cachedData) return cachedData;

    const targetUrl = new URL(cleanPath, new URL(this.#baseUrl, window.location.href)).href;

    try {
      const response = await fetch(targetUrl, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ao acessar ${targetUrl}`);
      }

      const data = await response.json();
      await this.#cache.set(cleanPath, data);
      return data;
    } catch (err) {
      console.error(`[NetworkFetcher] Erro ao buscar: ${targetUrl}`, err);
      throw err;
    }
  }
}

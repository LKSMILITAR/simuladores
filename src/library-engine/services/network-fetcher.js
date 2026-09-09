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
    if (cachedData) {
      return cachedData;
    }

    const targetUrl = new URL(cleanPath, new URL(this.#baseUrl, window.location.href)).href;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await fetch(targetUrl, { cache: 'no-cache' });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ao acessar ${targetUrl}`);
        }

        const data = await response.json();
        await this.#cache.set(cleanPath, data);
        return data;
      } catch (err) {
        if (attempts >= maxAttempts) {
          console.error(`[Network] Falha ao buscar recurso '${cleanPath}' em '${targetUrl}':`, err);
          throw err;
        }
        await new Promise((res) => setTimeout(res, 300 * attempts));
      }
    }
  }
}

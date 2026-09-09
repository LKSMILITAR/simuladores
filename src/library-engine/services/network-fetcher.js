export class NetworkFetcher {
  #cache;
  #baseUrl;

  constructor(cacheManager, baseUrl = './') {
    this.#cache = cacheManager;
    this.#baseUrl = baseUrl;
  }

  async fetchManifest(resourcePath) {
    const cachedData = await this.#cache.get(resourcePath);
    if (cachedData) {
      return cachedData;
    }

    const targetUrl = new URL(resourcePath, new URL(this.#baseUrl, window.location.href)).href;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await fetch(targetUrl, { cache: 'force-cache' });
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} ao acessar ${targetUrl}`);
        }

        const data = await response.json();
        await this.#cache.set(resourcePath, data);
        return data;
      } catch (err) {
        if (attempts >= maxAttempts) {
          console.error(`[Network] Falha permanente ao buscar recurso '${resourcePath}':`, err);
          throw err;
        }
        await new Promise((res) => setTimeout(res, 300 * attempts));
      }
    }
  }
}

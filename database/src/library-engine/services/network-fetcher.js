import { CacheManager } from './cache-manager.js';

export class NetworkFetcher {
    #catalogUrl;
    #cacheManager;
    #timeoutMs;

    constructor(cacheManager = new CacheManager(), timeoutMs = 8000) {
        this.#catalogUrl = './assets/catalog/root.json';
        this.#cacheManager = cacheManager;
        this.#timeoutMs = timeoutMs;
    }

    async fetchCatalog() {
        const cacheKey = 'root_catalog_data';

        // 1. Tenta recuperar do cache em memória L1 para resposta imediata
        const cachedData = await this.#cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // 2. Configura sinalizador de interrupção por tempo limite de rede
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.#timeoutMs);

        try {
            const cacheBusterUrl = `${this.#catalogUrl}?t=${Date.now()}`;
            const response = await fetch(cacheBusterUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Falha ao carregar o catálogo: HTTP ${response.status}`);
            }

            const data = await response.json();

            // 3. Persiste o resultado no cache L1 antes de retornar
            await this.#cacheManager.set(cacheKey, data);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                console.error(`[NetworkFetcher] Tempo limite de rede excedido (${this.#timeoutMs}ms)`);
                throw new Error('Tempo limite de conexão excedido ao buscar o catálogo.');
            }

            console.error('[NetworkFetcher] Erro na requisição:', error);
            throw error;
        }
    }

    clearCache() {
        this.#cacheManager.clear();
    }
}

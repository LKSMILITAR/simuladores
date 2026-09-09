export class NetworkFetcher {
    constructor() {
        // Caminho relativo a partir do index.html da raiz de /database/
        this.catalogUrl = './assets/catalog/root.json';
    }

    async fetchCatalog() {
        try {
            const response = await fetch(`${this.catalogUrl}?t=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`Falha ao carregar o catálogo: HTTP ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[NetworkFetcher] Erro na requisição:', error);
            throw error;
        }
    }
}

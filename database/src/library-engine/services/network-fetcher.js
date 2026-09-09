import { CacheManager } from './cache-manager.js';

export class NetworkFetcher {
    #cacheManager;
    #timeoutMs;
    #candidateUrls;
    #fallbackCatalog;

    constructor(cacheManager = new CacheManager(), timeoutMs = 8000) {
        this.#cacheManager = cacheManager;
        this.#timeoutMs = timeoutMs;
        
        this.#candidateUrls = [
            './assets/catalog/root.json',
            '../assets/catalog/root.json',
            '/simuladores/database/assets/catalog/root.json'
        ];

        // Catálogo de segurança embutido: impede a exibição de telas de erro no GitHub Pages
        this.#fallbackCatalog = {
            updatedAt: new Date().toISOString(),
            totalCategories: 15,
            categories: [
                {
                    id: "Termodinamica",
                    name: "Termodinâmica",
                    itemCount: 4,
                    items: [
                        {
                            title: "Download.txt",
                            path: "documents/Termodinâmica/Download.txt",
                            encodedPath: "documents/Termodin%C3%A2mica/Download.txt"
                        },
                        {
                            title: "Kittel, C. Thermal Physics - 2nd Ed C. Kittle.pdf",
                            path: "documents/Termodinâmica/Kittel, C. Thermal Physics - 2nd Ed C. Kittle.pdf",
                            encodedPath: "documents/Termodin%C3%A2mica/Kittel%2C%20C.%20Thermal%20Physics%20-%202nd%20Ed%20C.%20Kittle.pdf"
                        },
                        {
                            title: "Pekar M. The Essentials of Thermodynamics 2024.pdf",
                            path: "documents/Termodinâmica/Pekar M. The Essentials of Thermodynamics 2024.pdf",
                            encodedPath: "documents/Termodin%C3%A2mica/Pekar%20M.%20The%20Essentials%20of%20Thermodynamics%202024.pdf"
                        },
                        {
                            title: "Thermal Physics Kinetic Theory, Thermodynamics and Statistical Mechanics - Garg-Bansal-Ghosh.pdf",
                            path: "documents/Termodinâmica/Thermal Physics Kinetic Theory, Thermodynamics and Statistical Mechanics - Garg-Bansal-Ghosh.pdf",
                            encodedPath: "documents/Termodin%C3%A2mica/Thermal%20Physics%20Kinetic%20Theory%2C%20Thermodynamics%20and%20Statistical%20Mechanics%20-%20Garg-Bansal-Ghosh.pdf"
                        }
                    ]
                },
                { id: "Eletrodinamica", name: "Eletrodinâmica", itemCount: 0, items: [] },
                { id: "Aerodinamica", name: "Aerodinâmica", itemCount: 0, items: [] },
                { id: "Propulsao", name: "Propulsão", itemCount: 0, items: [] },
                { id: "Estruturas", name: "Estruturas", itemCount: 0, items: [] },
                { id: "Materiais", name: "Materiais", itemCount: 0, items: [] },
                { id: "Eletronica", name: "Eletrônica", itemCount: 0, items: [] },
                { id: "Sistemas_de_Armas", name: "Sistemas de Armas", itemCount: 0, items: [] },
                { id: "Radar_e_Guerra_Eletronica", name: "Radar e Guerra Eletrônica", itemCount: 0, items: [] },
                { id: "Inteligencia_e_Vigilancia", name: "Inteligência e Vigilância", itemCount: 0, items: [] },
                { id: "Logistica_e_Suprimento", name: "Logística e Suprimento", itemCount: 0, items: [] },
                { id: "Historia_Militar", name: "História Militar", itemCount: 0, items: [] },
                { id: "Manuais_Tecnicos", name: "Manuais Técnicos", itemCount: 0, items: [] },
                { id: "Documentos_Oficiais", name: "Documentos Oficiais", itemCount: 0, items: [] },
                { id: "Projetos_e_Simuladores", name: "Projetos e Simuladores", itemCount: 0, items: [] }
            ]
        };
    }

    async fetchCatalog() {
        const cacheKey = 'root_catalog_data';

        const cachedData = await this.#cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        for (const baseUrl of this.#candidateUrls) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.#timeoutMs);

            try {
                const cacheBusterUrl = `${baseUrl}?t=${Date.now()}`;
                const response = await fetch(cacheBusterUrl, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    await this.#cacheManager.set(cacheKey, data);
                    return data;
                }
            } catch (err) {
                clearTimeout(timeoutId);
            }
        }

        // Se a busca de rede falhar no GitHub Pages, utiliza o catálogo de contingência
        await this.#cacheManager.set(cacheKey, this.#fallbackCatalog);
        return this.#fallbackCatalog;
    }

    clearCache() {
        this.#cacheManager.clear();
    }
}

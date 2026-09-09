import { NetworkFetcher } from './services/network-fetcher.js';

document.addEventListener('DOMContentLoaded', async () => {
    const fetcher = new NetworkFetcher();
    const mainViewport = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a, nav a, [data-category]');

    let catalogData = null;

    try {
        catalogData = await fetcher.fetchCatalog();
        initSidebarEvents();
    } catch (err) {
        console.error('[LibraryEngine] Falha ao inicializar a base de dados:', err);
    }

    function initSidebarEvents() {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedCategoryName = link.textContent.trim();
                renderCategory(selectedCategoryName);
            });
        });
    }

    function renderCategory(categoryName) {
        if (!catalogData || !catalogData.categories) return;

        // Localiza a categoria correspondente no objeto retornado
        const category = catalogData.categories.find(c => 
            c.name.toLowerCase() === categoryName.toLowerCase() || 
            c.id.toLowerCase() === categoryName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        );

        if (!category) {
            mainViewport.innerHTML = `
                <div style="padding: 24px; color: #888; font-family: monospace;">
                    [SISTEMA] CATEGORIA "${categoryName}" NÃO ENCONTRADA // STANDBY
                </div>`;
            return;
        }

        const filesHtml = category.items.length > 0 ? category.items.map(file => {
            // Rota apontando diretamente para o seu visualizador na pasta superior
            const viewerUrl = `../visualizador.html?file=${encodeURIComponent('../' + file.path)}`;
            const downloadUrl = `../${file.encodedPath}`;

            return `
                <div style="background: #141414; border: 1px solid #2a2a2a; border-left: 3px solid #e50914; padding: 14px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${file.title}</span>
                        <span style="color: #666666; font-size: 11px; font-family: monospace;">URI: ${file.encodedPath}</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <a href="${viewerUrl}" target="_blank" style="background: #e50914; color: #ffffff; padding: 6px 14px; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 3px;">VISUALIZAR</a>
                        <a href="${downloadUrl}" download style="background: #222222; color: #aaaaaa; border: 1px solid #333333; padding: 6px 14px; text-decoration: none; font-size: 12px; border-radius: 3px;">BAIXAR</a>
                    </div>
                </div>
            `;
        }).join('') : `<div style="padding: 20px; color: #555555; font-style: italic;">NENHUM DOCUMENTO CADASTRADO NESTA CATEGORIA</div>`;

        mainViewport.innerHTML = `
            <div style="padding: 24px;">
                <div style="border-bottom: 1px solid #333333; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <h2 style="color: #ffffff; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">${category.name}</h2>
                    <span style="color: #e50914; font-size: 12px; font-family: monospace; font-weight: bold;">[${category.itemCount} DOCUMENTOS]</span>
                </div>
                <div>${filesHtml}</div>
            </div>
        `;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Mapeamento absoluto das URLs em relação ao diretório /database/
    const CATALOG_URL = './assets/catalog/root.json';
    const VIEWER_BASE_URL = '../visualizador.html';

    const mainViewport = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    const sidebar = document.querySelector('.sidebar') || document.querySelector('aside') || document.querySelector('.sidebar-nav');
    const toggleBtn = document.querySelector('.menu-toggle') || document.querySelector('.hamburger') || document.querySelector('header button') || document.querySelector('[data-toggle="sidebar"]');
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a, nav a, [data-category]');

    let catalogData = null;

    // Configura o evento de toque no botão hambúrguer do menu no celular
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            sidebar.classList.toggle('open');
        });

        // Oculta a gaveta se o usuário tocar fora do menu
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') || sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('active', 'open');
                }
            }
        });
    }

    // Requisição resiliente do catálogo com invalidação de cache por Timestamp
    async function loadCatalog() {
        try {
            const cacheBuster = `?t=${Date.now()}`;
            const response = await fetch(`${CATALOG_URL}${cacheBuster}`);
            
            if (!response.ok) {
                throw new Error(`Falha HTTP na requisição: ${response.status}`);
            }

            catalogData = await response.json();
            bindSidebarEvents();
            
            // CARREGAMENTO INICIAL: Renderiza a primeira categoria disponível no JSON automaticamente
            if (catalogData.categories && catalogData.categories.length > 0) {
                renderCategory(catalogData.categories[0].name);
            }
        } catch (error) {
            console.error('[DATABASE ENGINE] Erro ao carregar catálogo:', error);
            mainViewport.innerHTML = `
                <div style="padding: 24px; color: #e50914; font-family: monospace; text-align: center;">
                    [ERRO DE CONEXÃO] FALHA AO CONSULTAR ASSETS/CATALOG/ROOT.JSON // STANDBY
                </div>`;
        }
    }

    function bindSidebarEvents() {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryName = link.textContent.trim();

                // Recolhe o menu mobile ao selecionar um item
                if (sidebar) {
                    sidebar.classList.remove('active', 'open');
                }

                renderCategory(categoryName);
            });
        });
    }

    function renderCategory(categoryName) {
        if (!catalogData || !catalogData.categories) return;

        // Normalização flexível para comparação de categorias sem acentos
        const category = catalogData.categories.find(c => 
            c.name.toLowerCase() === categoryName.toLowerCase() ||
            c.id.toLowerCase() === categoryName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase()
        );

        if (!category) {
            mainViewport.innerHTML = `
                <div style="padding: 24px; color: #888888; font-family: monospace;">
                    [SISTEMA] CATEGORIA "${categoryName}" SEM REGISTRO NO CATALOGO // STANDBY
                </div>`;
            return;
        }

        const filesHtml = (category.items && category.items.length > 0) ? category.items.map(file => {
            // Tratamento de dados para suportar listas de strings ou objetos estruturados
            const isObject = typeof file === 'object' && file !== null;
            const fileName = isObject ? file.title : file;
            const rawRelPath = isObject ? file.path : `documents/${category.name}/${file}`;
            const encodedRelPath = isObject ? file.encodedPath : `documents/${encodeURIComponent(category.name)}/${encodeURIComponent(file)}`;

            // Rota ajustada para o visualizador (/simuladores/visualizador.html) acessar a subpasta database
            const viewerTarget = `${VIEWER_BASE_URL}?file=${encodeURIComponent('database/' + rawRelPath)}`;
            const downloadTarget = `./${encodedRelPath}`;

            return `
                <div style="background: #141414; border: 1px solid #2a2a2a; border-left: 3px solid #e50914; padding: 14px; margin-bottom: 12px; border-radius: 4px; display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="color: #ffffff; font-size: 14px; font-weight: 500; word-break: break-all;">${fileName}</span>
                        <span style="color: #666666; font-size: 11px; font-family: monospace;">URI: ${encodedRelPath}</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <a href="${viewerTarget}" target="_blank" style="background: #e50914; color: #ffffff; padding: 8px 14px; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 3px; text-align: center; flex: 1;">VISUALIZAR</a>
                        <a href="${downloadTarget}" download style="background: #222222; color: #aaaaaa; border: 1px solid #333333; padding: 8px 14px; text-decoration: none; font-size: 12px; border-radius: 3px; text-align: center;">BAIXAR</a>
                    </div>
                </div>
            `;
        }).join('') : `<div style="padding: 20px; color: #555555; font-style: italic;">NENHUM DOCUMENTO CADASTRADO NESTA CATEGORIA</div>`;

        mainViewport.innerHTML = `
            <div style="padding: 20px;">
                <div style="border-bottom: 1px solid #333333; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <h2 style="color: #ffffff; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">${category.name}</h2>
                    <span style="color: #e50914; font-size: 12px; font-family: monospace; font-weight: bold;">[${category.itemCount || category.items.length} DOCS]</span>
                </div>
                <div>${filesHtml}</div>
            </div>
        `;
    }

    loadCatalog();
});

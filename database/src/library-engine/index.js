import { NavigationFSM } from './state/fsm.js';
import { CacheManager } from './services/cache-manager.js';
import { NetworkFetcher } from './services/network-fetcher.js';
import './components/sidebar-nav.js';

document.addEventListener('DOMContentLoaded', async () => {
    const fsm = new NavigationFSM();
    const cacheManager = new CacheManager();
    const fetcher = new NetworkFetcher(cacheManager);

    // Elementos de Layout e Viewport
    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const standbyView = document.getElementById('standby-view');
    const activeDocView = document.getElementById('active-doc-view');
    const categoryGridView = document.getElementById('category-grid-view');
    
    // Elementos de Conteúdo
    const categoryTitleDisplay = document.getElementById('category-title-display');
    const categoryCountBadge = document.getElementById('category-count-badge');
    const categoryCardsContainer = document.getElementById('category-cards-container');
    const docFilenameDisplay = document.getElementById('doc-filename-display');
    const docFrameBody = document.getElementById('doc-frame-body');
    const btnCloseDocument = document.getElementById('btn-close-document');

    let catalogData = null;

    // 1. Controle de Abertura/Fechamento da Gaveta Lateral no Mobile
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && (sidebar.classList.contains('active') || sidebar.classList.contains('open'))) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('active', 'open');
                    sidebar.classList.add('collapsed');
                }
            }
        });
    }

    // 2. Assina as Mudanças de Estado da Interface (FSM Observer)
    fsm.subscribe(({ fromState, toState, event, payload }) => {
        // Oculta todos os estados do HUD por padrão
        standbyView.style.display = 'none';
        activeDocView.style.display = 'none';
        categoryGridView.style.display = 'none';

        switch (toState) {
            case 'IDLE':
                standbyView.style.display = 'flex';
                sidebar.setActive('ROOT');
                break;

            case 'LOADING_CATEGORY':
                standbyView.style.display = 'flex';
                categoryTitleDisplay.textContent = 'CARREGANDO DADOS...';
                loadCategoryContent(payload);
                break;

            case 'CATEGORY_ACTIVE':
                categoryGridView.style.display = 'flex';
                break;

            case 'VIEWING_DOC':
                activeDocView.style.display = 'flex';
                renderDocumentViewer(payload);
                break;
        }
    });

    // 3. Carregamento Inicial do Catálogo Central
    try {
        catalogData = await fetcher.fetchCatalog();
    } catch (error) {
        console.error('[Engine] Erro crítico ao carregar catálogo:', error);
        standbyView.innerHTML = `
            <div style="color: var(--accent-red); font-family: var(--font-mono); font-size: 0.85rem; text-align: center; padding: 20px;">
                [ERRO CRÍTICO] FALHA AO CONECTAR COM ASSETS/CATALOG/ROOT.JSON // VERIFIQUE O DEPLOY
            </div>
        `;
    }

    // 4. Ouvinte de Seleção Emitido pelo Web Component SidebarNav
    document.addEventListener('sidebar:select', (e) => {
        const path = e.detail.path;

        if (path === 'ROOT') {
            fsm.transition('RESET');
        } else {
            fsm.transition('SELECT_CATEGORY', path);
        }

        // Recolhe o menu automaticamente no mobile após o clique
        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('active', 'open');
            sidebar.classList.add('collapsed');
        }
    });

    // 5. Tratamento do Botão de Fechar Documento
    if (btnCloseDocument) {
        btnCloseDocument.addEventListener('click', () => {
            docFrameBody.innerHTML = '';
            fsm.transition('CLOSE_DOC');
        });
    }

    // 6. Funções de Renderização de Conteúdo
    function loadCategoryContent(categoryPath) {
        if (!catalogData || !catalogData.categories) {
            fsm.transition('LOAD_ERROR');
            return;
        }

        const category = catalogData.categories.find(c => 
            c.name.toLowerCase() === categoryPath.toLowerCase() ||
            c.id.toLowerCase() === categoryPath.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase()
        );

        if (!category) {
            categoryTitleDisplay.textContent = categoryPath.toUpperCase();
            categoryCountBadge.textContent = '0 DOCUMENTOS';
            categoryCardsContainer.innerHTML = '<div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; padding: 20px;">NENHUM REGISTRO LOCALIZADO NESTA CATEGORIA.</div>';
            fsm.transition('LOAD_SUCCESS');
            return;
        }

        categoryTitleDisplay.textContent = category.name.toUpperCase();
        categoryCountBadge.textContent = `${category.itemCount || category.items.length} DOCUMENTOS`;

        if (!category.items || category.items.length === 0) {
            categoryCardsContainer.innerHTML = '<div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; padding: 20px;">DIRETÓRIO VAZIO // STANDBY</div>';
        } else {
            categoryCardsContainer.innerHTML = category.items.map(file => {
                const isObject = typeof file === 'object' && file !== null;
                const fileName = isObject ? file.title : file;
                const rawPath = isObject ? file.path : `documents/${category.name}/${file}`;

                return `
                    <div class="doc-card" data-filepath="${rawPath}" data-filename="${fileName}">
                        <div class="doc-card-title">${fileName}</div>
                        <div class="doc-card-meta">
                            <span>FORMATO: PDF / DOC</span>
                            <span style="color: var(--accent-red);">ACESSAR &rarr;</span>
                        </div>
                    </div>
                `;
            }).join('');

            // Adiciona evento de clique em cada cartão de documento da grade
            categoryCardsContainer.querySelectorAll('.doc-card').forEach(card => {
                card.addEventListener('click', () => {
                    const filePath = card.getAttribute('data-filepath');
                    const fileName = card.getAttribute('data-filename');
                    fsm.transition('OPEN_DOC', { filePath, fileName });
                });
            });
        }

        fsm.transition('LOAD_SUCCESS', categoryPath);
    }

    function renderDocumentViewer({ filePath, fileName }) {
        docFilenameDisplay.textContent = fileName;
        
        // Rota relativa para o visualizador localizado na raiz de /simuladores/
        const viewerTarget = `../visualizador.html?file=${encodeURIComponent('database/' + filePath)}`;

        docFrameBody.innerHTML = `
            <iframe src="${viewerTarget}" title="${fileName}" style="width: 100%; height: 100%; border: none; background: #000;"></iframe>
        `;
    }
});

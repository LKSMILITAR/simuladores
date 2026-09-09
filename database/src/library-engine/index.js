import { NavigationFSM } from './state/fsm.js';
import { CacheManager } from './services/cache-manager.js';
import { NetworkFetcher } from './services/network-fetcher.js';
import './components/sidebar-nav.js';

document.addEventListener('DOMContentLoaded', async () => {
    const fsm = new NavigationFSM();
    const cacheManager = new CacheManager();
    const fetcher = new NetworkFetcher(cacheManager);

    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const standbyView = document.getElementById('standby-view');
    const activeDocView = document.getElementById('active-doc-view');
    const categoryGridView = document.getElementById('category-grid-view');
    
    const categoryTitleDisplay = document.getElementById('category-title-display');
    const categoryCountBadge = document.getElementById('category-count-badge');
    const categoryCardsContainer = document.getElementById('category-cards-container');
    const docFilenameDisplay = document.getElementById('doc-filename-display');
    const docFrameBody = document.getElementById('doc-frame-body');
    const btnCloseDocument = document.getElementById('btn-close-document');

    let catalogData = null;

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

    fsm.subscribe(({ fromState, toState, event, payload }) => {
        standbyView.style.display = 'none';
        activeDocView.style.display = 'none';
        categoryGridView.style.display = 'none';

        switch (toState) {
            case 'IDLE':
                standbyView.style.display = 'flex';
                if (sidebar && typeof sidebar.setActive === 'function') {
                    sidebar.setActive('ROOT');
                }
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

    try {
        catalogData = await fetcher.fetchCatalog();
        if (catalogData && catalogData.categories && catalogData.categories.length > 0) {
            fsm.transition('SELECT_CATEGORY', 'Termodinâmica');
        }
    } catch (error) {
        console.error('[Engine] Erro na inicialização:', error);
    }

    document.addEventListener('sidebar:select', (e) => {
        const path = e.detail.path;

        if (path === 'ROOT') {
            fsm.transition('RESET');
        } else {
            fsm.transition('SELECT_CATEGORY', path);
        }

        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('active', 'open');
            sidebar.classList.add('collapsed');
        }
    });

    if (btnCloseDocument) {
        btnCloseDocument.addEventListener('click', () => {
            docFrameBody.innerHTML = '';
            fsm.transition('CLOSE_DOC');
        });
    }

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
            fsm.transition('LOAD_SUCCESS', categoryPath);
            return;
        }

        categoryTitleDisplay.textContent = category.name.toUpperCase();
        categoryCountBadge.textContent = `${category.itemCount || category.items.length} DOCUMENTOS`;

        if (!category.items || category.items.length === 0) {
            categoryCardsContainer.innerHTML = '<div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; padding: 20px;">CATEGORIA SEM DOCUMENTOS CADASTRADOS // STANDBY</div>';
        } else {
            categoryCardsContainer.innerHTML = category.items.map(file => {
                const isObject = typeof file === 'object' && file !== null;
                const fileName = isObject ? file.title : file;
                const rawPath = isObject ? file.path : `documents/${category.name}/${file}`;

                return `
                    <div class="doc-card" data-filepath="${rawPath}" data-filename="${fileName}">
                        <div class="doc-card-title">${fileName}</div>
                        <div class="doc-card-meta">
                            <span>FORMATO: PDF / TXT</span>
                            <span style="color: var(--accent-red);">ABRIR &rarr;</span>
                        </div>
                    </div>
                `;
            }).join('');

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
        const viewerTarget = `../visualizador.html?file=${encodeURIComponent('database/' + filePath)}`;
        docFrameBody.innerHTML = `
            <iframe src="${viewerTarget}" title="${fileName}" style="width: 100%; height: 100%; border: none; background: #000;"></iframe>
        `;
    }
});

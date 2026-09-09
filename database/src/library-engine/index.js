import { NavigationFSM } from './state/fsm.js';
import { CacheManager } from './services/cache-manager.js';
import { NetworkFetcher } from './services/network-fetcher.js';
import './components/sidebar-nav.js';

export class LibraryNavigationEngine {
  #fsm;
  #cache;
  #fetcher;
  #sidebarElement;
  #baseUrl;
  #rootData = null;

  constructor(config = {}) {
    this.#baseUrl = config.baseUrl || './';
    this.#fsm = new NavigationFSM();
    this.#cache = new CacheManager(100);
    this.#fetcher = new NetworkFetcher(this.#cache, this.#baseUrl);
  }

  async init() {
    this.#sidebarElement = document.getElementById('main-sidebar');
    this.#bindEvents();

    try {
      this.#rootData = await this.#fetcher.fetchManifest('assets/catalog/root.json');
    } catch (err) {
      console.warn('[LibraryEngine] Manifesto raiz ainda não compilado na nuvem.', err);
    }
  }

  #bindEvents() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.#sidebarElement?.toggleCollapse();
      });
    }

    const btnCloseDoc = document.getElementById('btn-close-document');
    if (btnCloseDoc) {
      btnCloseDoc.addEventListener('click', () => {
        this.#fsm.transition('CLOSE_DOC');
        this.#renderState('IDLE');
      });
    }

    this.#sidebarElement?.addEventListener('sidebar:select', async (e) => {
      const { path } = e.detail;

      if (path === 'ROOT') {
        this.#fsm.transition('CLOSE_DOC');
        this.#renderState('IDLE');
        return;
      }

      this.#fsm.transition('SELECT_CATEGORY', { path });
      this.#renderState('LOADING');

      try {
        const categoryData = await this.#loadCategoryData(path);
        this.#fsm.transition('LOAD_SUCCESS');
        this.#renderCategoryGrid(path, categoryData);
      } catch (err) {
        this.#fsm.transition('LOAD_ERROR');
        this.#renderState('IDLE');
      }
    });
  }

  async #loadCategoryData(categoryName) {
    if (!this.#rootData || !this.#rootData.categories) return { files: [] };
    
    const catObj = this.#rootData.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (catObj && catObj.chunk) {
      return await this.#fetcher.fetchManifest(catObj.chunk);
    }
    return { files: [] };
  }

  #renderState(state) {
    const standbyView = document.getElementById('standby-view');
    const activeDocView = document.getElementById('active-doc-view');
    const categoryGridView = document.getElementById('category-grid-view');

    standbyView.style.display = state === 'IDLE' ? 'flex' : 'none';
    activeDocView.style.display = state === 'DOC' ? 'flex' : 'none';
    categoryGridView.style.display = state === 'GRID' ? 'flex' : 'none';
  }

  #renderCategoryGrid(categoryTitle, data) {
    this.#renderState('GRID');

    const titleEl = document.getElementById('category-title-display');
    const badgeEl = document.getElementById('category-count-badge');
    const container = document.getElementById('category-cards-container');

    titleEl.innerText = categoryTitle.toUpperCase();
    const files = data.files || [];
    badgeEl.innerText = `${files.length} DOCUMENTOS`;

    if (files.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; grid-column: 1/-1;">Nenhum documento encontrado para esta disciplina no repositório local.</div>`;
      return;
    }

    container.innerHTML = files.map(f => `
      <div class="doc-card" data-path="${f.path}" data-name="${f.name}">
        <div class="doc-card-title">${f.name}</div>
        <div class="doc-card-meta">
          <span>EXT: ${f.extension.toUpperCase()}</span>
          <span>${(f.size / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.doc-card').forEach(card => {
      card.addEventListener('click', () => {
        const docPath = card.dataset.path;
        const docName = card.dataset.name;
        this.openDocument(docPath, docName);
      });
    });
  }

  openDocument(docPath, docName) {
    this.#fsm.transition('OPEN_DOC');
    this.#renderState('DOC');

    const docFrameBody = document.getElementById('doc-frame-body');
    const docFilenameDisplay = document.getElementById('doc-filename-display');
    const docTypeTag = document.getElementById('doc-type-tag');

    const encodedPath = `./documents/${encodeURIComponent(docPath)}`;
    const ext = docPath.split('.').pop().toLowerCase();

    docFilenameDisplay.innerText = docName;
    docTypeTag.innerText = ext.toUpperCase();

    if (ext === 'pdf') {
      docFrameBody.innerHTML = `<iframe src="${encodedPath}" title="${docName}"></iframe>`;
    } else {
      fetch(encodedPath)
        .then(res => res.text())
        .then(text => {
          docFrameBody.innerHTML = `<div style="padding: 24px; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6; color: var(--text-primary); overflow-y: auto; height: 100%; white-space: pre-wrap;">${text}</div>`;
        })
        .catch(() => {
          docFrameBody.innerHTML = `<div style="padding: 24px; color: var(--accent-red); font-family: var(--font-mono);">Erro ao carregar o conteúdo do documento local.</div>`;
        });
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const engine = new LibraryNavigationEngine({ baseUrl: './' });
  await engine.init();
});

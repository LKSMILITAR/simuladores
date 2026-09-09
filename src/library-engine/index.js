import { NavigationFSM } from './state/fsm.js';
import { CacheManager } from './services/cache-manager.js';
import { NetworkFetcher } from './services/network-fetcher.js';
import './components/virtual-tree.js';
import './components/library-drawer.js';

export class LibraryNavigationEngine {
  #fsm;
  #cache;
  #fetcher;
  #drawerElement;
  #baseUrl;
  #rootItems = [];

  constructor(config = {}) {
    this.#baseUrl = config.baseUrl || './assets/catalog';
    this.#fsm = new NavigationFSM();
    this.#cache = new CacheManager(config.l1Capacity || 100);
    this.#fetcher = new NetworkFetcher(this.#cache, this.#baseUrl);
  }

  async init() {
    this.#ensureStylesLoaded();

    this.#drawerElement = document.querySelector('library-drawer');
    if (!this.#drawerElement) {
      this.#drawerElement = document.createElement('library-drawer');
      document.body.appendChild(this.#drawerElement);
    }

    this.#drawerElement.init(this.#fsm);
    this.#bindEvents();

    try {
      const rootManifest = await this.#fetcher.fetchManifest('root.json');
      if (rootManifest) {
        this.#rootItems = [
          ...(rootManifest.categories || []).map(c => ({ ...c, type: 'folder' })),
          ...(rootManifest.files || []).map(f => ({ ...f, type: 'file' }))
        ];
        this.#drawerElement.resetToRoot(this.#rootItems);
      }
    } catch (err) {
      console.warn('[LibraryEngine] Aviso: Erro ao carregar o manifesto raiz.', err);
    }
  }

  #ensureStylesLoaded() {
    const existingLink = document.querySelector('link[href*="library-engine.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = new URL('./styles/library-engine.css', import.meta.url).href;
      document.head.appendChild(link);
    }
  }

  #bindEvents() {
    this.#drawerElement.addEventListener('library:folder-selected', async (e) => {
      const { path, chunk, name } = e.detail;
      if (!chunk) return;

      this.#fsm.transition('FETCH_START');
      try {
        const chunkData = await this.#fetcher.fetchManifest(chunk);
        const folderItems = [
          ...(chunkData.folders || []).map(f => ({ ...f, type: 'folder' })),
          ...(chunkData.files || []).map(f => ({ ...f, type: 'file' }))
        ];
        this.#drawerElement.setTreeData(folderItems, { path, chunk, name });
        this.#fsm.transition('FETCH_SUCCESS');
      } catch (err) {
        this.#fsm.transition('FETCH_ERROR', err);
      }
    });

    this.#drawerElement.addEventListener('library:navigate-root', () => {
      this.#drawerElement.resetToRoot(this.#rootItems);
    });

    this.#drawerElement.addEventListener('library:navigate-back', () => {
      this.#drawerElement.resetToRoot(this.#rootItems);
    });
  }

  open() {
    this.#fsm.transition('OPEN');
  }

  close() {
    this.#fsm.transition('CLOSE');
  }

  toggle() {
    if (this.#fsm.state === 'CLOSED') {
      this.#fsm.transition('OPEN');
    } else {
      this.#fsm.transition('CLOSE');
    }
  }
}

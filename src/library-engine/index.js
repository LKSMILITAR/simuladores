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

  constructor(config = {}) {
    this.#baseUrl = config.baseUrl || './assets/catalog';
    this.#fsm = new NavigationFSM();
    this.#cache = new CacheManager(config.l1Capacity || 100);
    this.#fetcher = new NetworkFetcher(this.#cache, this.#baseUrl);
  }

  async init() {
    // Garante a montagem do elemento no DOM
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
        const initialItems = [
          ...(rootManifest.categories || []).map(c => ({ ...c, type: 'folder' })),
          ...(rootManifest.files || []).map(f => ({ ...f, type: 'file' }))
        ];
        this.#drawerElement.setTreeData(initialItems);
      }
    } catch (err) {
      console.warn('[LibraryEngine] Aviso: Não foi possível carregar o manifesto raiz inicial.', err);
    }
  }

  #bindEvents() {
    this.#drawerElement.addEventListener('library:folder-selected', async (e) => {
      const { chunk } = e.detail;
      if (!chunk) return;

      this.#fsm.transition('FETCH_START');
      try {
        const chunkData = await this.#fetcher.fetchManifest(chunk);
        const folderItems = [
          ...(chunkData.folders || []).map(f => ({ ...f, type: 'folder' })),
          ...(chunkData.files || []).map(f => ({ ...f, type: 'file' }))
        ];
        this.#drawerElement.setTreeData(folderItems);
        this.#fsm.transition('FETCH_SUCCESS');
      } catch (err) {
        this.#fsm.transition('FETCH_ERROR', err);
      }
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
      this.#fsm.transition('TOGGLE');
    } else if (this.#fsm.state === 'OPEN') {
      this.#fsm.transition('TOGGLE');
    } else {
      // Caso esteja no meio do processo de abertura
      this.#fsm.transition('OPEN');
    }
  }
}

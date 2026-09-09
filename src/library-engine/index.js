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
  #searchWorker;
  #baseUrl;

  constructor(config = {}) {
    this.#baseUrl = config.baseUrl || './';
    this.#fsm = new NavigationFSM();
    this.#cache = new CacheManager(config.l1Capacity || 100);
    this.#fetcher = new NetworkFetcher(this.#cache, this.#baseUrl);

    this.#initWorker();
  }

  async init() {
    this.#drawerElement = document.querySelector('library-drawer');
    if (!this.#drawerElement) {
      this.#drawerElement = document.createElement('library-drawer');
      document.body.appendChild(this.#drawerElement);
    }

    this.#drawerElement.init(this.#fsm);

    this.#bindCustomEvents();

    try {
      const rootManifest = await this.#fetcher.fetchManifest('assets/catalog/root.json');
      
      const initialItems = [
        ...rootManifest.categories.map(c => ({ ...c, type: 'folder' })),
        ...rootManifest.files.map(f => ({ ...f, type: 'file' }))
      ];

      this.#drawerElement.setTreeData(initialItems);

      this.#searchWorker.postMessage({ type: 'INDEX_DATA', payload: rootManifest });
    } catch (err) {
      console.error('[LibraryEngine] Erro na inicialização:', err);
    }
  }

  #initWorker() {
    const workerPath = new URL('./workers/index-search.worker.js', import.meta.url);
    this.#searchWorker = new Worker(workerPath, { type: 'module' });

    this.#searchWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'SEARCH_RESULTS') {
        this.#drawerElement.setTreeData(payload.results);
      }
    };
  }

  #bindCustomEvents() {
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

    this.#drawerElement.addEventListener('library:search-input', (e) => {
      const term = e.detail.term;
      if (!term) {
        this.refresh();
        return;
      }
      this.#searchWorker.postMessage({ type: 'SEARCH', payload: { term } });
    });
  }

  open() {
    this.#fsm.transition('OPEN');
  }

  close() {
    this.#fsm.transition('CLOSE');
  }

  toggle() {
    this.#fsm.transition('TOGGLE');
  }

  async refresh() {
    const rootData = await this.#cache.get('assets/catalog/root.json');
    if (rootData) {
      const items = [
        ...rootData.categories.map(c => ({ ...c, type: 'folder' })),
        ...rootData.files.map(f => ({ ...f, type: 'file' }))
      ];
      this.#drawerElement.setTreeData(items);
    }
  }
}

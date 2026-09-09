export class CacheManager {
  #l1Cache;
  #l1Capacity;
  #dbPromise;

  constructor(l1Capacity = 100) {
    this.#l1Cache = new Map();
    this.#l1Capacity = l1Capacity;
    this.#dbPromise = this.#initIndexedDB();
  }

  #initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LibraryCatalogCacheDB', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('manifests')) {
          db.createObjectStore('manifests', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(key) {
    if (this.#l1Cache.has(key)) {
      const value = this.#l1Cache.get(key);
      this.#l1Cache.delete(key);
      this.#l1Cache.set(key, value);
      return value;
    }

    try {
      const db = await this.#dbPromise;
      const transaction = db.transaction('manifests', 'readonly');
      const store = transaction.objectStore('manifests');
      
      const record = await new Promise((resolve, reject) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (record) {
        this.setL1(key, record.value);
        return record.value;
      }
    } catch (err) {
      console.error('[Cache L2] Erro na leitura do IndexedDB:', err);
    }

    return null;
  }

  setL1(key, value) {
    if (this.#l1Cache.has(key)) {
      this.#l1Cache.delete(key);
    } else if (this.#l1Cache.size >= this.#l1Capacity) {
      const oldestKey = this.#l1Cache.keys().next().value;
      this.#l1Cache.delete(oldestKey);
    }
    this.#l1Cache.set(key, value);
  }

  async set(key, value) {
    this.setL1(key, value);

    try {
      const db = await this.#dbPromise;
      const transaction = db.transaction('manifests', 'readwrite');
      const store = transaction.objectStore('manifests');
      store.put({ key, value, timestamp: Date.now() });
    } catch (err) {
      console.error('[Cache L2] Erro na escrita do IndexedDB:', err);
    }
  }
}

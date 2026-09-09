export class CacheManager {
  #l1Cache = new Map();
  #capacity;
  #ttl;

  constructor(capacity = 50, ttlMs = 1000 * 60 * 30) { // TTL padrão de 30 minutos
    this.#capacity = capacity;
    this.#ttl = ttlMs;
  }

  async get(key) {
    if (!this.#l1Cache.has(key)) {
      return null;
    }

    const record = this.#l1Cache.get(key);
    const now = Date.now();

    // Validação de expiração temporal do registro
    if (this.#ttl > 0 && (now - record.timestamp > this.#ttl)) {
      this.#l1Cache.delete(key);
      return null;
    }

    // Promove o elemento para o final do Map (Mais Recentemente Utilizado)
    this.#l1Cache.delete(key);
    this.#l1Cache.set(key, record);

    return record.data;
  }

  async set(key, data) {
    if (this.#l1Cache.has(key)) {
      this.#l1Cache.delete(key);
    } else if (this.#l1Cache.size >= this.#capacity) {
      // Elimina o elemento mais antigo no topo do Map (LRU Eviction)
      const oldestKey = this.#l1Cache.keys().next().value;
      this.#l1Cache.delete(oldestKey);
    }

    this.#l1Cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.#l1Cache.clear();
  }
}

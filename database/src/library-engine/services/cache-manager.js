export class CacheManager {
  #l1Cache = new Map();
  #capacity;

  constructor(capacity = 50) {
    this.#capacity = capacity;
  }

  async get(key) {
    if (this.#l1Cache.has(key)) {
      const value = this.#l1Cache.get(key);
      this.#l1Cache.delete(key);
      this.#l1Cache.set(key, value);
      return value;
    }
    return null;
  }

  async set(key, data) {
    if (this.#l1Cache.has(key)) {
      this.#l1Cache.delete(key);
    } else if (this.#l1Cache.size >= this.#capacity) {
      const oldestKey = this.#l1Cache.keys().next().value;
      this.#l1Cache.delete(oldestKey);
    }
    this.#l1Cache.set(key, data);
  }

  clear() {
    this.#l1Cache.clear();
  }
}

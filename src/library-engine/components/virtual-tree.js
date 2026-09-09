export class VirtualTree extends HTMLElement {
  #items;
  #itemHeight;
  #viewportContainer;
  #phantomElement;
  #contentElement;

  constructor() {
    super();
    this.#items = [];
    this.#itemHeight = 36;
  }

  connectedCallback() {
    this.style.display = 'block';
    this.style.height = '100%';
    this.style.overflowY = 'auto';

    this.innerHTML = `
      <div class="virtual-phantom" style="position: relative; width: 100%; pointer-events: none;"></div>
      <div class="virtual-content" style="position: absolute; top: 0; left: 0; right: 0;"></div>
    `;

    this.#viewportContainer = this;
    this.#phantomElement = this.querySelector('.virtual-phantom');
    this.#contentElement = this.querySelector('.virtual-content');

    this.addEventListener('scroll', () => this.#onScroll(), { passive: true });
  }

  setData(items) {
    this.#items = items || [];
    this.#phantomElement.style.height = `${this.#items.length * this.#itemHeight}px`;
    this.#onScroll();
  }

  #onScroll() {
    const scrollTop = this.#viewportContainer.scrollTop;
    const viewportHeight = this.#viewportContainer.clientHeight || 400;

    const startIndex = Math.max(0, Math.floor(scrollTop / this.#itemHeight) - 2);
    const endIndex = Math.min(this.#items.length, Math.ceil((scrollTop + viewportHeight) / this.#itemHeight) + 2);

    this.#renderWindow(startIndex, endIndex);
  }

  #renderWindow(startIndex, endIndex) {
    const visibleItems = this.#items.slice(startIndex, endIndex);
    const offsetY = startIndex * this.#itemHeight;

    this.#contentElement.style.transform = `translate3d(0, ${offsetY}px, 0)`;

    let html = '';
    for (let i = 0; i < visibleItems.length; i++) {
      const item = visibleItems[i];
      const isFolder = item.type === 'folder' || item.chunk;
      const icon = isFolder ? '📁' : '📄';

      html += `
        <div class="lib-tree-item" 
             data-path="${item.path}" 
             data-type="${isFolder ? 'folder' : 'file'}"
             data-chunk="${item.chunk || ''}"
             style="height: ${this.#itemHeight}px; display: flex; align-items: center; padding: 0 12px; cursor: pointer;">
          <span style="margin-right: 8px;">${icon}</span>
          <span class="lib-tree-item-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
        </div>
      `;
    }

    this.#contentElement.innerHTML = html;
  }
}

customElements.define('virtual-tree', VirtualTree);

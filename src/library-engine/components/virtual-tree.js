const SVG_FOLDER = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
const SVG_FILE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
const SVG_BACK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
const SVG_CHEVRON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

export class VirtualTree extends HTMLElement {
  #items = [];
  #itemHeight = 36;
  #viewportContainer;
  #phantomElement;
  #contentElement;
  #breadcrumbsElement;
  #folderStack = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.height = '100%';
    this.style.overflow = 'hidden';

    this.innerHTML = `
      <div class="lib-breadcrumbs" style="padding: 10px 16px; background: var(--lib-bg-secondary, #121824); border-bottom: 1px solid var(--lib-border-color, #222f43); display: flex; align-items: center; gap: 8px; font-size: 11px; font-family: var(--lib-font); color: var(--lib-text-muted, #94a3b8); overflow-x: auto; white-space: nowrap;">
        <span class="lib-crumb-item lib-crumb-root" data-index="-1" style="color: var(--lib-accent-red, #dc2626); cursor: pointer; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">ACERVO CENTRAL</span>
      </div>
      <div class="virtual-viewport" style="flex: 1; overflow-y: auto; position: relative;">
        <div class="virtual-phantom" style="position: relative; width: 100%; pointer-events: none;"></div>
        <div class="virtual-content" style="position: absolute; top: 0; left: 0; right: 0;"></div>
      </div>
    `;

    this.#breadcrumbsElement = this.querySelector('.lib-breadcrumbs');
    this.#viewportContainer = this.querySelector('.virtual-viewport');
    this.#phantomElement = this.querySelector('.virtual-phantom');
    this.#contentElement = this.querySelector('.virtual-content');

    this.#viewportContainer.addEventListener('scroll', () => this.#onScroll(), { passive: true });
    this.#bindBreadcrumbsEvents();
  }

  setData(items, currentFolderInfo = null) {
    this.#items = items || [];
    
    if (currentFolderInfo) {
      const lastFolder = this.#folderStack[this.#folderStack.length - 1];
      if (!lastFolder || lastFolder.path !== currentFolderInfo.path) {
        this.#folderStack.push(currentFolderInfo);
      }
    }

    this.#renderBreadcrumbs();
    this.#phantomElement.style.height = `${this.#items.length * this.#itemHeight}px`;
    this.#viewportContainer.scrollTop = 0;
    this.#onScroll();
  }

  resetToRoot(rootItems) {
    this.#folderStack = [];
    this.setData(rootItems);
  }

  #renderBreadcrumbs() {
    let html = `<span class="lib-crumb-item lib-crumb-root" data-index="-1" style="color: var(--lib-accent-red, #dc2626); cursor: pointer; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">ACERVO CENTRAL</span>`;
    
    this.#folderStack.forEach((folder, idx) => {
      html += ` <span style="color: var(--lib-border-color, #222f43); display: inline-flex; align-items: center;">${SVG_CHEVRON}</span> `;
      const isLast = idx === this.#folderStack.length - 1;
      const style = isLast 
        ? `color: var(--lib-text-primary, #f1f5f9); font-weight: 600; cursor: default;` 
        : `color: var(--lib-text-muted, #94a3b8); cursor: pointer;`;
      
      html += `<span class="lib-crumb-item" data-index="${idx}" style="${style}">${folder.name}</span>`;
    });

    this.#breadcrumbsElement.innerHTML = html;
  }

  #bindBreadcrumbsEvents() {
    this.#breadcrumbsElement.addEventListener('click', (e) => {
      const crumb = e.target.closest('.lib-crumb-item');
      if (!crumb) return;

      const idx = parseInt(crumb.dataset.index, 10);
      
      if (idx === -1) {
        this.#folderStack = [];
        this.dispatchEvent(new CustomEvent('library:navigate-root', { bubbles: true, composed: true }));
      } else if (idx < this.#folderStack.length - 1) {
        const targetFolder = this.#folderStack[idx];
        this.#folderStack = this.#folderStack.slice(0, idx + 1);
        this.dispatchEvent(new CustomEvent('library:folder-selected', {
          bubbles: true,
          composed: true,
          detail: { path: targetFolder.path, chunk: targetFolder.chunk, name: targetFolder.name }
        }));
      }
    });
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
    
    if (startIndex === 0 && this.#folderStack.length > 0) {
      html += `
        <div class="lib-tree-item lib-back-item" 
             data-action="back"
             style="height: ${this.#itemHeight}px; display: flex; align-items: center; padding: 0 16px; cursor: pointer; color: var(--lib-accent-red, #dc2626); background: rgba(220, 38, 38, 0.04); border-bottom: 1px solid var(--lib-border-color, #222f43); font-size: 11px; font-weight: 700; letter-spacing: 0.05em;">
          <span style="margin-right: 8px; display: inline-flex; align-items: center;">${SVG_BACK}</span>
          <span>RETORNAR AO NÍVEL ANTERIOR</span>
        </div>
      `;
    }

    for (let i = 0; i < visibleItems.length; i++) {
      const item = visibleItems[i];
      const isFolder = item.type === 'folder' || item.chunk;
      const icon = isFolder ? SVG_FOLDER : SVG_FILE;

      html += `
        <div class="lib-tree-item" 
             data-path="${item.path}" 
             data-name="${item.name}"
             data-type="${isFolder ? 'folder' : 'file'}"
             data-chunk="${item.chunk || ''}"
             style="height: ${this.#itemHeight}px; display: flex; align-items: center; padding: 0 16px; cursor: pointer; border-bottom: 1px solid rgba(255, 255, 255, 0.02); transition: background 0.15s ease;">
          <span style="margin-right: 10px; color: ${isFolder ? 'var(--lib-accent-red, #dc2626)' : 'var(--lib-text-muted, #94a3b8)'}; display: inline-flex; align-items: center;">${icon}</span>
          <span class="lib-tree-item-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-size: 12px; color: var(--lib-text-primary, #f1f5f9);">${item.name}</span>
          ${item.itemCount ? `<span class="lib-badge" style="font-size: 10px; color: var(--lib-text-muted, #94a3b8); background: var(--lib-bg-secondary, #121824); border: 1px solid var(--lib-border-color, #222f43); padding: 1px 6px; border-radius: 3px;">${item.itemCount}</span>` : ''}
        </div>
      `;
    }

    this.#contentElement.innerHTML = html;
  }
}

customElements.define('virtual-tree', VirtualTree);

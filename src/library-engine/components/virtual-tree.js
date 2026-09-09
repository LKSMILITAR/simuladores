export class VirtualTree extends HTMLElement {
  #items = [];
  #itemHeight = 38;
  #viewportContainer;
  #phantomElement;
  #contentElement;
  #breadcrumbsElement;
  #folderStack = []; // Pilha para armazenar o histórico de navegação

  constructor() {
    super();
  }

  connectedCallback() {
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.height = '100%';
    this.style.overflow = 'hidden';

    this.innerHTML = `
      <div class="lib-breadcrumbs" style="padding: 10px 16px; background: rgba(0,240,255,0.03); border-bottom: 1px solid var(--lib-border-color, #1e2d4a); display: flex; align-items: center; gap: 6px; font-size: 11px; font-family: var(--lib-font); color: var(--lib-text-muted, #64748b); overflow-x: auto; white-space: nowrap;">
        <span class="lib-crumb-item lib-crumb-root" style="color: var(--lib-accent, #00f0ff); cursor: pointer; font-weight: 700;">RAIZ</span>
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
    
    // Atualiza a pilha de navegação se for uma nova pasta
    if (currentFolderInfo && (this.#folderStack.length === 0 || this.#folderStack[this.#folderStack.length - 1].path !== currentFolderInfo.path)) {
      this.#folderStack.push(currentFolderInfo);
    }

    this.#renderBreadcrumbs();
    this.#phantomElement.style.height = `${this.#items.length * this.#itemHeight}px`;
    this.#viewportContainer.scrollTop = 0; // Reseta a rolagem para o topo
    this.#onScroll();
  }

  resetToRoot(rootItems) {
    this.#folderStack = [];
    this.setData(rootItems);
  }

  #renderBreadcrumbs() {
    let html = `<span class="lib-crumb-item lib-crumb-root" data-index="-1" style="color: var(--lib-accent, #00f0ff); cursor: pointer; font-weight: 700;">RAIZ</span>`;
    
    this.#folderStack.forEach((folder, idx) => {
      html += ` <span style="color: var(--lib-border-color, #1e2d4a);">/</span> `;
      const isLast = idx === this.#folderStack.length - 1;
      const style = isLast 
        ? `color: var(--lib-text-primary, #e2e8f0); font-weight: 600; cursor: default;` 
        : `color: var(--lib-accent, #00f0ff); cursor: pointer;`;
      
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
        // Voltar para a Raiz
        this.#folderStack = [];
        this.dispatchEvent(new CustomEvent('library:navigate-root', { bubbles: true, composed: true }));
      } else if (idx < this.#folderStack.length - 1) {
        // Voltar para um nível intermediário
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
    
    // Adiciona botão visual de "Voltar" no topo da lista se estiver dentro de uma subpasta
    if (startIndex === 0 && this.#folderStack.length > 0) {
      html += `
        <div class="lib-tree-item lib-back-item" 
             data-action="back"
             style="height: ${this.#itemHeight}px; display: flex; align-items: center; padding: 0 16px; cursor: pointer; color: var(--lib-accent, #00f0ff); background: rgba(0,240,255,0.02); border-bottom: 1px solid var(--lib-border-color, #1e2d4a);">
          <span style="margin-right: 10px; font-weight: 700;">⮌</span>
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em;">VOLTAR PARA NÍVEL ANTERIOR</span>
        </div>
      `;
    }

    for (let i = 0; i < visibleItems.length; i++) {
      const item = visibleItems[i];
      const isFolder = item.type === 'folder' || item.chunk;
      const icon = isFolder ? '📁' : '📄';

      html += `
        <div class="lib-tree-item" 
             data-path="${item.path}" 
             data-name="${item.name}"
             data-type="${isFolder ? 'folder' : 'file'}"
             data-chunk="${item.chunk || ''}"
             style="height: ${this.#itemHeight}px; display: flex; align-items: center; padding: 0 16px; cursor: pointer; border-bottom: 1px solid rgba(255, 255, 255, 0.03);">
          <span style="margin-right: 10px; color: var(--lib-accent, #00f0ff);">${icon}</span>
          <span class="lib-tree-item-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-size: 12px;">${item.name}</span>
          ${item.itemCount ? `<span class="lib-badge" style="font-size: 10px; color: var(--lib-accent, #00f0ff); background: rgba(0, 240, 255, 0.08); padding: 2px 6px; border-radius: 3px;">${item.itemCount}</span>` : ''}
        </div>
      `;
    }

    this.#contentElement.innerHTML = html;
  }
}

customElements.define('virtual-tree', VirtualTree);

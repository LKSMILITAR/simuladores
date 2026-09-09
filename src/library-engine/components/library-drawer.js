export class LibraryDrawer extends HTMLElement {
  #fsm;
  #panelElement;
  #backdropElement;
  #treeComponent;
  #searchInput;

  constructor() {
    super();
  }

  init(fsm) {
    this.#fsm = fsm;
    this.#fsm.subscribe(({ toState }) => this.#handleStateChange(toState));
  }

  connectedCallback() {
    this.className = 'lib-drawer lib-drawer--closed';
    this.setAttribute('aria-hidden', 'true');

    // Blindagem de estilos essenciais caso o CSS externo falhe no carregamento
    this.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; pointer-events: none; display: block;';

    this.innerHTML = `
      <div class="lib-drawer__backdrop"></div>
      <aside class="lib-drawer__panel" role="dialog" aria-label="Navegador de Biblioteca">
        <header class="lib-drawer__header">
          <h2>DATABASE TÁTICO</h2>
          <button class="lib-drawer__close-btn" aria-label="Fechar gaveta">&times;</button>
        </header>
        <div class="lib-drawer__search-box">
          <input type="search" class="lib-drawer__search-input" placeholder="Buscar no repositório..." />
        </div>
        <main class="lib-drawer__body">
          <virtual-tree class="lib-drawer__tree"></virtual-tree>
        </main>
      </aside>
    `;

    this.#panelElement = this.querySelector('.lib-drawer__panel');
    this.#backdropElement = this.querySelector('.lib-drawer__backdrop');
    this.#treeComponent = this.querySelector('virtual-tree');
    this.#searchInput = this.querySelector('.lib-drawer__search-input');

    this.#bindEvents();
  }

  #bindEvents() {
    this.querySelector('.lib-drawer__close-btn').addEventListener('click', () => {
      this.#fsm?.transition('CLOSE');
    });

    this.#backdropElement.addEventListener('click', () => {
      this.#fsm?.transition('CLOSE');
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.#fsm?.state === 'OPEN') {
        this.#fsm.transition('CLOSE');
      }
    });

    this.#searchInput.addEventListener('input', (e) => {
      this.dispatchEvent(new CustomEvent('library:search-input', {
        bubbles: true,
        composed: true,
        detail: { term: e.target.value }
      }));
    });

    this.#treeComponent.addEventListener('click', (e) => {
      const backBtn = e.target.closest('[data-action="back"]');
      if (backBtn) {
        this.dispatchEvent(new CustomEvent('library:navigate-back', { bubbles: true, composed: true }));
        return;
      }

      const itemElement = e.target.closest('.lib-tree-item');
      if (!itemElement) return;

      const path = itemElement.dataset.path;
      const name = itemElement.dataset.name;
      const type = itemElement.dataset.type;
      const chunk = itemElement.dataset.chunk;

      if (type === 'folder') {
        this.dispatchEvent(new CustomEvent('library:folder-selected', {
          bubbles: true,
          composed: true,
          detail: { path, chunk, name }
        }));
      } else {
        this.dispatchEvent(new CustomEvent('library:document-selected', {
          bubbles: true,
          composed: true,
          detail: { path, name }
        }));
      }
    });
  }

  setTreeData(items, folderInfo = null) {
    this.#treeComponent.setData(items, folderInfo);
  }

  resetToRoot(rootItems) {
    this.#treeComponent.resetToRoot(rootItems);
  }

  #handleStateChange(state) {
    switch (state) {
      case 'OPENING':
        this.style.pointerEvents = 'auto';
        this.classList.add('lib-drawer--opening');
        this.classList.remove('lib-drawer--closed');
        this.setAttribute('aria-hidden', 'false');
        break;
      case 'OPEN':
        this.style.pointerEvents = 'auto';
        this.classList.add('lib-drawer--open');
        this.classList.remove('lib-drawer--opening');
        this.#searchInput.focus();
        break;
      case 'CLOSING':
        this.classList.add('lib-drawer--closing');
        this.classList.remove('lib-drawer--open');
        break;
      case 'CLOSED':
        this.style.pointerEvents = 'none';
        this.classList.add('lib-drawer--closed');
        this.classList.remove('lib-drawer--closing', 'lib-drawer--open');
        this.setAttribute('aria-hidden', 'true');
        break;
    }
  }
}

customElements.define('library-drawer', LibraryDrawer);

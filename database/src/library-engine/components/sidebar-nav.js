const ICONS = {
  biblioteca: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  termodinamica: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
  eletrodinamica: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  aerodinamica: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  propulsao: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  estruturas: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  materiais: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  eletronica: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>`,
  sistemas_armas: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`,
  radar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
  inteligencia: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  logistica: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  historia: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  manuais: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  documentos: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
  projetos: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
};

const DISCIPLINE_ITEMS = [
  { name: 'Biblioteca', key: 'biblioteca', path: 'ROOT' },
  { name: 'Termodinâmica', key: 'termodinamica', path: 'Termodinâmica' },
  { name: 'Eletrodinâmica', key: 'eletrodinamica', path: 'Eletrodinâmica' },
  { name: 'Aerodinâmica', key: 'aerodinamica', path: 'Aerodinâmica' },
  { name: 'Propulsão', key: 'propulsao', path: 'Propulsão' },
  { name: 'Estruturas', key: 'estruturas', path: 'Estruturas' },
  { name: 'Materiais', key: 'materiais', path: 'Materiais' },
  { name: 'Eletrônica', key: 'eletronica', path: 'Eletrônica' },
  { name: 'Sistemas de Armas', key: 'sistemas_armas', path: 'Sistemas de Armas' },
  { name: 'Radar e Guerra Eletrônica', key: 'radar', path: 'Radar e Guerra Eletrônica' },
  { name: 'Inteligência e Vigilância', key: 'inteligencia', path: 'Inteligência e Vigilância' },
  { name: 'Logística e Suprimento', key: 'logistica', path: 'Logística e Suprimento' },
  { name: 'História Militar', key: 'historia', path: 'História Militar' },
  { name: 'Manuais Técnicos', key: 'manuais', path: 'Manuais Técnicos' },
  { name: 'Documentos Oficiais', key: 'documentos', path: 'Documentos Oficiais' },
  { name: 'Projetos e Simuladores', key: 'projetos', path: 'Projetos e Simuladores' }
];

export class SidebarNav extends HTMLElement {
  #activePath = 'ROOT';

  connectedCallback() {
    this.render();
  }

  setActive(path) {
    if (this.#activePath === path) return;
    this.#activePath = path;

    // Atualiza apenas as classes no DOM sem redesenhar todo o HTML
    this.querySelectorAll('.sidebar__item').forEach(el => {
      if (el.dataset.path === path) {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
      } else {
        el.classList.remove('active');
        el.removeAttribute('aria-current');
      }
    });
  }

  toggleCollapse() {
    this.classList.toggle('collapsed');
  }

  render() {
    this.innerHTML = `
      <nav class="sidebar__nav" aria-label="Navegação Disciplinar Tática">
        ${DISCIPLINE_ITEMS.map(item => `
          <a href="#" 
             class="sidebar__item ${this.#activePath === item.path ? 'active' : ''}" 
             data-path="${item.path}"
             ${this.#activePath === item.path ? 'aria-current="page"' : ''}>
            ${ICONS[item.key] || ICONS.manuais}
            <span>${item.name}</span>
          </a>
        `).join('')}
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__footer-brand">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2"><path d="M12 2L2 22l10-4 10 4L12 2z"/></svg>
          <span>LKS MILITAR</span>
        </div>
        <div class="sidebar__footer-coords">PROJEÇÃO TÁTICA GLOBAL<br>23.5505° S | 46.6333° W</div>
      </div>
    `;

    // Registra os eventos de clique uma única vez durante a montagem inicial
    this.querySelectorAll('.sidebar__item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPath = el.dataset.path;
        
        this.setActive(targetPath);

        this.dispatchEvent(new CustomEvent('sidebar:select', {
          bubbles: true,
          composed: true,
          detail: { path: targetPath }
        }));
      });
    });
  }
}

customElements.define('sidebar-nav', SidebarNav);

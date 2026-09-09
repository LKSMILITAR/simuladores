export class NavigationFSM {
  #state = 'IDLE';
  #previousCategoryState = null;
  #listeners = new Set();

  constructor() {
    this.#state = 'IDLE';
  }

  get state() {
    return this.#state;
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  transition(event, payload = null) {
    const prevState = this.#state;
    let nextState = prevState;

    switch (prevState) {
      case 'IDLE':
        if (event === 'SELECT_CATEGORY') nextState = 'LOADING_CATEGORY';
        if (event === 'OPEN_DOC') nextState = 'VIEWING_DOC';
        break;

      case 'LOADING_CATEGORY':
        if (event === 'LOAD_SUCCESS') {
          nextState = 'CATEGORY_ACTIVE';
          this.#previousCategoryState = payload; // Preserva contexto da categoria
        }
        if (event === 'LOAD_ERROR') nextState = 'IDLE';
        if (event === 'SELECT_CATEGORY') nextState = 'LOADING_CATEGORY'; // Reinicia para nova carga
        break;

      case 'CATEGORY_ACTIVE':
        if (event === 'SELECT_CATEGORY') nextState = 'LOADING_CATEGORY';
        if (event === 'OPEN_DOC') nextState = 'VIEWING_DOC';
        if (event === 'RESET') {
          nextState = 'IDLE';
          this.#previousCategoryState = null;
        }
        break;

      case 'VIEWING_DOC':
        if (event === 'CLOSE_DOC') {
          // Retorna à categoria anterior se ela existia, senão vai para IDLE
          nextState = this.#previousCategoryState ? 'CATEGORY_ACTIVE' : 'IDLE';
        }
        if (event === 'OPEN_DOC') nextState = 'VIEWING_DOC'; // Permite re-entrada direta para outro PDF
        if (event === 'SELECT_CATEGORY') nextState = 'LOADING_CATEGORY';
        if (event === 'RESET') {
          nextState = 'IDLE';
          this.#previousCategoryState = null;
        }
        break;
    }

    if (nextState !== prevState || event === 'OPEN_DOC' || event === 'SELECT_CATEGORY') {
      this.#state = nextState;
      this.#notify(prevState, nextState, event, payload);
    }
  }

  #notify(fromState, toState, event, payload) {
    this.#listeners.forEach(fn => fn({ fromState, toState, event, payload }));
  }
}

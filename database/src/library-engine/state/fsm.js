export class NavigationFSM {
  #state = 'IDLE';
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
        if (event === 'LOAD_SUCCESS') nextState = 'CATEGORY_ACTIVE';
        if (event === 'LOAD_ERROR') nextState = 'IDLE';
        break;

      case 'CATEGORY_ACTIVE':
        if (event === 'SELECT_CATEGORY') nextState = 'LOADING_CATEGORY';
        if (event === 'OPEN_DOC') nextState = 'VIEWING_DOC';
        if (event === 'RESET') nextState = 'IDLE';
        break;

      case 'VIEWING_DOC':
        if (event === 'CLOSE_DOC') nextState = 'IDLE';
        if (event === 'SELECT_CATEGORY') nextState = 'LOADING_CATEGORY';
        break;
    }

    if (nextState !== prevState) {
      this.#state = nextState;
      this.#notify(prevState, nextState, payload);
    }
  }

  #notify(fromState, toState, payload) {
    this.#listeners.forEach(fn => fn({ fromState, toState, payload }));
  }
}

export class NavigationFSM {
  #state;
  #listeners;
  #transitions;

  constructor() {
    this.#state = 'CLOSED';
    this.#listeners = new Set();

    this.#transitions = {
      CLOSED: { TOGGLE: 'OPENING', OPEN: 'OPENING' },
      OPENING: { ANIMATION_END: 'OPEN', CLOSE: 'CLOSING' },
      OPEN: { TOGGLE: 'CLOSING', CLOSE: 'CLOSING', FETCH_START: 'FETCHING' },
      FETCHING: { FETCH_SUCCESS: 'OPEN', FETCH_ERROR: 'ERROR' },
      ERROR: { RETRY: 'FETCHING', CLOSE: 'CLOSING' },
      CLOSING: { ANIMATION_END: 'CLOSED' }
    };
  }

  get state() {
    return this.#state;
  }

  transition(action, payload = null) {
    const allowedState = this.#transitions[this.#state]?.[action];

    if (!allowedState) {
      console.warn(`[FSM] Transição inválida: Ação '${action}' no estado atual '${this.#state}'.`);
      return false;
    }

    const previousState = this.#state;
    this.#state = allowedState;

    this.#notify(previousState, this.#state, payload);
    return true;
  }

  subscribe(callback) {
    this.#listeners.add(callback);
    return () => this.#listeners.delete(callback);
  }

  #notify(fromState, toState, payload) {
    for (const listener of this.#listeners) {
      try {
        listener({ fromState, toState, payload });
      } catch (err) {
        console.error('[FSM] Erro na execução de ouvinte de estado:', err);
      }
    }
  }
}

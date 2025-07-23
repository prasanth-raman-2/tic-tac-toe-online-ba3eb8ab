// PUBLIC_INTERFACE
/**
 * Manages game state and transitions
 * Handles state updates, history, and undo/redo functionality
 */
export class GameStateManager {
  constructor() {
    this.states = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }

  // PUBLIC_INTERFACE
  getCurrentState() {
    if (this.currentIndex === -1) {
      return this.getInitialState();
    }
    return this.states[this.currentIndex];
  }

  // PUBLIC_INTERFACE
  pushState(state) {
    // Remove any future states if we're not at the end
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }

    this.states.push(this.cloneState(state));
    this.currentIndex++;

    // Maintain history limit
    if (this.states.length > this.maxHistory) {
      this.states.shift();
      this.currentIndex--;
    }
  }

  // PUBLIC_INTERFACE
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.cloneState(this.states[this.currentIndex]);
    }
    return null;
  }

  // PUBLIC_INTERFACE
  redo() {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      return this.cloneState(this.states[this.currentIndex]);
    }
    return null;
  }

  getInitialState() {
    return {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      moveCount: 0,
      lastMove: null,
      winner: null,
      gameOver: false,
      timestamp: Date.now()
    };
  }

  cloneState(state) {
    return {
      board: [...state.board],
      currentPlayer: state.currentPlayer,
      moveCount: state.moveCount,
      lastMove: state.lastMove,
      winner: state.winner,
      gameOver: state.gameOver,
      timestamp: Date.now()
    };
  }

  // PUBLIC_INTERFACE
  canUndo() {
    return this.currentIndex > 0;
  }

  // PUBLIC_INTERFACE
  canRedo() {
    return this.currentIndex < this.states.length - 1;
  }

  // PUBLIC_INTERFACE
  getHistory() {
    return this.states.map(state => ({
      ...state,
      canRevertTo: true
    }));
  }

  // PUBLIC_INTERFACE
  revertToState(index) {
    if (index >= 0 && index < this.states.length) {
      this.currentIndex = index;
      return this.cloneState(this.states[index]);
    }
    return null;
  }

  // PUBLIC_INTERFACE
  reset() {
    this.states = [this.getInitialState()];
    this.currentIndex = 0;
    return this.cloneState(this.states[0]);
  }
}

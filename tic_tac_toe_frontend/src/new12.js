import React, { createContext, useContext, useReducer } from 'react';

// PUBLIC_INTERFACE
/**
 * Context for managing global game state
 * Provides access to game history, current state, and player information
 */
export const GameStateContext = createContext();

/**
 * Initial state configuration for the game
 * Defines default values for all game-related state
 */
const initialState = {
  history: [Array(9).fill(null)],
  stepNumber: 0,
  xIsNext: true,
  winner: null,
  winningLine: null,
  players: {
    X: { name: 'Player 1', score: 0 },
    O: { name: 'Player 2', score: 0 }
  },
  gameMode: 'local', // local, ai, online
  difficulty: 'medium', // easy, medium, hard
  timeLimit: null,
  moves: []
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'MAKE_MOVE':
      const history = state.history.slice(0, state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = [...current];
      
      if (state.winner || squares[action.index]) {
        return state;
      }
      
      squares[action.index] = state.xIsNext ? 'X' : 'O';
      
      return {
        ...state,
        history: [...history, squares],
        stepNumber: history.length,
        xIsNext: !state.xIsNext,
        moves: [...state.moves, { player: state.xIsNext ? 'X' : 'O', position: action.index }]
      };

    case 'JUMP_TO':
      return {
        ...state,
        stepNumber: action.step,
        xIsNext: (action.step % 2) === 0
      };

    case 'UPDATE_WINNER':
      return {
        ...state,
        winner: action.winner,
        winningLine: action.line,
        players: {
          ...state.players,
          [action.winner]: {
            ...state.players[action.winner],
            score: state.players[action.winner].score + 1
          }
        }
      };

    case 'RESET_GAME':
      return {
        ...state,
        history: [Array(9).fill(null)],
        stepNumber: 0,
        xIsNext: true,
        winner: null,
        winningLine: null,
        moves: []
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: {
          ...state.players,
          [action.player]: {
            ...state.players[action.player],
            name: action.name
          }
        }
      };

    case 'SET_GAME_MODE':
      return {
        ...state,
        gameMode: action.mode,
        difficulty: action.mode === 'ai' ? state.difficulty : null
      };

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.difficulty
      };

    case 'SET_TIME_LIMIT':
      return {
        ...state,
        timeLimit: action.timeLimit
      };

    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

import React from 'react';
import { useGameState } from './new12';

// PUBLIC_INTERFACE
export function GameHistory() {
  const { state, dispatch } = useGameState();

  const formatMove = (squares, moveNumber) => {
    if (moveNumber === 0) {
      return 'Game Start';
    }

    const prevSquares = state.history[moveNumber - 1];
    const currentSquares = squares;
    const movePosition = findDifference(prevSquares, currentSquares);
    const player = moveNumber % 2 === 0 ? 'O' : 'X';
    const position = getPositionDescription(movePosition);

    return `${player} moved to ${position}`;
  };

  const findDifference = (prev, current) => {
    for (let i = 0; i < prev.length; i++) {
      if (prev[i] !== current[i]) {
        return i;
      }
    }
    return -1;
  };

  const getPositionDescription = (index) => {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    return `row ${row}, column ${col}`;
  };

  const renderBoard = (squares) => {
    return (
      <div className="history-board">
        {[0, 1, 2].map(row => (
          <div key={row} className="history-board-row">
            {[0, 1, 2].map(col => {
              const index = row * 3 + col;
              return (
                <div key={col} className="history-square">
                  {squares[index]}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const jumpTo = (step) => {
    dispatch({ type: 'JUMP_TO', step });
  };

  return (
    <div className="game-history">
      <h2>Game History</h2>
      <div className="history-list">
        {state.history.map((squares, move) => {
          const isCurrentMove = move === state.stepNumber;
          return (
            <div
              key={move}
              className={`history-item ${isCurrentMove ? 'current' : ''}`}
              onClick={() => jumpTo(move)}
            >
              <div className="move-number">#{move}</div>
              <div className="move-description">
                {formatMove(squares, move)}
              </div>
              {renderBoard(squares)}
              {isCurrentMove && <div className="current-move-marker">Current</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

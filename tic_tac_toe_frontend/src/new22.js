/**
 * Game board utility functions
 * Provides helper methods for board analysis and validation
 */

// PUBLIC_INTERFACE
export function getEmptySquares(board) {
  return board
    .map((square, index) => square === null ? index : null)
    .filter(square => square !== null);
}

// PUBLIC_INTERFACE
export function isGameOver(board) {
  return hasWinner(board) || isBoardFull(board);
}

function hasWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  return lines.some(([a, b, c]) => 
    board[a] && board[a] === board[b] && board[a] === board[c]
  );
}

function isBoardFull(board) {
  return !board.includes(null);
}
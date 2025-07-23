// Utility helper functions

/**
 * Validates a move on the game board
 * @param {number} position - The position to check (0-8)
 * @param {Array} board - Current game board state
 * @returns {boolean} Whether the move is valid
 */
export function isValidMove(position, board) {
  return position >= 0 && position < 9 && board[position] === null;
}

/**
 * Gets the current game status message
 * @param {string} winner - Current winner (if any)
 * @param {boolean} isDraw - Whether game is a draw
 * @returns {string} Status message to display
 */
export function getGameStatus(winner, isDraw) {
  if (winner) return `Winner: ${winner}`;
  if (isDraw) return 'Game Draw!';
  return 'Game in progress';
}
// Game board validation utilities

// PUBLIC_INTERFACE
/**
 * Validates and enforces game board rules
 * Handles validation of moves, board state, and turn order
 */
export class BoardValidator {
  constructor() {
    this.validSymbols = new Set(['X', 'O', null]);
    this.validPositions = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }

  // PUBLIC_INTERFACE
  validateBoard(board) {
    if (!Array.isArray(board) || board.length !== 9) {
      throw new Error('Invalid board structure');
    }

    const xCount = board.filter(cell => cell === 'X').length;
    const oCount = board.filter(cell => cell === 'O').length;

    // X should either equal O or be one more than O
    if (xCount !== oCount && xCount !== oCount + 1) {
      throw new Error('Invalid turn order');
    }

    // Validate all symbols
    if (!board.every(cell => this.validSymbols.has(cell))) {
      throw new Error('Invalid symbols on board');
    }

    return true;
  }

  // PUBLIC_INTERFACE
  validateMove(position, board, currentPlayer) {
    if (!this.validPositions.has(position)) {
      throw new Error('Invalid position');
    }

    if (board[position] !== null) {
      throw new Error('Position already occupied');
    }

    const xCount = board.filter(cell => cell === 'X').length;
    const oCount = board.filter(cell => cell === 'O').length;

    if (currentPlayer === 'X' && xCount !== oCount) {
      throw new Error('Invalid turn: Not X\'s turn');
    }

    if (currentPlayer === 'O' && xCount !== oCount + 1) {
      throw new Error('Invalid turn: Not O\'s turn');
    }

    return true;
  }

  // PUBLIC_INTERFACE
  validateGameState(board, moveHistory) {
    // Check if the game should have ended
    const winner = this.findWinner(board);
    const isFull = !board.includes(null);

    if (winner) {
      const moves = moveHistory.length;
      if (moves < 5) {
        throw new Error('Invalid win: Game won too early');
      }
      return { status: 'won', winner };
    }

    if (isFull) {
      return { status: 'draw' };
    }

    return { status: 'ongoing' };
  }

  findWinner(board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
}

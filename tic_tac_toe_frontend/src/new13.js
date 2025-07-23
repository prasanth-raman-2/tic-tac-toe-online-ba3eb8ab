// PUBLIC_INTERFACE
export class AIPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.symbol = 'O';
  }

  // PUBLIC_INTERFACE
  makeMove(board) {
    switch (this.difficulty) {
      case 'easy':
        return this.makeRandomMove(board);
      case 'medium':
        return Math.random() < 0.6 ? 
          this.makeBestMove(board) : 
          this.makeRandomMove(board);
      case 'hard':
        return this.makeBestMove(board);
      default:
        return this.makeBestMove(board);
    }
  }

  makeRandomMove(board) {
    const availableMoves = board
      .map((cell, index) => cell === null ? index : null)
      .filter(cell => cell !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  makeBestMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;

    // Try each available move
    board.forEach((cell, index) => {
      if (cell === null) {
        board[index] = this.symbol;
        const score = this.minimax(board, 0, false);
        board[index] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = index;
        }
      }
    });

    return bestMove;
  }

  minimax(board, depth, isMaximizing) {
    const winner = this.checkWinner(board);
    if (winner !== null) {
      return winner === this.symbol ? 10 - depth : depth - 10;
    }

    if (!board.includes(null)) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      board.forEach((cell, index) => {
        if (cell === null) {
          board[index] = this.symbol;
          const score = this.minimax(board, depth + 1, false);
          board[index] = null;
          bestScore = Math.max(score, bestScore);
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      board.forEach((cell, index) => {
        if (cell === null) {
          board[index] = this.symbol === 'O' ? 'X' : 'O';
          const score = this.minimax(board, depth + 1, true);
          board[index] = null;
          bestScore = Math.min(score, bestScore);
        }
      });
      return bestScore;
    }
  }

  checkWinner(board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }
}

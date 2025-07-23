// PUBLIC_INTERFACE
/**
 * Implements an AI player with multiple difficulty levels
 * Uses minimax algorithm with alpha-beta pruning for optimal play
 */
export class AIPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.depthLimit = this.getDepthLimit();
    this.evaluationCache = new Map();
    this.moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  }

  // PUBLIC_INTERFACE
  setDifficulty(level) {
    this.difficulty = level;
    this.depthLimit = this.getDepthLimit();
    this.evaluationCache.clear();
  }

  // PUBLIC_INTERFACE
  getNextMove(board) {
    switch (this.difficulty) {
      case 'easy':
        return this.getEasyMove(board);
      case 'medium':
        return this.getMediumMove(board);
      case 'hard':
        return this.getHardMove(board);
      default:
        return this.getMediumMove(board);
    }
  }

  getDepthLimit() {
    switch (this.difficulty) {
      case 'easy': return 2;
      case 'medium': return 4;
      case 'hard': return 8;
      default: return 4;
    }
  }

  getEasyMove(board) {
    // 30% chance of random move
    if (Math.random() < 0.3) {
      return this.getRandomMove(board);
    }

    // Otherwise make a decent move but not optimal
    return this.getMediumMove(board);
  }

  getMediumMove(board) {
    // Check for immediate win
    const winningMove = this.findWinningMove(board, 'O');
    if (winningMove !== null) return winningMove;

    // Check for block
    const blockingMove = this.findWinningMove(board, 'X');
    if (blockingMove !== null) return blockingMove;

    // 50% chance of optimal move
    if (Math.random() < 0.5) {
      return this.getHardMove(board);
    }

    // Otherwise make a reasonable move
    return this.getStrategicMove(board);
  }

  getHardMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;

    // Clear cache for new calculation
    this.evaluationCache.clear();

    // Try moves in preferred order
    for (const move of this.moveOrder) {
      if (board[move] === null) {
        board[move] = 'O';
        const score = this.minimax(board, this.depthLimit, -Infinity, Infinity, false);
        board[move] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }

  minimax(board, depth, alpha, beta, isMaximizing) {
    const boardKey = this.getBoardKey(board);
    if (this.evaluationCache.has(boardKey)) {
      return this.evaluationCache.get(boardKey);
    }

    const winner = this.checkWinner(board);
    if (winner === 'O') return 10 + depth;
    if (winner === 'X') return -10 - depth;
    if (depth === 0 || !board.includes(null)) return this.evaluateBoard(board);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of this.moveOrder) {
        if (board[move] === null) {
          board[move] = 'O';
          const score = this.minimax(board, depth - 1, alpha, beta, false);
          board[move] = null;
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      this.evaluationCache.set(boardKey, maxScore);
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of this.moveOrder) {
        if (board[move] === null) {
          board[move] = 'X';
          const score = this.minimax(board, depth - 1, alpha, beta, true);
          board[move] = null;
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      this.evaluationCache.set(boardKey, minScore);
      return minScore;
    }
  }

  getRandomMove(board) {
    const availableMoves = board
      .map((cell, index) => cell === null ? index : null)
      .filter(move => move !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  getStrategicMove(board) {
    // Prioritize center
    if (board[4] === null) return 4;

    // Then corners
    const availableCorners = [0, 2, 6, 8].filter(pos => board[pos] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Then edges
    const availableEdges = [1, 3, 5, 7].filter(pos => board[pos] === null);
    if (availableEdges.length > 0) {
      return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }

    return this.getRandomMove(board);
  }

  findWinningMove(board, player) {
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = player;
        if (this.checkWinner(board) === player) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
    return null;
  }

  checkWinner(board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  evaluateBoard(board) {
    const score = {
      center: board[4] === 'O' ? 3 : board[4] === 'X' ? -3 : 0,
      corners: 0,
      edges: 0
    };

    // Evaluate corners
    [0, 2, 6, 8].forEach(pos => {
      if (board[pos] === 'O') score.corners += 2;
      else if (board[pos] === 'X') score.corners -= 2;
    });

    // Evaluate edges
    [1, 3, 5, 7].forEach(pos => {
      if (board[pos] === 'O') score.edges += 1;
      else if (board[pos] === 'X') score.edges -= 1;
    });

    return score.center + score.corners + score.edges;
  }

  getBoardKey(board) {
    return board.map(cell => cell || '-').join('');
  }
}

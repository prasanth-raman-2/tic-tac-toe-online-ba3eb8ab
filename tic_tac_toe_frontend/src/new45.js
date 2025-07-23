// PUBLIC_INTERFACE
export class GameDifficulty {
  constructor() {
    this.difficultyLevels = {
      beginner: {
        name: 'Beginner',
        description: 'Makes random moves with occasional strategic plays',
        randomness: 0.8,
        lookahead: 1,
        enableForks: false,
        useCorners: 0.3,
        useCenter: 0.5
      },
      intermediate: {
        name: 'Intermediate',
        description: 'Balances between strategic and random moves',
        randomness: 0.4,
        lookahead: 2,
        enableForks: true,
        useCorners: 0.6,
        useCenter: 0.8
      },
      advanced: {
        name: 'Advanced',
        description: 'Makes optimal moves with some variation',
        randomness: 0.2,
        lookahead: 3,
        enableForks: true,
        useCorners: 0.9,
        useCenter: 0.9
      },
      expert: {
        name: 'Expert',
        description: 'Plays optimal strategy',
        randomness: 0,
        lookahead: 4,
        enableForks: true,
        useCorners: 1,
        useCenter: 1
      }
    };

    this.currentDifficulty = 'intermediate';
    this.adaptiveDifficulty = false;
    this.playerPerformanceHistory = [];
  }

  // PUBLIC_INTERFACE
  setDifficulty(level) {
    if (this.difficultyLevels[level]) {
      this.currentDifficulty = level;
      return true;
    }
    return false;
  }

  // PUBLIC_INTERFACE
  enableAdaptiveDifficulty() {
    this.adaptiveDifficulty = true;
  }

  // PUBLIC_INTERFACE
  disableAdaptiveDifficulty() {
    this.adaptiveDifficulty = false;
  }

  // PUBLIC_INTERFACE
  getCurrentDifficultySettings() {
    return { ...this.difficultyLevels[this.currentDifficulty] };
  }

  // PUBLIC_INTERFACE
  updateDifficultyBasedOnPerformance(gameResult) {
    if (!this.adaptiveDifficulty) return;

    this.playerPerformanceHistory.push(gameResult);
    if (this.playerPerformanceHistory.length > 5) {
      this.playerPerformanceHistory.shift();
    }

    const adjustment = this.calculateDifficultyAdjustment();
    this.adjustDifficulty(adjustment);
  }

  calculateDifficultyAdjustment() {
    const recentGames = this.playerPerformanceHistory.slice(-3);
    const winRate = recentGames.filter(result => result === 'win').length / recentGames.length;

    if (winRate > 0.7) return 1; // Increase difficulty
    if (winRate < 0.3) return -1; // Decrease difficulty
    return 0; // Maintain current difficulty
  }

  adjustDifficulty(adjustment) {
    const difficultyLevels = Object.keys(this.difficultyLevels);
    const currentIndex = difficultyLevels.indexOf(this.currentDifficulty);
    const newIndex = Math.max(0, Math.min(difficultyLevels.length - 1, currentIndex + adjustment));
    this.currentDifficulty = difficultyLevels[newIndex];
  }

  // PUBLIC_INTERFACE
  getNextMove(gameState) {
    const settings = this.difficultyLevels[this.currentDifficulty];
    const board = gameState.history[gameState.stepNumber];
    
    // Check for immediate win
    const winningMove = this.findWinningMove(board, 'O');
    if (winningMove !== null) return winningMove;

    // Check for block opponent's win
    const blockingMove = this.findWinningMove(board, 'X');
    if (blockingMove !== null) return blockingMove;

    // Apply randomness factor
    if (Math.random() < settings.randomness) {
      return this.getRandomMove(board);
    }

    // Strategic move based on difficulty settings
    return this.getStrategicMove(board, settings);
  }

  findWinningMove(board, player) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] === player && board[a] === board[b] && board[c] === null) return c;
      if (board[a] === player && board[a] === board[c] && board[b] === null) return b;
      if (board[b] === player && board[b] === board[c] && board[a] === null) return a;
    }

    return null;
  }

  getRandomMove(board) {
    const availableMoves = board
      .map((cell, index) => cell === null ? index : null)
      .filter(cell => cell !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  getStrategicMove(board, settings) {
    // Try to take center if appropriate
    if (board[4] === null && Math.random() < settings.useCenter) {
      return 4;
    }

    // Try corners if appropriate
    if (Math.random() < settings.useCorners) {
      const corners = [0, 2, 6, 8].filter(i => board[i] === null);
      if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
      }
    }

    // Look for fork opportunities if enabled
    if (settings.enableForks) {
      const forkMove = this.findForkMove(board, 'O');
      if (forkMove !== null) return forkMove;

      // Block opponent's fork
      const blockForkMove = this.findForkMove(board, 'X');
      if (blockForkMove !== null) return blockForkMove;
    }

    // Default to any available move
    return this.getRandomMove(board);
  }

  findForkMove(board, player) {
    const emptyCells = board
      .map((cell, index) => cell === null ? index : null)
      .filter(cell => cell !== null);

    for (let move of emptyCells) {
      const testBoard = [...board];
      testBoard[move] = player;

      let winningLines = 0;
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      for (let line of lines) {
        if (line.includes(move)) {
          const otherCells = line.filter(cell => cell !== move);
          if (testBoard[otherCells[0]] === player && testBoard[otherCells[1]] === null ||
              testBoard[otherCells[1]] === player && testBoard[otherCells[0]] === null) {
            winningLines++;
          }
        }
      }

      if (winningLines >= 2) return move;
    }

    return null;
  }
}

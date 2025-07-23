// PUBLIC_INTERFACE
/**
 * Tracks and analyzes game statistics
 * Maintains historical data and generates insights
 */
export class GameStatistics {
  constructor() {
    this.stats = {
      totalGames: 0,
      players: {
        X: {
          wins: 0,
          losses: 0,
          draws: 0,
          avgMoveDuration: 0,
          preferredPositions: Array(9).fill(0),
          winningPatterns: new Map()
        },
        O: {
          wins: 0,
          losses: 0,
          draws: 0,
          avgMoveDuration: 0,
          preferredPositions: Array(9).fill(0),
          winningPatterns: new Map()
        }
      },
      gameHistory: [],
      currentStreak: {
        player: null,
        count: 0
      },
      longestGame: {
        moves: 0,
        duration: 0,
        timestamp: null
      },
      shortestGame: {
        moves: Infinity,
        duration: Infinity,
        timestamp: null
      }
    };
  }

  // PUBLIC_INTERFACE
  recordGame(gameData) {
    this.stats.totalGames++;
    this.updatePlayerStats(gameData);
    this.updateGameHistory(gameData);
    this.updateStreaks(gameData);
    this.updateGameDurationRecords(gameData);
    return this.generateGameSummary(gameData);
  }

  updatePlayerStats(gameData) {
    const { winner, moves, duration } = gameData;
    const players = ['X', 'O'];

    players.forEach(player => {
      const playerStats = this.stats.players[player];

      // Update win/loss/draw record
      if (winner === player) {
        playerStats.wins++;
        this.updateWinningPattern(player, gameData.finalBoard);
      } else if (winner === null) {
        playerStats.draws++;
      } else {
        playerStats.losses++;
      }

      // Update move statistics
      const playerMoves = moves.filter(move => move.player === player);
      playerMoves.forEach(move => {
        playerStats.preferredPositions[move.position]++;
        this.updateMoveDuration(player, move.duration);
      });
    });
  }

  updateMoveDuration(player, duration) {
    const stats = this.stats.players[player];
    const totalGames = stats.wins + stats.losses + stats.draws;
    stats.avgMoveDuration = 
      (stats.avgMoveDuration * (totalGames - 1) + duration) / totalGames;
  }

  updateWinningPattern(player, board) {
    const pattern = board.join('');
    const patterns = this.stats.players[player].winningPatterns;
    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
  }

  updateGameHistory(gameData) {
    this.stats.gameHistory.push({
      timestamp: Date.now(),
      winner: gameData.winner,
      moves: gameData.moves.length,
      duration: gameData.duration,
      finalBoard: [...gameData.finalBoard]
    });

    // Keep only last 100 games
    if (this.stats.gameHistory.length > 100) {
      this.stats.gameHistory.shift();
    }
  }

  updateStreaks(gameData) {
    const { winner } = gameData;
    if (winner === this.stats.currentStreak.player) {
      this.stats.currentStreak.count++;
    } else {
      this.stats.currentStreak = {
        player: winner,
        count: winner ? 1 : 0
      };
    }
  }

  updateGameDurationRecords(gameData) {
    const { moves, duration } = gameData;
    
    if (duration > this.stats.longestGame.duration) {
      this.stats.longestGame = {
        moves,
        duration,
        timestamp: Date.now()
      };
    }

    if (duration < this.stats.shortestGame.duration) {
      this.stats.shortestGame = {
        moves,
        duration,
        timestamp: Date.now()
      };
    }
  }

  // PUBLIC_INTERFACE
  generateGameSummary(gameData) {
    const { winner, moves, duration } = gameData;
    const playerStats = this.stats.players[winner || 'X'];

    return {
      result: winner ? `${winner} wins!` : 'Draw',
      moveCount: moves.length,
      duration: this.formatDuration(duration),
      playerStats: {
        totalGames: this.stats.totalGames,
        winRate: this.calculateWinRate(winner),
        averageMoveDuration: this.formatDuration(playerStats.avgMoveDuration),
        currentStreak: this.stats.currentStreak,
        preferredPositions: this.getPreferredPositions(winner)
      }
    };
  }

  calculateWinRate(player) {
    if (!player) return 0;
    const stats = this.stats.players[player];
    const totalGames = stats.wins + stats.losses + stats.draws;
    return totalGames > 0 ? (stats.wins / totalGames * 100).toFixed(1) : 0;
  }

  getPreferredPositions(player) {
    if (!player) return [];
    const positions = this.stats.players[player].preferredPositions;
    const total = positions.reduce((sum, count) => sum + count, 0);
    
    return positions.map((count, index) => ({
      position: index,
      frequency: total > 0 ? (count / total * 100).toFixed(1) : 0
    }));
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  // PUBLIC_INTERFACE
  getPlayerStats(player) {
    return { ...this.stats.players[player] };
  }

  // PUBLIC_INTERFACE
  getGameHistory() {
    return [...this.stats.gameHistory];
  }

  // PUBLIC_INTERFACE
  reset() {
    this.stats = {
      totalGames: 0,
      players: {
        X: {
          wins: 0,
          losses: 0,
          draws: 0,
          avgMoveDuration: 0,
          preferredPositions: Array(9).fill(0),
          winningPatterns: new Map()
        },
        O: {
          wins: 0,
          losses: 0,
          draws: 0,
          avgMoveDuration: 0,
          preferredPositions: Array(9).fill(0),
          winningPatterns: new Map()
        }
      },
      gameHistory: [],
      currentStreak: {
        player: null,
        count: 0
      },
      longestGame: {
        moves: 0,
        duration: 0,
        timestamp: null
      },
      shortestGame: {
        moves: Infinity,
        duration: Infinity,
        timestamp: null
      }
    };
  }
}

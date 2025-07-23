// PUBLIC_INTERFACE
export class GameMetrics {
  constructor() {
    this.metrics = {
      totalMoves: 0,
      averageMoveDuration: 0,
      movePatterns: new Map(),
      playerStats: {
        X: {
          cornerMoves: 0,
          centerMoves: 0,
          edgeMoves: 0,
          averageMoveTime: 0
        },
        O: {
          cornerMoves: 0,
          centerMoves: 0,
          edgeMoves: 0,
          averageMoveTime: 0
        }
      },
      gameStates: [],
      heatmap: Array(9).fill(0)
    };

    this.startTime = null;
    this.moveTimestamps = [];
  }

  // PUBLIC_INTERFACE
  startTracking() {
    this.startTime = Date.now();
    this.moveTimestamps = [];
  }

  // PUBLIC_INTERFACE
  recordMove(player, position) {
    this.moveTimestamps.push(Date.now());
    this.metrics.totalMoves++;
    this.metrics.heatmap[position]++;

    // Update player-specific stats
    const playerStats = this.metrics.playerStats[player];
    if (this.isCornerMove(position)) {
      playerStats.cornerMoves++;
    } else if (this.isCenterMove(position)) {
      playerStats.centerMoves++;
    } else {
      playerStats.edgeMoves++;
    }

    // Calculate average move duration
    if (this.moveTimestamps.length > 1) {
      const lastMoveTime = this.moveTimestamps[this.moveTimestamps.length - 1] -
                          this.moveTimestamps[this.moveTimestamps.length - 2];
      playerStats.averageMoveTime = 
        (playerStats.averageMoveTime * (this.metrics.totalMoves - 1) + lastMoveTime) /
        this.metrics.totalMoves;
    }

    // Record move pattern
    this.recordMovePattern(player, position);
  }

  isCornerMove(position) {
    return [0, 2, 6, 8].includes(position);
  }

  isCenterMove(position) {
    return position === 4;
  }

  recordMovePattern(player, position) {
    const currentState = this.metrics.gameStates[this.metrics.gameStates.length - 1] || Array(9).fill(null);
    const pattern = currentState.join('');
    
    if (!this.metrics.movePatterns.has(pattern)) {
      this.metrics.movePatterns.set(pattern, new Map());
    }
    
    const positionChoices = this.metrics.movePatterns.get(pattern);
    positionChoices.set(position, (positionChoices.get(position) || 0) + 1);
  }

  // PUBLIC_INTERFACE
  updateGameState(newState) {
    this.metrics.gameStates.push([...newState]);
  }

  // PUBLIC_INTERFACE
  getHeatmap() {
    const total = this.metrics.heatmap.reduce((sum, count) => sum + count, 0);
    return this.metrics.heatmap.map(count => count / total);
  }

  // PUBLIC_INTERFACE
  getPlayerStats(player) {
    const stats = this.metrics.playerStats[player];
    const totalMoves = stats.cornerMoves + stats.centerMoves + stats.edgeMoves;
    
    return {
      ...stats,
      moveDistribution: {
        corners: stats.cornerMoves / totalMoves,
        center: stats.centerMoves / totalMoves,
        edges: stats.edgeMoves / totalMoves
      }
    };
  }

  // PUBLIC_INTERFACE
  getMostCommonPatterns() {
    const patterns = Array.from(this.metrics.movePatterns.entries())
      .map(([state, moves]) => ({
        state,
        moves: Array.from(moves.entries())
          .sort((a, b) => b[1] - a[1])
      }))
      .sort((a, b) => b.moves[0][1] - a.moves[0][1]);

    return patterns.slice(0, 5);
  }

  // PUBLIC_INTERFACE
  reset() {
    this.metrics = {
      totalMoves: 0,
      averageMoveDuration: 0,
      movePatterns: new Map(),
      playerStats: {
        X: {
          cornerMoves: 0,
          centerMoves: 0,
          edgeMoves: 0,
          averageMoveTime: 0
        },
        O: {
          cornerMoves: 0,
          centerMoves: 0,
          edgeMoves: 0,
          averageMoveTime: 0
        }
      },
      gameStates: [],
      heatmap: Array(9).fill(0)
    };
    this.startTime = null;
    this.moveTimestamps = [];
  }
}

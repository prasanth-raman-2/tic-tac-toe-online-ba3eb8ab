// PUBLIC_INTERFACE
export class GamePerformance {
  constructor() {
    this.performanceData = {
      moveTimings: [],
      decisionPoints: [],
      criticalMoves: [],
      playerStrengths: {
        X: new Map(),
        O: new Map()
      },
      playerWeaknesses: {
        X: new Map(),
        O: new Map()
      },
      improvementSuggestions: new Map()
    };

    this.analysisMetrics = {
      averageDecisionTime: 0,
      consistencyScore: 0,
      strategicThinking: 0,
      adaptability: 0
    };
  }

  // PUBLIC_INTERFACE
  recordMove(player, position, gameState, timeSpent) {
    this.performanceData.moveTimings.push({
      player,
      position,
      timeSpent,
      moveNumber: this.performanceData.moveTimings.length + 1
    });

    this.analyzeMoveQuality(player, position, gameState);
    this.updateAnalysisMetrics(player);
  }

  analyzeMoveQuality(player, position, gameState) {
    const moveQuality = this.evaluateMove(position, gameState);
    
    if (moveQuality.score > 0.7) {
      this.recordStrength(player, moveQuality.type);
    } else if (moveQuality.score < 0.3) {
      this.recordWeakness(player, moveQuality.type);
    }

    if (moveQuality.isCritical) {
      this.performanceData.criticalMoves.push({
        player,
        position,
        moveNumber: this.performanceData.moveTimings.length,
        quality: moveQuality
      });
    }
  }

  evaluateMove(position, gameState) {
    const board = gameState.history[gameState.stepNumber];
    
    // Evaluate different aspects of the move
    const evaluation = {
      score: 0,
      type: '',
      isCritical: false,
      factors: [],
      threats: {
        immediate: [],
        potential: [],
        defensive: []
      },
      opportunities: {
        winning: [],
        forking: [],
        positioning: []
      }
    };

    // Center control
    if (position === 4 && gameState.stepNumber < 2) {
      evaluation.score += 0.3;
      evaluation.factors.push('early_center_control');
    }

    // Corner preference
    if ([0, 2, 6, 8].includes(position) && gameState.stepNumber < 3) {
      evaluation.score += 0.2;
      evaluation.factors.push('strong_corner_play');
    }

    // Blocking opponent's win
    if (this.wouldPreventLoss(position, board)) {
      evaluation.score += 0.4;
      evaluation.isCritical = true;
      evaluation.factors.push('critical_defense');
    }

    // Creating winning opportunity
    if (this.createsWinningOpportunity(position, board)) {
      evaluation.score += 0.4;
      evaluation.isCritical = true;
      evaluation.factors.push('winning_setup');
    }

    // Fork creation or prevention
    if (this.involvesFork(position, board)) {
      evaluation.score += 0.3;
      evaluation.factors.push('fork_manipulation');
    }

    // Determine move type based on highest contributing factor
    evaluation.type = this.determineMoveType(evaluation.factors);

    return evaluation;
  }

  wouldPreventLoss(position, board) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let line of lines) {
      if (line.includes(position)) {
        const otherPositions = line.filter(pos => pos !== position);
        if (board[otherPositions[0]] === board[otherPositions[1]] && 
            board[otherPositions[0]] !== null) {
          return true;
        }
      }
    }
    return false;
  }

  createsWinningOpportunity(position, board) {
    const tempBoard = [...board];
    tempBoard[position] = 'X'; // Assume current player is X
    return this.hasWinningLine(tempBoard, 'X');
  }

  hasWinningLine(board, player) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    return lines.some(line =>
      line.every(pos => board[pos] === player)
    );
  }

  involvesFork(position, board) {
    const tempBoard = [...board];
    tempBoard[position] = 'X';
    
    let winningLines = 0;
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      if (line.includes(position)) {
        const remainingPositions = line.filter(pos => pos !== position);
        if (remainingPositions.every(pos => !board[pos])) {
          winningLines++;
        }
      }
    }

    return winningLines >= 2;
  }

  determineMoveType(factors) {
    const factorPriority = {
      'critical_defense': 1,
      'winning_setup': 2,
      'fork_manipulation': 3,
      'early_center_control': 4,
      'strong_corner_play': 5
    };

    return factors.sort((a, b) => factorPriority[a] - factorPriority[b])[0];
  }

  recordStrength(player, type) {
    const strengths = this.performanceData.playerStrengths[player];
    strengths.set(type, (strengths.get(type) || 0) + 1);
  }

  recordWeakness(player, type) {
    const weaknesses = this.performanceData.playerWeaknesses[player];
    weaknesses.set(type, (weaknesses.get(type) || 0) + 1);
  }

  updateAnalysisMetrics(player) {
    const recentMoves = this.performanceData.moveTimings.slice(-3);
    
    // Update average decision time
    this.analysisMetrics.averageDecisionTime = 
      recentMoves.reduce((sum, move) => sum + move.timeSpent, 0) / recentMoves.length;

    // Update consistency score
    const timeVariance = this.calculateTimeVariance(recentMoves);
    this.analysisMetrics.consistencyScore = 1 / (1 + timeVariance);

    // Update strategic thinking score
    this.analysisMetrics.strategicThinking = 
      this.calculateStrategicScore(player);

    // Update adaptability score
    this.analysisMetrics.adaptability = 
      this.calculateAdaptabilityScore(player);
  }

  calculateTimeVariance(moves) {
    const mean = moves.reduce((sum, move) => sum + move.timeSpent, 0) / moves.length;
    return moves.reduce((sum, move) => sum + Math.pow(move.timeSpent - mean, 2), 0) / moves.length;
  }

  calculateStrategicScore(player) {
    const strengths = this.performanceData.playerStrengths[player];
    const criticalMoves = this.performanceData.criticalMoves
      .filter(move => move.player === player);
    
    return (strengths.size * 0.3) + (criticalMoves.length * 0.7);
  }

  calculateAdaptabilityScore(player) {
    const uniqueMoveTypes = new Set(
      this.performanceData.moveTimings
        .filter(move => move.player === player)
        .map(move => this.determineMoveType([move.type]))
    );

    return uniqueMoveTypes.size / 5; // Normalize by total possible move types
  }

  // PUBLIC_INTERFACE
  generatePerformanceReport(player) {
    return {
      metrics: { ...this.analysisMetrics },
      strengths: Array.from(this.performanceData.playerStrengths[player].entries()),
      weaknesses: Array.from(this.performanceData.playerWeaknesses[player].entries()),
      criticalMoves: this.performanceData.criticalMoves
        .filter(move => move.player === player),
      suggestions: this.generateImprovementSuggestions(player)
    };
  }

  generateImprovementSuggestions(player) {
    const weaknesses = this.performanceData.playerWeaknesses[player];
    const suggestions = new Map();

    weaknesses.forEach((count, type) => {
      switch (type) {
        case 'critical_defense':
          suggestions.set(type, 'Pay more attention to opponent's winning opportunities');
          break;
        case 'winning_setup':
          suggestions.set(type, 'Look for opportunities to create winning lines');
          break;
        case 'fork_manipulation':
          suggestions.set(type, 'Practice identifying and creating fork opportunities');
          break;
        case 'early_center_control':
          suggestions.set(type, 'Consider taking center control in early game');
          break;
        case 'strong_corner_play':
          suggestions.set(type, 'Utilize corners more effectively in opening moves');
          break;
      }
    });

    return suggestions;
  }

  // PUBLIC_INTERFACE
  reset() {
    this.performanceData = {
      moveTimings: [],
      decisionPoints: [],
      criticalMoves: [],
      playerStrengths: {
        X: new Map(),
        O: new Map()
      },
      playerWeaknesses: {
        X: new Map(),
        O: new Map()
      },
      improvementSuggestions: new Map()
    };

    this.analysisMetrics = {
      averageDecisionTime: 0,
      consistencyScore: 0,
      strategicThinking: 0,
      adaptability: 0
    };
  }
}

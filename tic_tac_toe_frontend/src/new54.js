// PUBLIC_INTERFACE
/**
 * Analyzes game moves and provides strategic insights
 * Evaluates move quality and suggests optimal plays
 */
export class MoveAnalyzer {
  constructor() {
    this.movePatterns = {
      corner: [0, 2, 6, 8],
      edge: [1, 3, 5, 7],
      center: [4]
    };
  }

  // PUBLIC_INTERFACE
  analyzeMoveQuality(position, board, player) {
    const analysis = {
      score: 0,
      threat: this.assessThreat(position, board, player),
      opportunity: this.assessOpportunity(position, board, player),
      position: this.assessPosition(position),
      strategy: this.assessStrategy(position, board, player)
    };

    // Calculate overall score
    analysis.score = this.calculateScore(analysis);
    return analysis;
  }

  assessThreat(position, board, player) {
    const opponent = player === 'X' ? 'O' : 'X';
    const testBoard = [...board];
    testBoard[position] = player;

    return {
      blocksWin: this.wouldPreventWin(position, board, opponent),
      preventsCornerTrap: this.preventsCornerTrap(position, board, opponent),
      preventsFork: this.preventsFork(position, board, opponent)
    };
  }

  assessOpportunity(position, board, player) {
    const testBoard = [...board];
    testBoard[position] = player;

    return {
      createsWinningMove: this.createsWinningMove(testBoard, player),
      createsFork: this.createsFork(position, board, player),
      setsUpStrategy: this.setsUpStrategy(position, board, player)
    };
  }

  assessPosition(position) {
    if (this.movePatterns.corner.includes(position)) {
      return { type: 'corner', value: 3 };
    }
    if (this.movePatterns.center.includes(position)) {
      return { type: 'center', value: 4 };
    }
    return { type: 'edge', value: 2 };
  }

  assessStrategy(position, board, player) {
    return {
      controlsCenter: position === 4,
      buildsTriangle: this.buildsTriangle(position, board, player),
      maintainsBalance: this.maintainsBalance(position, board, player)
    };
  }

  wouldPreventWin(position, board, opponent) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const line of lines) {
      if (line.includes(position)) {
        const otherPositions = line.filter(pos => pos !== position);
        if (board[otherPositions[0]] === opponent && 
            board[otherPositions[1]] === opponent) {
          return true;
        }
      }
    }
    return false;
  }

  preventsCornerTrap(position, board, opponent) {
    const corners = this.movePatterns.corner;
    const occupiedCorners = corners.filter(pos => board[pos] === opponent);
    return position === 4 && occupiedCorners.length === 2;
  }

  preventsFork(position, board, opponent) {
    const testBoard = [...board];
    testBoard[position] = opponent;
    return this.countWinningLines(testBoard, opponent) >= 2;
  }

  createsWinningMove(board, player) {
    return this.countWinningLines(board, player) > 0;
  }

  createsFork(position, board, player) {
    const testBoard = [...board];
    testBoard[position] = player;
    return this.countWinningLines(testBoard, player) >= 2;
  }

  setsUpStrategy(position, board, player) {
    const testBoard = [...board];
    testBoard[position] = player;
    return this.countPotentialLines(testBoard, player) >= 2;
  }

  buildsTriangle(position, board, player) {
    const playerMoves = board
      .map((cell, index) => cell === player ? index : null)
      .filter(index => index !== null);
    
    return playerMoves.length >= 2 && 
           this.movePatterns.corner.includes(position) &&
           playerMoves.some(move => this.movePatterns.corner.includes(move));
  }

  maintainsBalance(position, board, player) {
    const corners = this.movePatterns.corner;
    const edges = this.movePatterns.edge;
    
    const playerCorners = corners.filter(pos => board[pos] === player).length;
    const playerEdges = edges.filter(pos => board[pos] === player).length;
    
    return (playerCorners === playerEdges);
  }

  countWinningLines(board, player) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    return lines.filter(line => {
      const [a, b, c] = line;
      return board[a] === player && board[b] === player && board[c] === player;
    }).length;
  }

  countPotentialLines(board, player) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    return lines.filter(line => {
      const [a, b, c] = line;
      const lineValues = [board[a], board[b], board[c]];
      const playerCount = lineValues.filter(v => v === player).length;
      const emptyCount = lineValues.filter(v => v === null).length;
      return playerCount === 2 && emptyCount === 1;
    }).length;
  }

  calculateScore(analysis) {
    let score = 0;

    // Position value
    score += analysis.position.value;

    // Threat assessment
    if (analysis.threat.blocksWin) score += 5;
    if (analysis.threat.preventsCornerTrap) score += 3;
    if (analysis.threat.preventsFork) score += 4;

    // Opportunity assessment
    if (analysis.opportunity.createsWinningMove) score += 5;
    if (analysis.opportunity.createsFork) score += 4;
    if (analysis.opportunity.setsUpStrategy) score += 2;

    // Strategy assessment
    if (analysis.strategy.controlsCenter) score += 3;
    if (analysis.strategy.buildsTriangle) score += 2;
    if (analysis.strategy.maintainsBalance) score += 1;

    return Math.min(10, score);
  }
}

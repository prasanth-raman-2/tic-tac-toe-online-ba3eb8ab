/**
 * Game Utility Module
 * Provides helper functions for game state analysis and board validation
 */

// PUBLIC_INTERFACE
/**
 * Analyzes the current board state to determine optimal positions
 * @param {Array} board - Current game board state
 * @param {string} player - Current player symbol ('X' or 'O')
 * @returns {Object} Analysis results including optimal moves and threat levels
 */
export function analyzeGameState(board, player) {
  return {
    winningMoves: findWinningMoves(board, player),
    threateningMoves: findThreateningMoves(board, player),
    optimalMoves: calculateOptimalMoves(board, player),
    threatLevel: assessThreatLevel(board, player)
  };
}

/**
 * Finds all possible winning moves for the current player
 * @param {Array} board - Current game board
 * @param {string} player - Current player symbol
 * @returns {Array} List of winning move positions
 */
function findWinningMoves(board, player) {
  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  return winningLines.reduce((moves, line) => {
    const [a, b, c] = line;
    const lineState = [board[a], board[b], board[c]];
    const playerCount = lineState.filter(cell => cell === player).length;
    const emptyCount = lineState.filter(cell => cell === null).length;

    if (playerCount === 2 && emptyCount === 1) {
      const winningPosition = line[lineState.indexOf(null)];
      moves.push(winningPosition);
    }
    return moves;
  }, []);
}

/**
 * Identifies threatening moves from the opponent
 * @param {Array} board - Current game board
 * @param {string} player - Current player symbol
 * @returns {Array} List of positions that need to be blocked
 */
function findThreateningMoves(board, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  return findWinningMoves(board, opponent);
}

/**
 * Calculates optimal moves based on current board state
 * @param {Array} board - Current game board
 * @param {string} player - Current player symbol
 * @returns {Array} Ranked list of optimal moves
 */
function calculateOptimalMoves(board, player) {
  const moves = [];
  const corners = [0, 2, 6, 8];
  const edges = [1, 3, 5, 7];
  const center = 4;

  // Prioritize center if available
  if (board[center] === null) {
    moves.push({ position: center, weight: 3 });
  }

  // Check corners
  corners.forEach(pos => {
    if (board[pos] === null) {
      moves.push({ position: pos, weight: 2 });
    }
  });

  // Check edges
  edges.forEach(pos => {
    if (board[pos] === null) {
      moves.push({ position: pos, weight: 1 });
    }
  });

  return moves.sort((a, b) => b.weight - a.weight);
}

/**
 * Assesses the threat level in the current game state
 * @param {Array} board - Current game board
 * @param {string} player - Current player symbol
 * @returns {Object} Threat assessment details
 */
function assessThreatLevel(board, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  const threats = findThreateningMoves(board, player);
  const opportunities = findWinningMoves(board, player);

  return {
    level: threats.length > 0 ? 'high' : opportunities.length > 0 ? 'medium' : 'low',
    immediateThreats: threats.length,
    winningOpportunities: opportunities.length,
    opponentControl: calculateControlScore(board, opponent),
    playerControl: calculateControlScore(board, player)
  };
}

/**
 * Calculates how much control a player has over the board
 * @param {Array} board - Current game board
 * @param {string} player - Player symbol to analyze
 * @returns {number} Control score between 0 and 1
 */
function calculateControlScore(board, player) {
  const playerPositions = board.filter(cell => cell === player).length;
  const totalPositions = board.filter(cell => cell !== null).length;
  
  if (totalPositions === 0) return 0;
  return playerPositions / totalPositions;
}

// PUBLIC_INTERFACE
/**
 * Validates if a move is legal and advantageous
 * @param {number} position - Board position (0-8)
 * @param {Array} board - Current game board
 * @param {string} player - Current player symbol
 * @returns {Object} Validation result and move quality assessment
 */
export function validateMove(position, board, player) {
  if (position < 0 || position > 8) {
    return {
      valid: false,
      reason: 'Position out of bounds',
      quality: 0
    };
  }

  if (board[position] !== null) {
    return {
      valid: false,
      reason: 'Position already occupied',
      quality: 0
    };
  }

  const analysis = analyzeGameState(board, player);
  const moveQuality = calculateMoveQuality(position, analysis);

  return {
    valid: true,
    reason: 'Valid move',
    quality: moveQuality,
    analysis: analysis
  };
}

/**
 * Calculates the quality score of a move
 * @param {number} position - Board position
 * @param {Object} analysis - Game state analysis
 * @returns {number} Quality score between 0 and 1
 */
function calculateMoveQuality(position, analysis) {
  let quality = 0.5; // Base quality

  // Check if it's a winning move
  if (analysis.winningMoves.includes(position)) {
    quality = 1.0;
  }
  // Check if it blocks opponent's winning move
  else if (analysis.threateningMoves.includes(position)) {
    quality = 0.9;
  }
  // Consider position strategic value
  else {
    const optimalMove = analysis.optimalMoves.find(move => move.position === position);
    if (optimalMove) {
      quality = 0.5 + (optimalMove.weight * 0.1);
    }
  }

  return quality;
}

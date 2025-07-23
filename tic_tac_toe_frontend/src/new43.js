import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
export function GameTips({ gameState, playerStats }) {
  const [currentTip, setCurrentTip] = useState(null);
  const [tipHistory, setTipHistory] = useState([]);

  const tips = {
    general: [
      {
        id: 'center',
        text: 'Try to control the center square when possible - it provides the most winning opportunities.',
        condition: (state) => !state.history[state.stepNumber][4]
      },
      {
        id: 'corners',
        text: 'Corners are stronger positions than edges - they're part of more potential winning lines.',
        condition: (state) => state.stepNumber < 2
      },
      {
        id: 'blocking',
        text: 'Always check if your opponent is one move away from winning and block them if necessary.',
        condition: () => true
      }
    ],
    situational: [
      {
        id: 'fork',
        text: 'Watch out for fork opportunities where you can create two winning threats.',
        condition: (state) => state.stepNumber >= 3
      },
      {
        id: 'diagonal',
        text: 'Two corners on a diagonal can create strong winning opportunities.',
        condition: (state) => state.stepNumber <= 2
      }
    ],
    defensive: [
      {
        id: 'corner_defense',
        text: 'If opponent takes center, taking a corner is often the best defense.',
        condition: (state) => state.history[state.stepNumber][4] === 'O'
      },
      {
        id: 'edge_trap',
        text: 'Be careful of edge moves early - they can lead to forced losses.',
        condition: (state) => state.stepNumber < 2
      }
    ]
  };

  const analyzeBoardState = (state) => {
    const board = state.history[state.stepNumber];
    const patterns = {
      cornersTaken: board.filter((square, i) => [0, 2, 6, 8].includes(i) && square).length,
      centerTaken: board[4] !== null,
      edgesTaken: board.filter((square, i) => [1, 3, 5, 7].includes(i) && square).length
    };

    return patterns;
  };

  const checkForForkThreat = (state) => {
    const board = state.history[state.stepNumber];
    // Check common fork patterns
    const forkPatterns = [
      [0, 8], [2, 6], // Diagonal corners
      [0, 5], [2, 3], // Corner-edge combinations
      [8, 1], [6, 7]
    ];

    for (let pattern of forkPatterns) {
      if (pattern.every(pos => board[pos] === 'O')) {
        return true;
      }
    }
    return false;
  };

  const generateSituationalTip = (state) => {
    const boardState = analyzeBoardState(state);
    const isEarlyGame = state.stepNumber < 3;
    const isMidGame = state.stepNumber >= 3 && state.stepNumber < 6;
    const isLateGame = state.stepNumber >= 6;

    if (isEarlyGame) {
      if (!boardState.centerTaken) {
        return {
          id: 'early_center',
          text: 'Taking the center provides the most winning opportunities.',
          priority: 'high'
        };
      }
      if (boardState.cornersTaken === 0) {
        return {
          id: 'early_corner',
          text: 'Consider taking a corner to maximize your winning chances.',
          priority: 'medium'
        };
      }
    }

    if (isMidGame) {
      if (checkForForkThreat(state)) {
        return {
          id: 'fork_threat',
          text: 'Warning: Opponent may create a fork. Block their strongest position.',
          priority: 'high'
        };
      }
    }

    if (isLateGame) {
      return {
        id: 'endgame',
        text: 'Focus on blocking opponent's winning moves while creating your own.',
        priority: 'medium'
      };
    }

    return null;
  };

  useEffect(() => {
    if (!gameState) return;

    // Generate new tip based on current game state
    const newTip = generateSituationalTip(gameState);
    
    if (newTip && !tipHistory.find(tip => tip.id === newTip.id)) {
      setCurrentTip(newTip);
      setTipHistory(prev => [...prev, newTip]);
    }
  }, [gameState, tipHistory]);

  if (!currentTip) return null;

  return (
    <div className="game-tips">
      <div className={`tip-container priority-${currentTip.priority}`}>
        <div className="tip-icon">💡</div>
        <div className="tip-content">
          <p className="tip-text">{currentTip.text}</p>
          {currentTip.priority === 'high' && (
            <span className="tip-priority">Important Tip!</span>
          )}
        </div>
      </div>
      <div className="tip-history">
        <h4>Previous Tips</h4>
        <ul>
          {tipHistory.slice(-3).map((tip, index) => (
            <li key={index} className={`tip-history-item priority-${tip.priority}`}>
              {tip.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useGameState } from './new12';

// PUBLIC_INTERFACE
export function GameAnalytics() {
  const { state } = useGameState();
  const [analytics, setAnalytics] = useState({
    totalGames: 0,
    playerStats: {
      X: { wins: 0, avgMovesToWin: 0, favoritePositions: Array(9).fill(0) },
      O: { wins: 0, avgMovesToWin: 0, favoritePositions: Array(9).fill(0) }
    },
    gameHistory: [],
    averageGameDuration: 0,
    mostCommonWinningPatterns: {},
    drawPercentage: 0
  });

  useEffect(() => {
    if (state.winner || (!state.winner && !state.history[state.stepNumber].includes(null))) {
      updateAnalytics();
    }
  }, [state.winner, state.history]);

  const updateAnalytics = () => {
    const currentGame = {
      winner: state.winner,
      moves: state.moves,
      duration: calculateGameDuration(state.moves),
      finalBoard: state.history[state.stepNumber]
    };

    const newAnalytics = {
      totalGames: analytics.totalGames + 1,
      playerStats: calculatePlayerStats(analytics.playerStats, currentGame),
      gameHistory: [...analytics.gameHistory, currentGame],
      averageGameDuration: calculateAverageGameDuration([...analytics.gameHistory, currentGame]),
      mostCommonWinningPatterns: updateWinningPatterns(analytics.mostCommonWinningPatterns, currentGame),
      drawPercentage: calculateDrawPercentage([...analytics.gameHistory, currentGame])
    };

    setAnalytics(newAnalytics);
  };

  const calculatePlayerStats = (currentStats, game) => {
    const newStats = { ...currentStats };
    
    if (game.winner) {
      newStats[game.winner].wins++;
      
      // Update average moves to win
      const movesToWin = game.moves.filter(move => move.player === game.winner).length;
      const totalGames = newStats[game.winner].wins;
      newStats[game.winner].avgMovesToWin = 
        (newStats[game.winner].avgMovesToWin * (totalGames - 1) + movesToWin) / totalGames;
    }

    // Update favorite positions
    game.moves.forEach(move => {
      newStats[move.player].favoritePositions[move.position]++;
    });

    return newStats;
  };

  const calculateGameDuration = (moves) => {
    return moves.length;
  };

  const calculateAverageGameDuration = (games) => {
    const totalDuration = games.reduce((sum, game) => sum + game.duration, 0);
    return totalDuration / games.length;
  };

  const updateWinningPatterns = (patterns, game) => {
    if (!game.winner) return patterns;

    const pattern = game.finalBoard.join('');
    return {
      ...patterns,
      [pattern]: (patterns[pattern] || 0) + 1
    };
  };

  const calculateDrawPercentage = (games) => {
    const draws = games.filter(game => !game.winner).length;
    return (draws / games.length) * 100;
  };

  return (
    <div className="game-analytics">
      <h2>Game Analytics</h2>
      <div className="analytics-summary">
        <div className="stat-box">
          <h3>Total Games</h3>
          <p>{analytics.totalGames}</p>
        </div>
        <div className="stat-box">
          <h3>Draw Percentage</h3>
          <p>{analytics.drawPercentage.toFixed(1)}%</p>
        </div>
        <div className="stat-box">
          <h3>Average Game Length</h3>
          <p>{analytics.averageGameDuration.toFixed(1)} moves</p>
        </div>
      </div>
      <div className="player-stats">
        {['X', 'O'].map(player => (
          <div key={player} className="player-stat-box">
            <h3>Player {player}</h3>
            <p>Wins: {analytics.playerStats[player].wins}</p>
            <p>Avg Moves to Win: {analytics.playerStats[player].avgMovesToWin.toFixed(1)}</p>
            <div className="favorite-positions">
              <h4>Favorite Positions</h4>
              <div className="position-grid">
                {analytics.playerStats[player].favoritePositions.map((count, index) => (
                  <div key={index} className="position-cell">
                    {count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

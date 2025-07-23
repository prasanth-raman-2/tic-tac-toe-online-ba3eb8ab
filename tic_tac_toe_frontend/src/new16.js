import React, { useState } from 'react';
import { useGameState } from './new12';

// PUBLIC_INTERFACE
export function GameSettings() {
  const { state, dispatch } = useGameState();
  const [showSettings, setShowSettings] = useState(false);

  const [tempSettings, setTempSettings] = useState({
    player1Name: state.players.X.name,
    player2Name: state.players.O.name,
    gameMode: state.gameMode,
    difficulty: state.difficulty,
    timeLimit: state.timeLimit
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update player names
    dispatch({ 
      type: 'UPDATE_PLAYER', 
      player: 'X', 
      name: tempSettings.player1Name 
    });
    dispatch({ 
      type: 'UPDATE_PLAYER', 
      player: 'O', 
      name: tempSettings.player2Name 
    });

    // Update game mode
    dispatch({ 
      type: 'SET_GAME_MODE', 
      mode: tempSettings.gameMode 
    });

    // Update difficulty if in AI mode
    if (tempSettings.gameMode === 'ai') {
      dispatch({ 
        type: 'SET_DIFFICULTY', 
        difficulty: tempSettings.difficulty 
      });
    }

    // Update time limit
    dispatch({ 
      type: 'SET_TIME_LIMIT', 
      timeLimit: tempSettings.timeLimit 
    });

    // Reset game with new settings
    dispatch({ type: 'RESET_GAME' });
    setShowSettings(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="game-settings">
      <button
        className="settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
      >
        ⚙️ Settings
      </button>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h2>Game Settings</h2>
            <form onSubmit={handleSubmit}>
              <div className="settings-section">
                <h3>Players</h3>
                <div className="setting-field">
                  <label htmlFor="player1Name">Player 1 (X) Name:</label>
                  <input
                    type="text"
                    id="player1Name"
                    name="player1Name"
                    value={tempSettings.player1Name}
                    onChange={handleChange}
                    maxLength={20}
                  />
                </div>
                <div className="setting-field">
                  <label htmlFor="player2Name">Player 2 (O) Name:</label>
                  <input
                    type="text"
                    id="player2Name"
                    name="player2Name"
                    value={tempSettings.player2Name}
                    onChange={handleChange}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3>Game Mode</h3>
                <div className="setting-field">
                  <label htmlFor="gameMode">Select Mode:</label>
                  <select
                    id="gameMode"
                    name="gameMode"
                    value={tempSettings.gameMode}
                    onChange={handleChange}
                  >
                    <option value="local">Local 2-Player</option>
                    <option value="ai">vs AI</option>
                    <option value="online">Online Multiplayer</option>
                  </select>
                </div>

                {tempSettings.gameMode === 'ai' && (
                  <div className="setting-field">
                    <label htmlFor="difficulty">AI Difficulty:</label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={tempSettings.difficulty}
                      onChange={handleChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="settings-section">
                <h3>Game Options</h3>
                <div className="setting-field">
                  <label htmlFor="timeLimit">Time Limit per Move (seconds):</label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={tempSettings.timeLimit || ''}
                    onChange={handleChange}
                    min="0"
                    max="300"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="settings-actions">
                <button type="submit" className="save-settings">
                  Save Settings
                </button>
                <button
                  type="button"
                  className="cancel-settings"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

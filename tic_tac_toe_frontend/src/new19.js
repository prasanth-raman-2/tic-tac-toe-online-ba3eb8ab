import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
export function GameTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('ticTacToeTutorialSeen');
    setHasSeenTutorial(!!tutorialSeen);
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  const tutorialSteps = [
    {
      title: "Welcome to Tic Tac Toe!",
      content: "Learn how to play this classic game in just a few simple steps.",
      image: "board-empty"
    },
    {
      title: "The Game Board",
      content: "The game is played on a 3x3 grid. Players take turns placing their marks (X or O) in empty squares.",
      image: "board-grid"
    },
    {
      title: "Making Moves",
      content: "Click any empty square to place your mark. X always goes first.",
      image: "board-moves"
    },
    {
      title: "Winning the Game",
      content: "Get three of your marks in a row (horizontally, vertically, or diagonally) to win!",
      image: "board-winning"
    },
    {
      title: "Game Modes",
      content: "Play against a friend locally, challenge our AI, or compete online!",
      image: "game-modes"
    }
  ];

  const renderTutorialBoard = (image) => {
    switch (image) {
      case "board-empty":
        return renderEmptyBoard();
      case "board-grid":
        return renderGridBoard();
      case "board-moves":
        return renderMovesBoard();
      case "board-winning":
        return renderWinningBoard();
      case "game-modes":
        return renderGameModes();
      default:
        return null;
    }
  };

  const renderEmptyBoard = () => (
    <div className="tutorial-board empty">
      {Array(9).fill(null).map((_, i) => (
        <div key={i} className="tutorial-square" />
      ))}
    </div>
  );

  const renderGridBoard = () => (
    <div className="tutorial-board grid">
      {Array(9).fill(null).map((_, i) => (
        <div key={i} className="tutorial-square numbered">
          {i + 1}
        </div>
      ))}
    </div>
  );

  const renderMovesBoard = () => (
    <div className="tutorial-board moves">
      {[
        'X', null, 'O',
        null, 'X', null,
        'O', null, null
      ].map((value, i) => (
        <div key={i} className={`tutorial-square ${value ? 'filled' : 'empty'}`}>
          {value}
        </div>
      ))}
    </div>
  );

  const renderWinningBoard = () => (
    <div className="tutorial-board winning">
      {[
        'X', 'O', 'O',
        null, 'X', null,
        null, null, 'X'
      ].map((value, i) => (
        <div key={i} className={`tutorial-square ${value ? 'filled' : 'empty'} ${
          [0, 4, 8].includes(i) ? 'winning-line' : ''
        }`}>
          {value}
        </div>
      ))}
    </div>
  );

  const renderGameModes = () => (
    <div className="tutorial-game-modes">
      <div className="mode-card">
        <h4>Local 2-Player</h4>
        <p>Play with a friend on the same device</p>
      </div>
      <div className="mode-card">
        <h4>VS AI</h4>
        <p>Challenge our AI with different difficulty levels</p>
      </div>
      <div className="mode-card">
        <h4>Online</h4>
        <p>Compete with players worldwide</p>
      </div>
    </div>
  );

  const completeTutorial = () => {
    localStorage.setItem('ticTacToeTutorialSeen', 'true');
    setHasSeenTutorial(true);
    setShowTutorial(false);
  };

  if (!showTutorial) {
    return (
      <button 
        className="tutorial-button"
        onClick={() => setShowTutorial(true)}
      >
        ? Help
      </button>
    );
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <h2>{tutorialSteps[currentStep].title}</h2>
        
        <div className="tutorial-visualization">
          {renderTutorialBoard(tutorialSteps[currentStep].image)}
        </div>
        
        <p>{tutorialSteps[currentStep].content}</p>
        
        <div className="tutorial-navigation">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            ← Previous
          </button>
          
          <div className="tutorial-progress">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          
          {currentStep < tutorialSteps.length - 1 ? (
            <button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next →
            </button>
          ) : (
            <button onClick={completeTutorial}>
              {hasSeenTutorial ? 'Close' : 'Start Playing!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

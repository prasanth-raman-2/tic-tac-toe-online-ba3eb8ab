import React, { useState, useEffect, useCallback } from 'react';

// PUBLIC_INTERFACE
export function GameTimer({ 
  isActive, 
  timeLimit, 
  onTimeUp, 
  currentPlayer,
  moveNumber
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [warningThreshold, setWarningThreshold] = useState(false);
  const [moveStartTime, setMoveStartTime] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateAverageTime = useCallback(() => {
    if (moveHistory.length === 0) return 0;
    const totalTime = moveHistory.reduce((sum, time) => sum + time, 0);
    return totalTime / moveHistory.length;
  }, [moveHistory]);

  useEffect(() => {
    if (isActive && timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            onTimeUp(currentPlayer);
            return 0;
          }
          // Set warning when less than 20% time remains
          setWarningThreshold(prev <= timeLimit * 0.2);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isActive, timeLimit, onTimeUp, currentPlayer]);

  useEffect(() => {
    if (isActive) {
      setMoveStartTime(Date.now());
    } else if (moveStartTime) {
      const moveTime = (Date.now() - moveStartTime) / 1000;
      setMoveHistory(prev => [...prev, moveTime]);
    }
  }, [isActive, moveNumber]);

  // Helper function to determine timer status class
  const getTimerStatusClass = () => {
    if (timeRemaining <= 0) return 'expired';
    if (warningThreshold) return 'warning';
    if (timeRemaining <= timeLimit * 0.5) return 'moderate';
    return 'healthy';
  };

  return (
    <div className="game-timer">
      <div className={`timer-display ${getTimerStatusClass()}`}>
        <div className="time-remaining">
          <span className="timer-label">Time Remaining:</span>
          <span className="timer-value">{formatTime(timeRemaining)}</span>
        </div>
        {warningThreshold && (
          <div className="timer-warning">
            Time is running out!
          </div>
        )}
      </div>
      
      <div className="timer-stats">
        <div className="current-move">
          <span className="stat-label">Current Move:</span>
          <span className="stat-value">
            {moveStartTime ? 
              formatTime(Math.floor((Date.now() - moveStartTime) / 1000)) : 
              '0:00'}
          </span>
        </div>
        
        <div className="average-time">
          <span className="stat-label">Average Move Time:</span>
          <span className="stat-value">
            {formatTime(Math.floor(calculateAverageTime()))}
          </span>
        </div>
        
        <div className="move-history">
          <h4>Recent Moves</h4>
          <div className="move-times">
            {moveHistory.slice(-5).map((time, index) => (
              <div key={index} className="move-time-entry">
                <span className="move-number">Move {moveNumber - 5 + index + 1}:</span>
                <span className="move-duration">{formatTime(Math.floor(time))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export class TimerController {
  constructor(defaultTimeLimit = 30) {
    this.timeLimit = defaultTimeLimit;
    this.timers = {
      game: null,
      move: null,
      inactive: null
    };
    this.callbacks = {
      onTimeUp: () => {},
      onWarning: () => {},
      onTick: () => {}
    };
  }

  setTimeLimit(seconds) {
    this.timeLimit = seconds;
  }

  startTimer(type = 'move') {
    if (this.timers[type]) {
      clearTimeout(this.timers[type]);
    }

    const startTime = Date.now();
    const warningTime = this.timeLimit * 0.2;

    this.timers[type] = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = this.timeLimit - elapsed;

      this.callbacks.onTick(remaining);

      if (remaining <= warningTime) {
        this.callbacks.onWarning(remaining);
      }

      if (remaining <= 0) {
        this.stopTimer(type);
        this.callbacks.onTimeUp(type);
      }
    }, 100);
  }

  stopTimer(type = 'move') {
    if (this.timers[type]) {
      clearTimeout(this.timers[type]);
      this.timers[type] = null;
    }
  }

  pauseTimer(type = 'move') {
    if (this.timers[type]) {
      clearTimeout(this.timers[type]);
      this.timers[type] = null;
    }
  }

  resumeTimer(type = 'move') {
    if (!this.timers[type]) {
      this.startTimer(type);
    }
  }

  setCallback(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  reset() {
    Object.keys(this.timers).forEach(type => {
      this.stopTimer(type);
    });
  }
}

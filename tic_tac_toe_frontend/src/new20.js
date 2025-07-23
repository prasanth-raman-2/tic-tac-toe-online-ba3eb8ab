// PUBLIC_INTERFACE
export class AchievementSystem {
  constructor() {
    this.achievements = new Map([
      ['firstWin', {
        id: 'firstWin',
        title: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        isUnlocked: false
      }],
      ['quickWin', {
        id: 'quickWin',
        title: 'Swift Victory',
        description: 'Win a game in 5 moves or less',
        icon: '⚡',
        isUnlocked: false
      }],
      ['drawMaster', {
        id: 'drawMaster',
        title: 'Draw Master',
        description: 'Play 3 draw games in a row',
        icon: '🤝',
        isUnlocked: false,
        progress: 0,
        requiredProgress: 3
      }],
      ['cornerMaster', {
        id: 'cornerMaster',
        title: 'Corner Master',
        description: 'Win a game using only corner moves',
        icon: '📐',
        isUnlocked: false
      }],
      ['aiChallenger', {
        id: 'aiChallenger',
        title: 'AI Challenger',
        description: 'Win against AI on hard difficulty',
        icon: '🤖',
        isUnlocked: false
      }],
      ['perfectGame', {
        id: 'perfectGame',
        title: 'Perfect Game',
        description: 'Win without letting opponent make more than 2 moves',
        icon: '💯',
        isUnlocked: false
      }],
      ['winStreak', {
        id: 'winStreak',
        title: 'Win Streak',
        description: 'Win 5 games in a row',
        icon: '🔥',
        isUnlocked: false,
        progress: 0,
        requiredProgress: 5
      }],
      ['diagonalMaster', {
        id: 'diagonalMaster',
        title: 'Diagonal Master',
        description: 'Win using a diagonal line 3 times',
        icon: '↗️',
        isUnlocked: false,
        progress: 0,
        requiredProgress: 3
      }],
      ['centerDomination', {
        id: 'centerDomination',
        title: 'Center Domination',
        description: 'Win 10 games where you claimed the center square',
        icon: '⭐',
        isUnlocked: false,
        progress: 0,
        requiredProgress: 10
      }],
      ['grandMaster', {
        id: 'grandMaster',
        title: 'Grand Master',
        description: 'Unlock all other achievements',
        icon: '👑',
        isUnlocked: false
      }]
    ]);

    this.loadAchievements();
  }

  // PUBLIC_INTERFACE
  checkAchievements(gameState) {
    const unlockedAchievements = [];
    
    // Check each achievement condition
    if (this.checkFirstWin(gameState)) {
      unlockedAchievements.push(this.achievements.get('firstWin'));
    }
    
    if (this.checkQuickWin(gameState)) {
      unlockedAchievements.push(this.achievements.get('quickWin'));
    }
    
    if (this.checkDrawMaster(gameState)) {
      unlockedAchievements.push(this.achievements.get('drawMaster'));
    }
    
    if (this.checkCornerMaster(gameState)) {
      unlockedAchievements.push(this.achievements.get('cornerMaster'));
    }
    
    if (this.checkAIChallenger(gameState)) {
      unlockedAchievements.push(this.achievements.get('aiChallenger'));
    }
    
    if (this.checkPerfectGame(gameState)) {
      unlockedAchievements.push(this.achievements.get('perfectGame'));
    }
    
    if (this.checkWinStreak(gameState)) {
      unlockedAchievements.push(this.achievements.get('winStreak'));
    }
    
    if (this.checkDiagonalMaster(gameState)) {
      unlockedAchievements.push(this.achievements.get('diagonalMaster'));
    }
    
    if (this.checkCenterDomination(gameState)) {
      unlockedAchievements.push(this.achievements.get('centerDomination'));
    }
    
    // Check if all achievements are unlocked for Grand Master
    if (this.checkGrandMaster()) {
      unlockedAchievements.push(this.achievements.get('grandMaster'));
    }
    
    this.saveAchievements();
    return unlockedAchievements;
  }

  checkFirstWin(gameState) {
    const achievement = this.achievements.get('firstWin');
    if (!achievement.isUnlocked && gameState.winner) {
      achievement.isUnlocked = true;
      return true;
    }
    return false;
  }

  checkQuickWin(gameState) {
    const achievement = this.achievements.get('quickWin');
    if (!achievement.isUnlocked && 
        gameState.winner && 
        gameState.moves.length <= 5) {
      achievement.isUnlocked = true;
      return true;
    }
    return false;
  }

  checkDrawMaster(gameState) {
    const achievement = this.achievements.get('drawMaster');
    if (!achievement.isUnlocked) {
      if (!gameState.winner && gameState.moves.length === 9) {
        achievement.progress++;
      } else {
        achievement.progress = 0;
      }
      
      if (achievement.progress >= achievement.requiredProgress) {
        achievement.isUnlocked = true;
        return true;
      }
    }
    return false;
  }

  checkCornerMaster(gameState) {
    const achievement = this.achievements.get('cornerMaster');
    if (!achievement.isUnlocked && 
        gameState.winner) {
      const cornerMoves = gameState.moves.filter(move => 
        [0, 2, 6, 8].includes(move.position) &&
        move.player === gameState.winner
      );
      
      if (cornerMoves.length >= 3) {
        achievement.isUnlocked = true;
        return true;
      }
    }
    return false;
  }

  checkAIChallenger(gameState) {
    const achievement = this.achievements.get('aiChallenger');
    if (!achievement.isUnlocked && 
        gameState.winner &&
        gameState.gameMode === 'ai' &&
        gameState.difficulty === 'hard') {
      achievement.isUnlocked = true;
      return true;
    }
    return false;
  }

  checkPerfectGame(gameState) {
    const achievement = this.achievements.get('perfectGame');
    if (!achievement.isUnlocked && 
        gameState.winner) {
      const opponentMoves = gameState.moves.filter(move => 
        move.player !== gameState.winner
      );
      
      if (opponentMoves.length <= 2) {
        achievement.isUnlocked = true;
        return true;
      }
    }
    return false;
  }

  checkWinStreak(gameState) {
    const achievement = this.achievements.get('winStreak');
    if (!achievement.isUnlocked) {
      if (gameState.winner) {
        achievement.progress++;
      } else {
        achievement.progress = 0;
      }
      
      if (achievement.progress >= achievement.requiredProgress) {
        achievement.isUnlocked = true;
        return true;
      }
    }
    return false;
  }

  checkDiagonalMaster(gameState) {
    const achievement = this.achievements.get('diagonalMaster');
    if (!achievement.isUnlocked && 
        gameState.winner &&
        gameState.winningLine &&
        ((gameState.winningLine[0] === 0 && gameState.winningLine[2] === 8) ||
         (gameState.winningLine[0] === 2 && gameState.winningLine[2] === 6))) {
      achievement.progress++;
      
      if (achievement.progress >= achievement.requiredProgress) {
        achievement.isUnlocked = true;
        return true;
      }
    }
    return false;
  }

  checkCenterDomination(gameState) {
    const achievement = this.achievements.get('centerDomination');
    if (!achievement.isUnlocked && 
        gameState.winner) {
      const centerMove = gameState.moves.find(move => 
        move.position === 4 && move.player === gameState.winner
      );
      
      if (centerMove) {
        achievement.progress++;
        
        if (achievement.progress >= achievement.requiredProgress) {
          achievement.isUnlocked = true;
          return true;
        }
      }
    }
    return false;
  }

  checkGrandMaster() {
    const achievement = this.achievements.get('grandMaster');
    if (!achievement.isUnlocked) {
      const allOthersUnlocked = Array.from(this.achievements.values())
        .filter(a => a.id !== 'grandMaster')
        .every(a => a.isUnlocked);
      
      if (allOthersUnlocked) {
        achievement.isUnlocked = true;
        return true;
      }
    }
    return false;
  }

  // PUBLIC_INTERFACE
  getAchievements() {
    return Array.from(this.achievements.values());
  }

  // PUBLIC_INTERFACE
  getUnlockedAchievements() {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.isUnlocked);
  }

  loadAchievements() {
    const savedAchievements = localStorage.getItem('ticTacToeAchievements');
    if (savedAchievements) {
      const parsed = JSON.parse(savedAchievements);
      parsed.forEach(achievement => {
        if (this.achievements.has(achievement.id)) {
          this.achievements.get(achievement.id).isUnlocked = achievement.isUnlocked;
          if (achievement.progress !== undefined) {
            this.achievements.get(achievement.id).progress = achievement.progress;
          }
        }
      });
    }
  }

  saveAchievements() {
    localStorage.setItem('ticTacToeAchievements', 
      JSON.stringify(Array.from(this.achievements.values()))
    );
  }
}

// PUBLIC_INTERFACE
/**
 * Manages player profiles and preferences
 * Handles player data, settings, and customization options
 */
export class PlayerProfileManager {
  constructor() {
    this.profiles = new Map();
    this.defaultSettings = {
      theme: 'light',
      animations: true,
      sound: true,
      notifications: true,
      aiDifficulty: 'medium',
      pieceStyle: 'classic'
    };
  }

  // PUBLIC_INTERFACE
  createProfile(username) {
    if (this.profiles.has(username)) {
      throw new Error('Profile already exists');
    }

    const profile = {
      username,
      created: Date.now(),
      lastActive: Date.now(),
      settings: { ...this.defaultSettings },
      statistics: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 0,
        bestStreak: 0,
        averageGameDuration: 0,
        favoritePositions: Array(9).fill(0),
        winningPatterns: new Set()
      },
      achievements: new Set(),
      gameHistory: []
    };

    this.profiles.set(username, profile);
    this.saveProfiles();
    return profile;
  }

  // PUBLIC_INTERFACE
  updateProfile(username, updates) {
    const profile = this.getProfile(username);
    if (!profile) {
      throw new Error('Profile not found');
    }

    Object.assign(profile, updates);
    profile.lastActive = Date.now();
    
    this.profiles.set(username, profile);
    this.saveProfiles();
    return profile;
  }

  // PUBLIC_INTERFACE
  updateSettings(username, settings) {
    const profile = this.getProfile(username);
    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.settings = {
      ...profile.settings,
      ...settings
    };

    this.profiles.set(username, profile);
    this.saveProfiles();
    return profile.settings;
  }

  // PUBLIC_INTERFACE
  recordGame(username, gameResult) {
    const profile = this.getProfile(username);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const { winner, duration, moves } = gameResult;
    const stats = profile.statistics;
    
    stats.gamesPlayed++;
    
    if (winner === username) {
      stats.wins++;
      stats.streak++;
      stats.bestStreak = Math.max(stats.streak, stats.bestStreak);
    } else if (winner === null) {
      stats.draws++;
      stats.streak = 0;
    } else {
      stats.losses++;
      stats.streak = 0;
    }

    // Update average game duration
    stats.averageGameDuration = 
      (stats.averageGameDuration * (stats.gamesPlayed - 1) + duration) / 
      stats.gamesPlayed;

    // Record move positions
    moves.forEach(move => {
      if (move.player === username) {
        stats.favoritePositions[move.position]++;
      }
    });

    // Record game in history
    profile.gameHistory.push({
      timestamp: Date.now(),
      result: winner === username ? 'win' : winner === null ? 'draw' : 'loss',
      duration,
      moves
    });

    // Keep only last 50 games
    if (profile.gameHistory.length > 50) {
      profile.gameHistory.shift();
    }

    this.profiles.set(username, profile);
    this.saveProfiles();
    return profile;
  }

  // PUBLIC_INTERFACE
  addAchievement(username, achievement) {
    const profile = this.getProfile(username);
    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.achievements.add(achievement);
    this.profiles.set(username, profile);
    this.saveProfiles();
    return Array.from(profile.achievements);
  }

  getProfile(username) {
    return this.profiles.get(username);
  }

  // PUBLIC_INTERFACE
  getAllProfiles() {
    return Array.from(this.profiles.values());
  }

  // PUBLIC_INTERFACE
  deleteProfile(username) {
    const deleted = this.profiles.delete(username);
    if (deleted) {
      this.saveProfiles();
    }
    return deleted;
  }

  saveProfiles() {
    try {
      const data = JSON.stringify(Array.from(this.profiles.entries()));
      localStorage.setItem('ticTacToeProfiles', data);
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  }

  loadProfiles() {
    try {
      const data = localStorage.getItem('ticTacToeProfiles');
      if (data) {
        this.profiles = new Map(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }
}

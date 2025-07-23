// PUBLIC_INTERFACE
export class GameLogger {
  constructor() {
    this.logs = [];
    this.debugMode = false;
    this.logLevel = 'info';
    this.logCategories = new Set(['game', 'move', 'error', 'performance']);
    this.maxLogs = 1000;
    this.subscribers = new Set();
  }

  // PUBLIC_INTERFACE
  setLogLevel(level) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (validLevels.includes(level)) {
      this.logLevel = level;
      return true;
    }
    return false;
  }

  // PUBLIC_INTERFACE
  enableDebugMode() {
    this.debugMode = true;
    this.log('debug', 'system', 'Debug mode enabled');
  }

  // PUBLIC_INTERFACE
  disableDebugMode() {
    this.debugMode = false;
    this.log('debug', 'system', 'Debug mode disabled');
  }

  // PUBLIC_INTERFACE
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // PUBLIC_INTERFACE
  log(level, category, message, data = null) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    const levelIndex = validLevels.indexOf(level);
    const currentLevelIndex = validLevels.indexOf(this.logLevel);

    if (levelIndex >= currentLevelIndex && this.logCategories.has(category)) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data: this.debugMode ? data : null
      };

      this.logs.push(logEntry);
      this.notifySubscribers(logEntry);
      this.trimLogs();

      if (this.debugMode || level === 'error') {
        console.log(`[${level.toUpperCase()}][${category}] ${message}`, data || '');
      }
    }
  }

  notifySubscribers(logEntry) {
    this.subscribers.forEach(callback => {
      try {
        callback(logEntry);
      } catch (error) {
        console.error('Error in log subscriber:', error);
      }
    });
  }

  trimLogs() {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // PUBLIC_INTERFACE
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  // PUBLIC_INTERFACE
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  // PUBLIC_INTERFACE
  getLogsBetweenDates(startDate, endDate) {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // PUBLIC_INTERFACE
  exportLogs(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      
      case 'csv':
        const headers = ['timestamp', 'level', 'category', 'message'];
        const rows = this.logs.map(log => [
          log.timestamp,
          log.level,
          log.category,
          log.message
        ]);
        return [headers, ...rows]
          .map(row => row.join(','))
          .join('\n');
      
      case 'text':
        return this.logs
          .map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.category}]: ${log.message}`)
          .join('\n');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // PUBLIC_INTERFACE
  analyzeGamePerformance() {
    const gameLogs = this.getLogsByCategory('game');
    const moveLogs = this.getLogsByCategory('move');
    const errorLogs = this.getLogsByCategory('error');

    return {
      totalGames: gameLogs.filter(log => log.message.includes('Game started')).length,
      averageMovesPerGame: moveLogs.length / (gameLogs.length || 1),
      errorRate: errorLogs.length / (gameLogs.length || 1),
      timeDistribution: this.analyzeTimeDistribution(moveLogs),
      commonErrors: this.analyzeCommonErrors(errorLogs)
    };
  }

  analyzeTimeDistribution(moveLogs) {
    const moveTimes = moveLogs
      .filter(log => log.data && log.data.duration)
      .map(log => log.data.duration);

    if (moveTimes.length === 0) return null;

    return {
      min: Math.min(...moveTimes),
      max: Math.max(...moveTimes),
      average: moveTimes.reduce((sum, time) => sum + time, 0) / moveTimes.length,
      median: this.calculateMedian(moveTimes)
    };
  }

  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  analyzeCommonErrors(errorLogs) {
    const errorCounts = new Map();
    errorLogs.forEach(log => {
      const count = errorCounts.get(log.message) || 0;
      errorCounts.set(log.message, count + 1);
    });

    return Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
  }

  // PUBLIC_INTERFACE
  clearLogs() {
    this.logs = [];
    this.log('info', 'system', 'Logs cleared');
  }
}

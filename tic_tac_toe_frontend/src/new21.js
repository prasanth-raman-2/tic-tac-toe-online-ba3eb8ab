import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// PUBLIC_INTERFACE
export function useTheme() {
  return useContext(ThemeContext);
}

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState({
    mode: 'light',
    colors: {
      primary: '#1976d2',
      secondary: '#424242',
      accent: '#fbc02d',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#282c34',
      border: '#e9ecef'
    },
    animations: {
      enabled: true,
      speed: 'normal'
    },
    pieces: {
      X: {
        style: 'classic', // classic, minimal, custom
        color: '#1976d2',
        customSvg: null
      },
      O: {
        style: 'classic',
        color: '#424242',
        customSvg: null
      }
    },
    board: {
      style: 'classic', // classic, minimal, grid, custom
      backgroundColor: '#f8f9fa',
      gridColor: '#e9ecef',
      borderRadius: '8px',
      shadow: true
    },
    fonts: {
      main: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      heading: 'inherit'
    }
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('ticTacToeTheme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
    updateCSSVariables(theme);
    localStorage.setItem('ticTacToeTheme', JSON.stringify(theme));
  }, [theme]);

  const updateCSSVariables = (theme) => {
    const root = document.documentElement;
    
    // Set theme colors
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--surface', theme.colors.surface);
    root.style.setProperty('--text', theme.colors.text);
    root.style.setProperty('--border', theme.colors.border);
    
    // Set animation properties
    root.style.setProperty('--transition-speed', 
      theme.animations.speed === 'fast' ? '0.2s' :
      theme.animations.speed === 'slow' ? '0.4s' : '0.3s'
    );
    
    // Set board properties
    root.style.setProperty('--board-radius', theme.board.borderRadius);
    root.style.setProperty('--board-background', theme.board.backgroundColor);
    root.style.setProperty('--board-grid-color', theme.board.gridColor);
    root.style.setProperty('--board-shadow', 
      theme.board.shadow ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
    );
    
    // Set piece colors
    root.style.setProperty('--piece-x-color', theme.pieces.X.color);
    root.style.setProperty('--piece-o-color', theme.pieces.O.color);
    
    // Set fonts
    root.style.setProperty('--font-main', theme.fonts.main);
    root.style.setProperty('--font-heading', theme.fonts.heading);
  };

  const toggleThemeMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
      colors: prev.mode === 'light' ? {
        primary: '#90caf9',
        secondary: '#a0a0a0',
        accent: '#ffd54f',
        background: '#1a1a1a',
        surface: '#282c34',
        text: '#ffffff',
        border: '#404040'
      } : {
        primary: '#1976d2',
        secondary: '#424242',
        accent: '#fbc02d',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#282c34',
        border: '#e9ecef'
      }
    }));
  };

  const updatePieceStyle = (piece, style) => {
    setTheme(prev => ({
      ...prev,
      pieces: {
        ...prev.pieces,
        [piece]: {
          ...prev.pieces[piece],
          style
        }
      }
    }));
  };

  const updatePieceColor = (piece, color) => {
    setTheme(prev => ({
      ...prev,
      pieces: {
        ...prev.pieces,
        [piece]: {
          ...prev.pieces[piece],
          color
        }
      }
    }));
  };

  const updateBoardStyle = (style) => {
    setTheme(prev => ({
      ...prev,
      board: {
        ...prev.board,
        style
      }
    }));
  };

  const toggleAnimations = () => {
    setTheme(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        enabled: !prev.animations.enabled
      }
    }));
  };

  const updateAnimationSpeed = (speed) => {
    setTheme(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        speed
      }
    }));
  };

  const value = {
    theme,
    toggleThemeMode,
    updatePieceStyle,
    updatePieceColor,
    updateBoardStyle,
    toggleAnimations,
    updateAnimationSpeed
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function PieceRenderer({ type, customStyle }) {
  const { theme } = useTheme();
  const pieceStyle = theme.pieces[type];

  if (!theme.animations.enabled) {
    return (
      <div className={`piece ${type.toLowerCase()}`}>
        {type}
      </div>
    );
  }

  switch (pieceStyle.style) {
    case 'minimal':
      return (
        <div 
          className={`piece ${type.toLowerCase()} minimal`}
          style={{ color: pieceStyle.color, ...customStyle }}
        >
          {type}
        </div>
      );
    
    case 'custom':
      return pieceStyle.customSvg ? (
        <div 
          className={`piece ${type.toLowerCase()} custom`}
          dangerouslySetInnerHTML={{ __html: pieceStyle.customSvg }}
          style={customStyle}
        />
      ) : (
        <div className={`piece ${type.toLowerCase()}`}>
          {type}
        </div>
      );
    
    default: // classic
      return (
        <div 
          className={`piece ${type.toLowerCase()} classic`}
          style={{ color: pieceStyle.color, ...customStyle }}
        >
          {type}
        </div>
      );
  }
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  dark: {
    name: 'dark',
    colors: {
      primary: '#ff6b35',
      secondary: '#ffa500',
      background: '#0f0f0f',
      surface: '#1a1a1a',
      surfaceHover: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      textMuted: '#666666',
      border: '#333333',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
      large: '0 8px 16px rgba(0, 0, 0, 0.5)'
    }
  },
  light: {
    name: 'light',
    colors: {
      primary: '#ff6b35',
      secondary: '#ff8c42',
      background: '#ffffff',
      surface: '#f8f9fa',
      surfaceHover: '#e9ecef',
      text: '#212529',
      textSecondary: '#495057',
      textMuted: '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      overlay: 'rgba(255, 255, 255, 0.9)'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
      large: '0 8px 16px rgba(0, 0, 0, 0.2)'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('blazerate-theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('blazerate-theme', currentTheme);
    // Update CSS custom properties for global styling
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme: themes[currentTheme],
    currentTheme,
    toggleTheme,
    isDark: currentTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
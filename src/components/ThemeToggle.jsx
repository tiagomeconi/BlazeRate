import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

const ToggleButton = styled.button`
  background: transparent;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  padding: 0.45rem;
  color: ${p => p.theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.theme.colors.surfaceHover};
    border-color: ${p => p.theme.colors.primary};
  }
`;

const ThemeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} theme={theme} aria-label="Alternar tema">
      <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={20} />
    </ToggleButton>
  );
};

export default ThemeToggle;

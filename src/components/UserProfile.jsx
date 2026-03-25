import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { logout } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProfileContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.primary};
  object-fit: cover;
`;

const UserName = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.large}, 0 16px 48px rgba(0,0,0,0.25);
  min-width: 210px;
  z-index: 1000;
  overflow: hidden;
  margin-top: 0.6rem;
  transform-origin: top right;
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.18s ease;

  opacity: ${props => props.$open ? 1 : 0};
  transform: ${props => props.$open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)'};
  visibility: ${props => props.$open ? 'visible' : 'hidden'};
  pointer-events: ${props => props.$open ? 'all' : 'none'};
`;

const DropdownLink = styled(Link)`
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  text-align: left;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover { background: ${props => props.theme.colors.surfaceHover}; }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
  
  &.danger {
    color: ${props => props.theme.colors.error};
  }
`;

const UserInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const UserEmail = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ThemeToggle = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const UserProfile = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('[data-profile-container]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  if (!currentUser) return null;

  return (
    <ProfileContainer data-profile-container>
      <ProfileButton onClick={toggleDropdown} theme={theme}>
        <Avatar 
          src={currentUser.photoURL || '/placeholder-avatar.svg'} 
          alt={currentUser.displayName || 'User'}
          theme={theme}
        />
        <UserName theme={theme}>
          {currentUser.displayName || 'Usuário'}
        </UserName>
      </ProfileButton>
      
      <DropdownMenu $open={isDropdownOpen} theme={theme}>
        <UserInfo theme={theme}>
          <div style={{ fontWeight: '500' }}>
            {currentUser.displayName || 'Usuário'}
          </div>
          <UserEmail theme={theme}>
            {currentUser.email}
          </UserEmail>
        </UserInfo>
        
        <DropdownLink to="/profile" theme={theme} onClick={() => setIsDropdownOpen(false)}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>manage_accounts</span>
          Configurações
        </DropdownLink>

        <ThemeToggle onClick={toggleTheme} theme={theme}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </ThemeToggle>

        <DropdownItem
          onClick={handleLogout}
          className="danger"
          theme={theme}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16, marginRight: '0.4rem' }}>logout</span>
          Sair
        </DropdownItem>
      </DropdownMenu>
    </ProfileContainer>
  );
};

export default UserProfile;
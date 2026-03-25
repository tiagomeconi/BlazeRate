import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserProfile from './UserProfile';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const HeaderContainer = styled.header`
  background: ${p => p.theme.name === 'dark'
    ? p.$scrolled ? 'rgba(15, 15, 15, 0.85)' : 'rgba(15, 15, 15, 0.45)'
    : p.$scrolled ? 'rgba(248, 249, 250, 0.88)' : 'rgba(248, 249, 250, 0.55)'};
  backdrop-filter: blur(${p => p.$scrolled ? '18px' : '10px'});
  -webkit-backdrop-filter: blur(${p => p.$scrolled ? '18px' : '10px'});
  border-bottom: 1px solid ${p => p.theme.name === 'dark'
    ? p.$scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'
    : p.$scrolled ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.05)'};
  box-shadow: ${p => p.$scrolled ? p.theme.shadows.medium : 'none'};
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 200;
  transition: background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;

  @media (max-width: 768px) { padding: 0 1rem; }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  gap: 1rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 52px;
  width: auto;
  object-fit: contain;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) { display: none; }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: ${p => p.$active ? '18px' : '0'};
    height: 2px;
    background: ${p => p.theme.colors.primary};
    border-radius: 2px;
    transition: width 0.2s ease;
  }

  &:hover {
    color: ${p => p.theme.colors.text};
    background: ${p => p.theme.colors.surfaceHover};
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background: ${p => p.theme.colors.background};
  border: 1.5px solid ${p => p.$focused ? p.theme.colors.primary : p.theme.colors.border};
  border-radius: 24px;
  padding: 0 0.75rem;
  gap: 0.4rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: ${p => p.$focused ? `0 0 0 3px ${p.theme.colors.primary}22` : 'none'};
  flex: 1;
  max-width: 360px;

  @media (max-width: 900px) { max-width: 240px; }
  @media (max-width: 768px) { display: none; }
`;

const SearchIconWrap = styled.span`
  color: ${p => p.theme.colors.textMuted};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${p => p.theme.colors.text};
  font-size: 0.875rem;
  padding: 0.5rem 0;
  width: 100%;

  &::placeholder { color: ${p => p.theme.colors.textMuted}; }
`;

const ClearBtn = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.colors.textMuted};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.2s;
  &:hover { color: ${p => p.theme.colors.text}; }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const LoginButton = styled.button`
  background: transparent;
  color: ${p => p.theme.colors.primary};
  border: 1.5px solid ${p => p.theme.colors.primary}88;
  border-radius: 50px;
  padding: 0.45rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
  letter-spacing: 0.2px;

  &:hover {
    background: ${p => p.theme.colors.primary};
    color: #fff;
    border-color: ${p => p.theme.colors.primary};
    box-shadow: 0 4px 16px ${p => p.theme.colors.primary}33;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  color: ${p => p.theme.colors.text};
  transition: background 0.2s ease;
  align-items: center;
  justify-content: center;

  &:hover { background: ${p => p.theme.colors.surfaceHover}; }

  @media (max-width: 768px) { display: flex; }
`;

const MobileDrawer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${p => p.$open ? 'flex' : 'none'};
    flex-direction: column;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: ${p => p.theme.colors.surface};
    border-bottom: 1px solid ${p => p.theme.colors.border};
    box-shadow: ${p => p.theme.shadows.large};
    padding: 1rem;
    gap: 0.5rem;
    z-index: 199;
    animation: ${slideDown} 0.2s ease;
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: ${p => p.$active ? `${p.theme.colors.primary}15` : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.theme.colors.surfaceHover};
    color: ${p => p.theme.colors.text};
  }
`;

const MobileSearchForm = styled.form`
  display: flex;
  align-items: center;
  background: ${p => p.theme.colors.background};
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: 12px;
  padding: 0 0.75rem;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const MobileSearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${p => p.theme.colors.text};
  font-size: 0.9rem;
  padding: 0.65rem 0;
  width: 100%;
  &::placeholder { color: ${p => p.theme.colors.textMuted}; }
`;

const MobileSearchBtn = styled.button`
  background: transparent;
  border: none;
  color: ${p => p.theme.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
  &:hover { color: ${p => p.theme.colors.primary}; }
`;

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const inputRef = useRef(null);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchTerm('');
      inputRef.current?.blur();
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    const q = mobileSearch.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setMobileSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <>
      <HeaderContainer theme={theme} $scrolled={scrolled}>
        <Nav>
          <Logo to="/">
            <LogoImg src="/Blaze-Rate-Logo.png" alt="BlazeRate" />
          </Logo>

          <NavLinks>
            <NavLink to="/" theme={theme} $active={isActive('/')}>Início</NavLink>
            <NavLink to="/series" theme={theme} $active={isActive('/series')}>Séries</NavLink>
            <NavLink to="/movies" theme={theme} $active={isActive('/movies')}>Filmes</NavLink>
            <NavLink to="/trending" theme={theme} $active={isActive('/trending')}>Bombando</NavLink>
            <NavLink to="/favorites" theme={theme} $active={isActive('/favorites')}>Minha lista</NavLink>
          </NavLinks>

          <SearchForm onSubmit={handleSearch} theme={theme} $focused={searchFocused}>
            <SearchInput
              ref={inputRef}
              type="text"
              placeholder="Buscar filmes e séries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              theme={theme}
            />
            {searchTerm && (
              <ClearBtn type="button" theme={theme} onClick={() => setSearchTerm('')}>
                <Icon name="close" size={16} />
              </ClearBtn>
            )}
          </SearchForm>

          <Actions>
            <ThemeToggle />
            {currentUser ? (
              <UserProfile />
            ) : (
              <LoginButton as={Link} to="/login" theme={theme}>
                Entrar
              </LoginButton>
            )}
            <HamburgerButton theme={theme} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </HamburgerButton>
          </Actions>
        </Nav>
      </HeaderContainer>

      <MobileDrawer $open={menuOpen} theme={theme}>
        <MobileNavLink to="/" theme={theme} $active={isActive('/')} onClick={() => setMenuOpen(false)}>Início</MobileNavLink>
        <MobileNavLink to="/series" theme={theme} $active={isActive('/series')} onClick={() => setMenuOpen(false)}>Séries</MobileNavLink>
        <MobileNavLink to="/movies" theme={theme} $active={isActive('/movies')} onClick={() => setMenuOpen(false)}>Filmes</MobileNavLink>
        <MobileNavLink to="/trending" theme={theme} $active={isActive('/trending')} onClick={() => setMenuOpen(false)}>Bombando</MobileNavLink>
        <MobileNavLink to="/favorites" theme={theme} $active={isActive('/favorites')} onClick={() => setMenuOpen(false)}>Minha lista</MobileNavLink>

        <MobileSearchForm onSubmit={handleMobileSearch} theme={theme}>
          <MobileSearchInput
            type="text"
            placeholder="Buscar filmes e séries..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            theme={theme}
          />
          <MobileSearchBtn type="submit" theme={theme}>
            <Icon name="search" size={20} />
          </MobileSearchBtn>
        </MobileSearchForm>
      </MobileDrawer>

    </>
  );
};

export default Header;

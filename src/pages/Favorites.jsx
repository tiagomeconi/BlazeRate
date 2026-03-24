import React, { useState } from 'react';
import styled from 'styled-components';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../contexts/ThemeContext';
import MovieCard from '../components/MovieCard';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  min-width: 150px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ClearButton = styled.button`
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  
  &:hover {
    background: #c82333;
  }
`;

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  color: ${props => props.theme.colors.textMuted};
`;

const EmptyTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const EmptyDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
`;

const Favorites = () => {
  const { favorites, watched, clearFavorites, clearWatched } = useFavorites();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('favorites');
  const [typeFilter, setTypeFilter] = useState('all'); // all, movie, tv
  const [sortBy, setSortBy] = useState('recent'); // recent, title, rating

  const getCurrentList = () => {
    return activeTab === 'favorites' ? favorites : watched;
  };

  const getFilteredAndSortedList = () => {
    let list = getCurrentList();
    
    // Filtrar por tipo
    if (typeFilter !== 'all') {
      list = list.filter(item => item.media_type === typeFilter);
    }
    
    // Ordenar
    switch (sortBy) {
      case 'title':
        list = [...list].sort((a, b) => {
          const titleA = (a.title || a.name || '').toLowerCase();
          const titleB = (b.title || b.name || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'rating':
        list = [...list].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'recent':
      default:
        list = [...list].sort((a, b) => {
          const dateA = new Date(a.added_at || a.watched_at || 0);
          const dateB = new Date(b.added_at || b.watched_at || 0);
          return dateB - dateA;
        });
    }
    
    return list;
  };

  const handleClearList = () => {
    const confirmMessage = activeTab === 'favorites' 
      ? 'Tem certeza que deseja limpar todos os favoritos?'
      : 'Tem certeza que deseja limpar toda a lista de assistidos?';
      
    if (window.confirm(confirmMessage)) {
      if (activeTab === 'favorites') {
        clearFavorites();
      } else {
        clearWatched();
      }
    }
  };

  const filteredList = getFilteredAndSortedList();
  
  const stats = {
    totalFavorites: favorites.length,
    totalWatched: watched.length,
    favoriteMovies: favorites.filter(item => item.media_type === 'movie').length,
    favoriteTVShows: favorites.filter(item => item.media_type === 'tv').length,
    watchedMovies: watched.filter(item => item.media_type === 'movie').length,
    watchedTVShows: watched.filter(item => item.media_type === 'tv').length
  };

  return (
    <Container theme={theme}>
      <Content>
        <Header>
          <Title theme={theme}>Minha Coleção</Title>
        </Header>

        <StatsContainer>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{stats.totalFavorites}</StatNumber>
            <StatLabel theme={theme}>Favoritos</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{stats.totalWatched}</StatNumber>
            <StatLabel theme={theme}>Assistidos</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{stats.favoriteMovies + stats.watchedMovies}</StatNumber>
            <StatLabel theme={theme}>Filmes</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatNumber theme={theme}>{stats.favoriteTVShows + stats.watchedTVShows}</StatNumber>
            <StatLabel theme={theme}>Séries</StatLabel>
          </StatCard>
        </StatsContainer>

        <TabsContainer theme={theme}>
          <Tab
            theme={theme}
            active={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1", verticalAlign: 'middle', marginRight: 6 }}>favorite</span>
            Favoritos ({stats.totalFavorites})
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'watched'}
            onClick={() => setActiveTab('watched')}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1", verticalAlign: 'middle', marginRight: 6 }}>check_circle</span>
            Assistidos ({stats.totalWatched})
          </Tab>
        </TabsContainer>

        {getCurrentList().length > 0 && (
          <FiltersContainer>
            <FilterSelect 
              theme={theme}
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              <option value="movie">Filmes</option>
              <option value="tv">Séries</option>
            </FilterSelect>
            
            <FilterSelect 
              theme={theme}
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Mais recentes</option>
              <option value="title">Título (A-Z)</option>
              <option value="rating">Melhor avaliados</option>
            </FilterSelect>
            
            <ClearButton onClick={handleClearList}>
              Limpar {activeTab === 'favorites' ? 'Favoritos' : 'Assistidos'}
            </ClearButton>
          </FiltersContainer>
        )}

        {filteredList.length > 0 ? (
          <MoviesGrid>
            {filteredList.map((item, index) => (
              <MovieCard 
                key={`${item.id}-${item.media_type}-${index}`} 
                movie={item} 
                type={item.media_type}
              />
            ))}
          </MoviesGrid>
        ) : (
          <EmptyState theme={theme}>
            <EmptyIcon theme={theme}>
              <span className="material-symbols-rounded" style={{ fontSize: 64, color: 'inherit' }}>
                {activeTab === 'favorites' ? 'heart_broken' : 'tv'}
              </span>
            </EmptyIcon>
            <EmptyTitle theme={theme}>
              {getCurrentList().length === 0 
                ? `Nenhum ${activeTab === 'favorites' ? 'favorito' : 'assistido'} ainda`
                : 'Nenhum resultado encontrado'
              }
            </EmptyTitle>
            <EmptyDescription>
              {getCurrentList().length === 0 
                ? `Comece explorando filmes e séries e ${activeTab === 'favorites' ? 'adicione aos favoritos' : 'marque como assistido'} os que mais gostar!`
                : 'Tente ajustar os filtros para ver mais resultados.'
              }
            </EmptyDescription>
          </EmptyState>
        )}
      </Content>
    </Container>
  );
};

export default Favorites;
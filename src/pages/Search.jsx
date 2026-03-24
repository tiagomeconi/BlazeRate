import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { tmdbApi } from '../services/tmdbApi';
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

const SearchHeader = styled.div`
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const SearchInfo = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.cardBackground};
  color: ${props => props.active ? props.theme.colors.text : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryHover : props.theme.colors.cardHover};
    color: ${props => props.theme.colors.text};
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const NoResultsTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  padding: 2rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  margin: 1rem 0;
`;

const LoadMoreButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text};
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin: 2rem auto;
  display: block;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.border};
    cursor: not-allowed;
  }
`;

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, movie, tv
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { theme } = useTheme();

  const searchContent = async (searchQuery, currentPage = 1, currentFilter = 'all', append = false) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      switch (currentFilter) {
        case 'movie':
          response = await tmdbApi.searchMovies(searchQuery);
          break;
        case 'tv':
          response = await tmdbApi.searchTVShows(searchQuery);
          break;
        default:
          response = await tmdbApi.searchMulti(searchQuery);
      }
      
      const newResults = response.data.results.filter(item => 
        item.media_type !== 'person' && (item.poster_path || item.backdrop_path)
      );
      
      if (append) {
        setResults(prev => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }
      
      setTotalPages(response.data.total_pages);
      setHasMore(currentPage < response.data.total_pages);
      
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setPage(1);
      searchContent(query, 1, filter);
    }
  }, [query, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchContent(query, nextPage, filter, true);
  };

  const getMediaType = (item) => {
    if (item.media_type) return item.media_type;
    return item.title ? 'movie' : 'tv';
  };

  if (!query) {
    return (
      <Container theme={theme}>
        <Content>
          <SearchHeader>
            <SearchTitle theme={theme}>Buscar</SearchTitle>
            <SearchInfo theme={theme}>Use a barra de pesquisa para encontrar filmes e séries.</SearchInfo>
          </SearchHeader>
        </Content>
      </Container>
    );
  }

  return (
    <Container theme={theme}>
      <Content>
        <SearchHeader>
          <SearchTitle theme={theme}>Resultados para "{query}"</SearchTitle>
          <SearchInfo theme={theme}>
            {results.length > 0 ? `${results.length} resultado(s) encontrado(s)` : ''}
          </SearchInfo>
        </SearchHeader>

        <FiltersContainer>
          <FilterButton 
            theme={theme}
            active={filter === 'all'} 
            onClick={() => handleFilterChange('all')}
          >
            Todos
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={filter === 'movie'} 
            onClick={() => handleFilterChange('movie')}
          >
            Filmes
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={filter === 'tv'} 
            onClick={() => handleFilterChange('tv')}
          >
            Séries
          </FilterButton>
        </FiltersContainer>

        {loading && page === 1 && (
          <LoadingContainer theme={theme}>
            Buscando...
          </LoadingContainer>
        )}

        {error && (
          <ErrorMessage theme={theme}>{error}</ErrorMessage>
        )}

        {!loading && !error && results.length === 0 && (
          <NoResults theme={theme}>
            <NoResultsTitle theme={theme}>Nenhum resultado encontrado</NoResultsTitle>
            <p>Tente buscar com termos diferentes ou verifique a ortografia.</p>
          </NoResults>
        )}

        {results.length > 0 && (
          <>
            <ResultsGrid>
              {results.map((item, index) => (
                <MovieCard 
                  key={`${item.id}-${index}`} 
                  movie={item} 
                  type={getMediaType(item)}
                />
              ))}
            </ResultsGrid>

            {hasMore && (
              <LoadMoreButton 
                theme={theme}
                onClick={loadMore} 
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </LoadMoreButton>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default Search;
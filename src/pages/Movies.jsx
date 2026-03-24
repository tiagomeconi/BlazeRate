import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { tmdbApi } from '../services/tmdbApi';
import { useTheme } from '../contexts/ThemeContext';
import MovieCard from '../components/MovieCard';

const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.colors.background};
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2.5rem 4rem;

  @media (max-width: 768px) { padding: 1.5rem 1.25rem 3rem; }
`;

const PageHeader = styled.div`
  margin-bottom: 2.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${p => p.theme.colors.text};
  margin: 0 0 0.4rem;
`;

const PageSubtitle = styled.p`
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.95rem;
  margin: 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 0.45rem 1.1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p => p.$active ? p.theme.colors.primary : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme.colors.textSecondary};
  border: 1.5px solid ${p => p.$active ? p.theme.colors.primary : p.theme.colors.border};

  &:hover {
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.$active ? '#fff' : p.theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
  }
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2.5px solid ${p => p.theme.colors.border};
  border-top-color: ${p => p.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 4rem auto;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const TABS = [
  { label: 'Populares',     fetch: () => tmdbApi.getPopularMovies() },
  { label: 'Mais Avaliados', fetch: () => tmdbApi.getTopRatedMovies() },
  { label: 'Em Cartaz',    fetch: () => tmdbApi.getNowPlayingMovies() },
];

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await TABS[activeTab].fetch();
        setMovies(res.data.results || []);
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  return (
    <Page theme={theme}>
      <Inner>
      <PageHeader>
        <PageTitle theme={theme}>Filmes</PageTitle>
        <PageSubtitle theme={theme}>Explore os melhores filmes do momento</PageSubtitle>
      </PageHeader>

      <Tabs>
        {TABS.map((t, i) => (
          <Tab key={i} theme={theme} $active={activeTab === i} onClick={() => setActiveTab(i)}>
            {t.label}
          </Tab>
        ))}
      </Tabs>

      {loading ? (
        <Spinner theme={theme} />
      ) : (
        <Grid>
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} type="movie" />
          ))}
        </Grid>
      )}
      </Inner>
    </Page>
  );
};

export default Movies;

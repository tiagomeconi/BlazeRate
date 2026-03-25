import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { tmdbApi, getImageUrl, getBackdropUrl } from '../services/tmdbApi';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../contexts/ThemeContext';
import MovieCard from '../components/MovieCard';

/* ── animations ─────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── page ────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.colors.background};
`;

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
const HeroSection = styled.div`
  position: relative;
  height: 68vh;
  min-height: 440px;
  overflow: hidden;
`;

const HeroBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${p => p.src});
  background-size: cover;
  background-position: center 20%;
  opacity: ${p => p.$fading ? 0 : 1};
  transition: opacity 0.4s ease;
`;

const HeroGradient = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, ${p => p.theme.colors.background} 0%, transparent 60%),
    linear-gradient(to top,   ${p => p.theme.colors.background} 0%, transparent 55%);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;

  @media (max-width: 768px) {
    padding: 0 1.25rem;
    justify-content: flex-end;
    padding-bottom: 2.5rem;
  }
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  opacity: ${p => p.$fading ? 0 : 1};
  transition: opacity 0.35s ease;
`;

const HeroGenre = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const HeroMetaDot = styled.span`
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.6rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 1rem;
  line-height: 1.1;
  letter-spacing: -0.5px;
  max-width: 540px;
  opacity: ${p => p.$fading ? 0 : 1};
  transition: opacity 0.35s ease;
`;

const HeroOverview = styled.p`
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.95rem;
  line-height: 1.65;
  max-width: 480px;
  margin: 0 0 1.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: ${p => p.$fading ? 0 : 1};
  transition: opacity 0.35s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  opacity: ${p => p.$fading ? 0 : 1};
  transition: opacity 0.35s ease;
`;

const HeroPrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.5rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  letter-spacing: 0.2px;

  &:hover {
    background: ${p => p.theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${p => p.theme.colors.primary}55;
  }
`;

const HeroSecondaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

/* dots */
const HeroDots = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.4rem;
  z-index: 3;
`;

const Dot = styled.button`
  width: ${p => p.$active ? '20px' : '6px'};
  height: 6px;
  border-radius: 3px;
  border: none;
  background: ${p => p.$active ? p.theme.colors.primary : 'rgba(255,255,255,0.35)'};
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
`;

/* hero rating pill */
const HeroRating = styled.div`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 0.2rem 0.65rem;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
`;

/* ══════════════════════════════════════════════════════════
   SECTIONS
══════════════════════════════════════════════════════════ */
const Sections = styled.div`
  padding: 3rem 0 4rem;
`;

const Section = styled.section`
  margin-bottom: 0;
  padding: 2rem 0;
  border-top: 1px solid ${p => p.theme.colors.border}55;

  &:first-child { border-top: none; }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  margin-bottom: 1.1rem;

  @media (max-width: 768px) { padding: 0 1.25rem; }
`;

const SectionTitle = styled.h2`
  color: ${p => p.theme.colors.text};
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    border-radius: 2px;
    background: ${p => p.theme.colors.primary};
    flex-shrink: 0;
  }
`;

const SectionRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const ViewAll = styled(Link)`
  color: ${p => p.theme.colors.primary};
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  opacity: 0.85;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const ArrowBtn = styled.button`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${p => p.theme.colors.text};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.colors.surfaceHover};
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const ScrollRow = styled.div`
  display: flex;
  gap: 0.85rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0.5rem 2.5rem 1.5rem;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) { padding: 0.5rem 1.25rem 1.5rem; }
`;

const RowWrapper = styled.div`
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 72px;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, ${p => p.theme.colors.background} 0%, transparent 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, ${p => p.theme.colors.background} 0%, transparent 100%);
  }
`;

/* ── loading / error ─────────────────────────────────────── */
const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 0.75rem;
  color: ${p => p.theme.colors.textSecondary};
`;

const Spinner = styled.div`
  width: 26px;
  height: 26px;
  border: 2.5px solid ${p => p.theme.colors.border};
  border-top-color: ${p => p.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ── skeleton ─────────────────────────────────────────────── */
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const skeletonShine = (theme) => css`
  background: linear-gradient(
    90deg,
    ${theme.colors.surface} 25%,
    ${theme.colors.surfaceHover} 50%,
    ${theme.colors.surface} 75%
  );
  background-size: 1200px 100%;
  animation: ${shimmer} 1.6s infinite linear;
`;

const SkeletonCard = styled.div`
  ${p => skeletonShine(p.theme)}
  width: 150px;
  height: 225px;
  border-radius: 12px;
  flex-shrink: 0;
  @media (max-width: 768px) { width: 130px; height: 195px; }
`;

const SkeletonHero = styled.div`
  ${p => skeletonShine(p.theme)}
  height: 68vh;
  min-height: 440px;
`;

const SkeletonSectionTitle = styled.div`
  ${p => skeletonShine(p.theme)}
  width: 160px;
  height: 20px;
  border-radius: 6px;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 0.85rem;
  padding: 0.25rem 2.5rem 1rem;
  overflow: hidden;
  @media (max-width: 768px) { padding: 0.25rem 1.25rem 1rem; }
`;

/* ════════════════════════════════════════════════════════════
   useScrollRow hook
════════════════════════════════════════════════════════════ */
const useScrollRow = () => {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 500, behavior: 'smooth' });
  };
  return { ref, scroll };
};

/* ════════════════════════════════════════════════════════════
   Component
════════════════════════════════════════════════════════════ */
const HERO_INTERVAL = 6500;

const Home = () => {
  const [popularMovies, setPopularMovies]       = useState([]);
  const [topRatedMovies, setTopRatedMovies]     = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularTVShows, setPopularTVShows]     = useState([]);
  const [trending, setTrending]                 = useState([]);
  const [genreMap, setGenreMap]                 = useState({});
  const [heroIndex, setHeroIndex]               = useState(0);
  const [heroFading, setHeroFading]             = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);

  const { theme } = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const popularRow    = useScrollRow();
  const nowPlayingRow = useScrollRow();
  const topRatedRow   = useScrollRow();
  const trendingRow   = useScrollRow();
  const tvRow         = useScrollRow();

  /* fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pop, top, now, tv, trend, genres] = await Promise.all([
          tmdbApi.getPopularMovies(),
          tmdbApi.getTopRatedMovies(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getPopularTVShows(),
          tmdbApi.getTrending(),
          tmdbApi.getMovieGenres(),
        ]);

        setPopularMovies(pop.data.results.slice(0, 20));
        setTopRatedMovies(top.data.results.slice(0, 20));
        setNowPlayingMovies(now.data.results.slice(0, 20));
        setPopularTVShows(tv.data.results.slice(0, 20));
        setTrending(trend.data.results.filter(m => m.backdrop_path).slice(0, 8));

        const map = {};
        genres.data.genres.forEach(g => { map[g.id] = g.name; });
        setGenreMap(map);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar conteúdo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* hero auto-rotate */
  useEffect(() => {
    if (trending.length < 2) return;
    const t = setInterval(() => {
      setHeroFading(true);
      setTimeout(() => {
        setHeroIndex(i => (i + 1) % trending.length);
        setHeroFading(false);
      }, 380);
    }, HERO_INTERVAL);
    return () => clearInterval(t);
  }, [trending.length]);

  const goToHero = (idx) => {
    if (idx === heroIndex) return;
    setHeroFading(true);
    setTimeout(() => { setHeroIndex(idx); setHeroFading(false); }, 380);
  };

  if (loading) {
    return (
      <Page theme={theme}>
        <SkeletonHero theme={theme} />
        <Sections>
          {[...Array(4)].map((_, s) => (
            <Section key={s} theme={theme}>
              <SectionHeader>
                <SkeletonSectionTitle theme={theme} />
              </SectionHeader>
              <SkeletonRow>
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} theme={theme} />)}
              </SkeletonRow>
            </Section>
          ))}
        </Sections>
      </Page>
    );
  }

  if (error) {
    return (
      <Page theme={theme}>
        <LoadingWrap theme={theme}>{error}</LoadingWrap>
      </Page>
    );
  }

  const hero = trending[heroIndex];
  const heroType = hero?.media_type || 'movie';
  const heroTitle = hero?.title || hero?.name || '';
  const heroPath = heroType === 'tv' ? `/tv/${hero?.id}` : `/movie/${hero?.id}`;
  const heroGenres = (hero?.genre_ids || []).slice(0, 3).map(id => genreMap[id]).filter(Boolean);
  const heroYear = (hero?.release_date || hero?.first_air_date || '').slice(0, 4);

  return (
    <Page theme={theme}>
      {/* ── HERO ── */}
      {hero && (
        <HeroSection>
          <HeroBackdrop src={getBackdropUrl(hero.backdrop_path)} $fading={heroFading} />
          <HeroGradient theme={theme} />

          <HeroContent>
            <HeroRating>
              <span className="material-symbols-rounded" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1", color: '#facc15' }}>star</span>
              {hero.vote_average?.toFixed(1)}
            </HeroRating>

            <HeroMeta $fading={heroFading}>
              {heroGenres.map((g, i) => (
                <React.Fragment key={g}>
                  {i > 0 && <HeroMetaDot theme={theme}>●</HeroMetaDot>}
                  <HeroGenre theme={theme}>{g}</HeroGenre>
                </React.Fragment>
              ))}
              {heroYear && (
                <>
                  <HeroMetaDot theme={theme}>●</HeroMetaDot>
                  <HeroGenre theme={theme}>{heroYear}</HeroGenre>
                </>
              )}
            </HeroMeta>

            <HeroTitle $fading={heroFading}>{heroTitle}</HeroTitle>

            <HeroOverview $fading={heroFading}>{hero.overview}</HeroOverview>

            <HeroButtons $fading={heroFading}>
              <HeroPrimaryBtn to={heroPath} theme={theme}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>play_circle</span>
                Ver Detalhes
              </HeroPrimaryBtn>
              <HeroSecondaryBtn
                onClick={() => toggleFavorite({ ...hero, media_type: heroType })}
              >
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 18, fontVariationSettings: `'FILL' ${isFavorite(hero.id, heroType) ? 1 : 0}` }}
                >
                  favorite
                </span>
                {isFavorite(hero.id, heroType) ? 'Nos Favoritos' : 'Adicionar'}
              </HeroSecondaryBtn>
            </HeroButtons>
          </HeroContent>

          <HeroDots>
            {trending.map((_, i) => (
              <Dot key={i} theme={theme} $active={i === heroIndex} onClick={() => goToHero(i)} />
            ))}
          </HeroDots>
        </HeroSection>
      )}

      {/* ── SECTIONS ── */}
      <Sections>
        <MovieRow
          title="Em Alta Agora"
          movies={trending}
          rowRef={trendingRow.ref}
          onScroll={trendingRow.scroll}
          theme={theme}
        />
        <MovieRow
          title="Filmes Populares"
          movies={popularMovies}
          type="movie"
          rowRef={popularRow.ref}
          onScroll={popularRow.scroll}
          theme={theme}
        />
        <MovieRow
          title="Em Cartaz"
          movies={nowPlayingMovies}
          type="movie"
          rowRef={nowPlayingRow.ref}
          onScroll={nowPlayingRow.scroll}
          theme={theme}
        />
        <MovieRow
          title="Mais Bem Avaliados"
          movies={topRatedMovies}
          type="movie"
          rowRef={topRatedRow.ref}
          onScroll={topRatedRow.scroll}
          theme={theme}
        />
        <MovieRow
          title="Séries Populares"
          movies={popularTVShows}
          type="tv"
          rowRef={tvRow.ref}
          onScroll={tvRow.scroll}
          theme={theme}
        />
      </Sections>
    </Page>
  );
};

/* ── MovieRow sub-component ─────────────────────────────── */
const MovieRow = ({ title, movies, type, rowRef, onScroll, theme }) => (
  <Section theme={theme}>
    <SectionHeader>
      <SectionTitle theme={theme}>{title}</SectionTitle>
      <SectionRight>
        <ArrowBtn theme={theme} onClick={() => onScroll(-1)} aria-label="Anterior">
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_left</span>
        </ArrowBtn>
        <ArrowBtn theme={theme} onClick={() => onScroll(1)} aria-label="Próximo">
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_right</span>
        </ArrowBtn>
      </SectionRight>
    </SectionHeader>

    <RowWrapper theme={theme}>
      <ScrollRow ref={rowRef}>
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            type={movie.media_type || type || 'movie'}
          />
        ))}
      </ScrollRow>
    </RowWrapper>
  </Section>
);

export default Home;

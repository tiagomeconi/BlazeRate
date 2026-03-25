import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { tmdbApi, getImageUrl, getBackdropUrl, getYouTubeUrl } from '../services/tmdbApi';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../contexts/ThemeContext';
import MovieCard from '../components/MovieCard';
import StarRating from '../components/StarRating';
import Comments from '../components/Comments';
import PersonModal from '../components/PersonModal';

/* ── animations ─────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ═══════════════════════════════════════════════════════════
   BACKDROP / HERO
═══════════════════════════════════════════════════════════ */
const Container = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.colors.background};
`;

const BackdropSection = styled.div`
  position: relative;
  min-height: 72vh;
  background-image: url(${p => p.backdrop});
  background-size: cover;
  background-position: center top;
  display: flex;
  align-items: flex-end;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      ${p => p.theme.colors.background}55 0%,
      ${p => p.theme.colors.background}22 30%,
      ${p => p.theme.colors.background}99 70%,
      ${p => p.theme.colors.background} 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      ${p => p.theme.colors.background}cc 0%,
      transparent 55%
    );
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 3rem 2.5rem 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  gap: 2.5rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 1.25rem 2rem;
  }
`;

const PosterWrapper = styled.div`
  flex-shrink: 0;
  position: relative;
`;

const PosterImage = styled.img`
  width: 220px;
  height: 330px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 0 1px ${p => p.theme.colors.border};
  display: block;

  @media (max-width: 768px) {
    width: 180px;
    height: 270px;
  }
`;

const ScoreBadge = styled.div`
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: ${p => p.theme.colors.primary};
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 4px 16px ${p => p.theme.colors.primary}66;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MovieInfo = styled.div`
  flex: 1;
  min-width: 0;
  color: ${p => p.theme.colors.text};
  padding-bottom: 0.5rem;
  animation: ${fadeUp} 0.5s ease;
`;

const Title = styled.h1`
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
`;

const Meta = styled.p`
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.95rem;
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) { justify-content: center; }
`;

const MetaDot = styled.span`
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.7rem;
`;

const VotesRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;

  @media (max-width: 768px) { justify-content: center; }
`;

const VoteScore = styled.span`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${p => p.theme.colors.primary};
  line-height: 1;
`;

const VoteCount = styled.span`
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.85rem;
`;

const Genres = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) { justify-content: center; }
`;

const Genre = styled.span`
  border: 1px solid ${p => p.theme.colors.primary}88;
  color: ${p => p.theme.colors.primary};
  padding: 0.25rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: background 0.2s;

  &:hover { background: ${p => p.theme.colors.primary}18; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;

  @media (max-width: 768px) { justify-content: center; }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  background: ${p => p.$primary ? p.theme.colors.primary : 'transparent'};
  color: ${p => p.$primary ? '#fff' : p.theme.colors.text};
  border: 1.5px solid ${p => p.$primary ? p.theme.colors.primary : p.theme.colors.border};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.$primary ? `0 6px 20px ${p.theme.colors.primary}44` : p.theme.shadows.small};
    background: ${p => p.$primary ? p.theme.colors.secondary : p.theme.colors.surfaceHover};
    border-color: ${p => p.$primary ? p.theme.colors.secondary : p.theme.colors.primary};
  }

  &:active { transform: translateY(0); }
`;

/* ═══════════════════════════════════════════════════════════
   CAST (inside hero)
═══════════════════════════════════════════════════════════ */
const CastLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: ${p => p.theme.colors.textMuted};
  margin: 0 0 0.65rem;
`;

const CastRow = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0.5rem 0.25rem 1.25rem;
  margin-bottom: 0.25rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

const CastItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 80px;
  cursor: default;
  transition: transform 0.2s ease;

  &:hover { transform: translateY(-3px); }
`;

const CastAvatar = styled.img`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${p => p.theme.colors.border};
  transition: border-color 0.2s;

  ${CastItem}:hover & {
    border-color: ${p => p.theme.colors.primary};
  }
`;

const CastName = styled.p`
  color: ${p => p.theme.colors.text};
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CastCharacter = styled.p`
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.65rem;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

/* ═══════════════════════════════════════════════════════════
   DETAILS SECTION
═══════════════════════════════════════════════════════════ */
const DetailsSection = styled.div`
  padding: 1rem 2.5rem 3rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 1rem 1.25rem 2rem; }
`;

const SectionBlock = styled.div`
  margin-bottom: 3.5rem;
`;

const SectionTitle = styled.h2`
  color: ${p => p.theme.colors.text};
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  padding-left: 0.85rem;
  border-left: 3px solid ${p => p.theme.colors.primary};
`;

/* ── trailer ─────────────────────────────────────────────── */
const TrailerWrapper = styled.div`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${p => p.theme.shadows.large};
  border: 1px solid ${p => p.theme.colors.border};
`;

const TrailerFrame = styled.iframe`
  width: 100%;
  height: 420px;
  border: none;
  display: block;

  @media (max-width: 768px) { height: 220px; }
`;

/* ── sinopse ─────────────────────────────────────────────── */
const SinopseCard = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 16px;
  padding: 2rem 2.5rem;

  @media (max-width: 768px) { padding: 1.25rem 1.5rem; }
`;

const SinopseText = styled.p`
  color: ${p => p.theme.colors.textSecondary};
  font-size: 1rem;
  line-height: 1.85;
  margin: 0;
`;

const SinopseMeta = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${p => p.theme.colors.border};
`;

const SinopseMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SinopseMetaLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${p => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const SinopseMetaValue = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${p => p.theme.colors.text};
`;

/* ── images carousel ─────────────────────────────────────── */
const CarouselWrapper = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${p => p.theme.shadows.large};
  border: 1px solid ${p => p.theme.colors.border};
  background: #000;
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(${p => p.$offset}%);
`;

const CarouselSlide = styled.div`
  flex-shrink: 0;
  width: 100%;
`;

const CarouselImage = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  cursor: zoom-in;
`;

const CarouselBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${p => p.$side === 'left' ? 'left: 1rem;' : 'right: 1rem;'}
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.08);
  }

  &:disabled { opacity: 0.3; cursor: default; }
`;

const CarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 0.85rem 0 0;
`;

const Dot = styled.button`
  width: ${p => p.$active ? '22px' : '7px'};
  height: 7px;
  border-radius: 4px;
  background: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.border};
  border: none;
  cursor: pointer;
  padding: 0;
  transition: width 0.3s ease, background 0.2s ease;
`;

const CarouselCounter = styled.div`
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  pointer-events: none;
  z-index: 2;
`;

/* ── lightbox ────────────────────────────────────────────── */
const Lightbox = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  cursor: zoom-out;
`;

const LightboxImg = styled.img`
  max-width: 100%;
  max-height: 90vh;
  border-radius: 10px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.8);
`;

/* ── recommendations ─────────────────────────────────────── */
const RecsRow = styled.div`
  display: flex;
  gap: 0.85rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

/* ── states ──────────────────────────────────────────────── */
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: ${p => p.theme.colors.textSecondary};
  font-size: 1rem;
  gap: 0.75rem;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2.5px solid ${p => p.theme.colors.border};
  border-top-color: ${p => p.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const ErrorMessage = styled.div`
  color: ${p => p.theme.colors.error};
  text-align: center;
  padding: 2rem;
  background: ${p => p.theme.colors.error}12;
  border-radius: 12px;
  margin: 2rem;
  border: 1px solid ${p => p.theme.colors.error}30;
`;

/* ════════════════════════════════════════════════════════════
   Component
════════════════════════════════════════════════════════════ */
const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const type = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { toggleFavorite, toggleWatched, isFavorite, isWatched } = useFavorites();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = type === 'tv'
          ? await tmdbApi.getTVShowDetails(id)
          : await tmdbApi.getMovieDetails(id);
        setDetails(response.data);
      } catch (err) {
        setError('Erro ao carregar os detalhes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    setCarouselIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id, type]);

  // close lightbox on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightboxSrc(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (loading) {
    return (
      <Container theme={theme}>
        <LoadingContainer theme={theme}>
          <Spinner theme={theme} /> Carregando detalhes...
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !details) {
    return (
      <Container theme={theme}>
        <ErrorMessage theme={theme}>{error || 'Conteúdo não encontrado.'}</ErrorMessage>
      </Container>
    );
  }

  const title       = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year        = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const runtime     = details.runtime || (details.episode_run_time?.[0]);
  const videos      = details.videos?.results || [];
  const trailer     =
    videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') ||
    videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
    videos.find(v => v.site === 'YouTube');
  const cast        = details.credits?.cast?.slice(0, 18) || [];
  const backdrops   = details.images?.backdrops?.slice(0, 3) || [];
  const director    = details.credits?.crew?.find(c => c.job === 'Director');

  const movieWithType  = { ...details, media_type: type };
  const isInFavorites  = isFavorite(details.id, type);
  const isInWatched    = isWatched(details.id, type);

  return (
    <Container theme={theme}>
      {/* ── HERO ── */}
      <BackdropSection theme={theme} backdrop={getBackdropUrl(details.backdrop_path)}>
        <HeroContent>
          <PosterWrapper>
            <PosterImage
              theme={theme}
              src={getImageUrl(details.poster_path, 'w500')}
              alt={title}
            />
            {details.vote_average > 0 && (
              <ScoreBadge theme={theme}>
                <span className="material-symbols-rounded" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
                {details.vote_average?.toFixed(1)}
              </ScoreBadge>
            )}
          </PosterWrapper>

          <MovieInfo theme={theme}>
            <Title>{title}</Title>

            <Meta theme={theme}>
              {year}
              {runtime && <><MetaDot theme={theme}>●</MetaDot>{runtime} min</>}
              <MetaDot theme={theme}>●</MetaDot>
              {type === 'tv' ? 'Série' : 'Filme'}
            </Meta>

            <VotesRow>
              <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1", color: '#facc15' }}>star</span>
              <VoteScore theme={theme}>{details.vote_average?.toFixed(1)}</VoteScore>
              <VoteCount theme={theme}>({details.vote_count?.toLocaleString()} avaliações)</VoteCount>
            </VotesRow>

            {details.genres?.length > 0 && (
              <Genres>
                {details.genres.map(g => <Genre key={g.id} theme={theme}>{g.name}</Genre>)}
              </Genres>
            )}

            {/* ── ELENCO dentro do hero ── */}
            {cast.length > 0 && (
              <>
                <CastLabel theme={theme}>Elenco Principal</CastLabel>
                <CastRow>
                  {cast.map(person => (
                    <CastItem key={person.id} onClick={() => setSelectedPerson(person.id)} style={{ cursor: 'pointer' }}>
                      <CastAvatar
                        theme={theme}
                        src={getImageUrl(person.profile_path, 'w185')}
                        alt={person.name}
                      />
                      <CastName theme={theme}>{person.name}</CastName>
                      <CastCharacter theme={theme}>{person.character}</CastCharacter>
                    </CastItem>
                  ))}
                </CastRow>
              </>
            )}

            <ActionButtons>
              <ActionButton theme={theme} $primary onClick={() => toggleFavorite(movieWithType)}>
                <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: `'FILL' ${isInFavorites ? 1 : 0}` }}>favorite</span>
                {isInFavorites ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </ActionButton>

              <ActionButton theme={theme} onClick={() => toggleWatched(movieWithType)}>
                <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: `'FILL' ${isInWatched ? 1 : 0}` }}>
                  {isInWatched ? 'check_circle' : 'visibility'}
                </span>
                {isInWatched ? 'Já Assistido' : 'Marcar como Assistido'}
              </ActionButton>
            </ActionButtons>
          </MovieInfo>
        </HeroContent>
      </BackdropSection>

      {/* ── DETAILS ── */}
      <DetailsSection>

        {/* 1. História */}
        {details.overview && (
          <SectionBlock>
            <SectionTitle theme={theme}>História</SectionTitle>
            <SinopseCard theme={theme}>
              <SinopseText theme={theme}>{details.overview}</SinopseText>

              {(director || details.genres?.length > 0 || runtime) && (
                <SinopseMeta theme={theme}>
                  {director && (
                    <SinopseMetaItem>
                      <SinopseMetaLabel theme={theme}>Direção</SinopseMetaLabel>
                      <SinopseMetaValue theme={theme}>{director.name}</SinopseMetaValue>
                    </SinopseMetaItem>
                  )}
                  {runtime && (
                    <SinopseMetaItem>
                      <SinopseMetaLabel theme={theme}>Duração</SinopseMetaLabel>
                      <SinopseMetaValue theme={theme}>{runtime} min</SinopseMetaValue>
                    </SinopseMetaItem>
                  )}
                  {releaseDate && (
                    <SinopseMetaItem>
                      <SinopseMetaLabel theme={theme}>Lançamento</SinopseMetaLabel>
                      <SinopseMetaValue theme={theme}>
                        {new Date(releaseDate).toLocaleDateString('pt-BR')}
                      </SinopseMetaValue>
                    </SinopseMetaItem>
                  )}
                  {details.vote_average > 0 && (
                    <SinopseMetaItem>
                      <SinopseMetaLabel theme={theme}>Nota TMDB</SinopseMetaLabel>
                      <SinopseMetaValue theme={theme}>{details.vote_average?.toFixed(1)} / 10</SinopseMetaValue>
                    </SinopseMetaItem>
                  )}
                </SinopseMeta>
              )}
            </SinopseCard>
          </SectionBlock>
        )}

        {/* 2. Trailer */}
        {trailer && (
          <SectionBlock>
            <SectionTitle theme={theme}>Trailer</SectionTitle>
            <TrailerWrapper theme={theme}>
              <TrailerFrame src={getYouTubeUrl(trailer.key)} title="Trailer" allowFullScreen />
            </TrailerWrapper>
          </SectionBlock>
        )}

        {/* 3. Imagens */}
        {backdrops.length > 0 && (
          <SectionBlock>
            <SectionTitle theme={theme}>Imagens</SectionTitle>
            <CarouselWrapper theme={theme}>
              <CarouselTrack $offset={-carouselIndex * 100}>
                {backdrops.map((img, i) => (
                  <CarouselSlide key={i}>
                    <CarouselImage
                      src={getBackdropUrl(img.file_path, 'w1280')}
                      alt={`Cena ${i + 1}`}
                      loading="lazy"
                      onClick={() => setLightboxSrc(getBackdropUrl(img.file_path, 'original'))}
                    />
                  </CarouselSlide>
                ))}
              </CarouselTrack>

              <CarouselBtn
                $side="left"
                theme={theme}
                onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
                disabled={carouselIndex === 0}
                aria-label="Anterior"
              >
                <span className="material-symbols-rounded" style={{ fontSize: 22 }}>chevron_left</span>
              </CarouselBtn>

              <CarouselBtn
                $side="right"
                theme={theme}
                onClick={() => setCarouselIndex(i => Math.min(backdrops.length - 1, i + 1))}
                disabled={carouselIndex === backdrops.length - 1}
                aria-label="Próxima"
              >
                <span className="material-symbols-rounded" style={{ fontSize: 22 }}>chevron_right</span>
              </CarouselBtn>

              <CarouselCounter>{carouselIndex + 1} / {backdrops.length}</CarouselCounter>
            </CarouselWrapper>

            <CarouselDots>
              {backdrops.map((_, i) => (
                <Dot
                  key={i}
                  theme={theme}
                  $active={i === carouselIndex}
                  onClick={() => setCarouselIndex(i)}
                  aria-label={`Imagem ${i + 1}`}
                />
              ))}
            </CarouselDots>
          </SectionBlock>
        )}

        {/* 4. Comentários */}
        <SectionBlock>
          <SectionTitle theme={theme}>Comentários</SectionTitle>
          <StarRating movieId={details.id} movieType={type} />
          <Comments movieId={details.id} movieType={type} movieTitle={title} />
        </SectionBlock>

        {/* 5. Recomendações */}
        {details.recommendations?.results?.length > 0 && (
          <SectionBlock>
            <SectionTitle theme={theme}>Você também pode gostar</SectionTitle>
            <RecsRow>
              {details.recommendations.results.slice(0, 15).map(item => (
                <MovieCard key={item.id} movie={item} type={type} />
              ))}
            </RecsRow>
          </SectionBlock>
        )}
      </DetailsSection>

      {/* ── PERSON MODAL ── */}
      {selectedPerson && (
        <PersonModal personId={selectedPerson} onClose={() => setSelectedPerson(null)} />
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxSrc && (
        <Lightbox onClick={() => setLightboxSrc(null)}>
          <LightboxImg src={lightboxSrc} alt="Imagem ampliada" />
        </Lightbox>
      )}
    </Container>
  );
};

export default MovieDetails;

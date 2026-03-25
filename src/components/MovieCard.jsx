import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { getImageUrl, getBackdropUrl, tmdbApi } from '../services/tmdbApi';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../contexts/ThemeContext';

/* ── base card ───────────────────────────────────────────── */
const Card = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  width: 150px;
  background: ${p => p.theme.colors.surface};
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, opacity 0.25s ease;
  cursor: pointer;
  z-index: ${p => p.$expanded ? 10 : 1};
  opacity: ${p => p.$expanded ? 0.5 : 1};

  &:hover {
    transform: translateY(-6px) scale(1.04);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.55),
      0 0 0 1px ${p => p.theme.colors.primary}33;
  }

  @media (max-width: 768px) { width: 130px; }
`;

const PosterLink = styled(Link)`
  display: block;
  text-decoration: none;
`;

const Poster = styled.img`
  width: 100%;
  height: 225px;
  object-fit: cover;
  display: block;
  @media (max-width: 768px) { height: 195px; }
`;

const RatingBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.45);
  pointer-events: none;
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  ${Card}:hover & {
    box-shadow: 0 4px 16px ${p => p.theme.colors.primary}66;
    transform: scale(1.08);
  }
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2.5rem 0.75rem 0.75rem;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;

  ${Card}:hover & { opacity: 1; transform: translateY(0); }
`;

const OverlayTitle = styled.p`
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  margin: 0 0 0.2rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OverlayYear = styled.p`
  color: rgba(255,255,255,0.6);
  font-size: 0.72rem;
  margin: 0;
`;

const FavoriteBtn = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease, transform 0.2s ease;
  pointer-events: all;

  ${Card}:hover & { opacity: 1; }
  &:hover { background: rgba(0,0,0,0.88); transform: scale(1.1); }
`;

/* ── expanded preview (renders via portal) ───────────────── */
const expandIn = keyframes`
  0%   { opacity: 0; transform: scale(0.96) translateY(-6px); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: scale(1)    translateY(0); }
`;

const bodySlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PREVIEW_W = 290;

const PreviewWrap = styled.div`
  position: absolute;
  z-index: 9999;
  width: ${PREVIEW_W}px;
  border-radius: 16px;
  overflow: hidden;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  box-shadow:
    0 8px 16px rgba(0,0,0,0.4),
    0 24px 64px rgba(0,0,0,0.75);
  transform-origin: top center;
  animation: ${expandIn} 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  pointer-events: all;
`;

const PreviewMedia = styled.div`
  position: relative;
  width: 100%;
  height: 163px;
  background: #000;
  overflow: hidden;
`;

const PreviewBackdrop = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${p => p.$hide ? 0 : 1};
  transition: opacity 0.8s ease;
`;

const PreviewIframe = styled.iframe`
  position: absolute;
  inset: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  border: none;
  pointer-events: none;
`;

const PreviewBody = styled.div`
  padding: 0.85rem 1rem 1rem;
  animation: ${bodySlideUp} 0.22s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
`;

const PreviewTitle = styled.h3`
  color: ${p => p.theme.colors.text};
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  line-height: 1.3;
`;

const PreviewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
`;

const PreviewRating = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  color: #facc15;
  font-size: 0.78rem;
  font-weight: 700;
`;

const PreviewYear = styled.span`
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.78rem;
`;

const PreviewOverview = styled.p`
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.78rem;
  line-height: 1.5;
  margin: 0 0 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PreviewActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PreviewPrimaryBtn = styled(Link)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 600;
  transition: background 0.2s;
  &:hover { background: ${p => p.theme.colors.secondary}; }
`;

const PreviewFavBtn = styled.button`
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.colors.surfaceHover};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 8px;
  color: ${p => p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }
`;

/* ── component ───────────────────────────────────────────── */
const SHOW_DELAY = 600;
const HIDE_DELAY = 120;

const MovieCard = ({ movie, type = 'movie' }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const { theme } = useTheme();

  const [preview, setPreview]       = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  const cardRef   = useRef(null);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  const mediaType   = movie.media_type || type;
  const isFav       = favorites.some(f => f.id === movie.id && f.media_type === mediaType);
  const title       = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const year        = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating      = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const detailsPath = mediaType === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  // Close preview on scroll
  useEffect(() => {
    if (!preview) return;
    const close = () => { clearTimeout(showTimer.current); setPreview(null); setVideoReady(false); };
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [preview]);

  const cancelHide = () => clearTimeout(hideTimer.current);

  const startHide = () => {
    hideTimer.current = setTimeout(() => {
      setPreview(null);
      setVideoReady(false);
    }, HIDE_DELAY);
  };

  const handleCardEnter = () => {
    cancelHide();
    clearTimeout(showTimer.current);
    if (preview) return;

    showTimer.current = setTimeout(async () => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Center the preview horizontally on the card, aligned at card top
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let x = rect.left + scrollX + rect.width / 2 - PREVIEW_W / 2;
      let y = rect.top  + scrollY;

      // Clamp horizontally to viewport
      x = Math.max(8 + scrollX, Math.min(x, scrollX + window.innerWidth - PREVIEW_W - 8));
      // Flip upward if preview would go below viewport bottom
      const PREVIEW_H = 360;
      if (rect.top + PREVIEW_H > window.innerHeight) {
        y = rect.bottom + scrollY - PREVIEW_H;
      }

      setPreview({ x, y, trailerKey: null });
      setVideoReady(false);

      try {
        const res = await tmdbApi.getVideos(movie.id, mediaType);
        const videos = res.data.results || [];
        const trailer =
          videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') ||
          videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
          videos.find(v => v.site === 'YouTube');
        setPreview(p => p ? { ...p, trailerKey: trailer?.key || null } : null);
      } catch {
        // no trailer — show backdrop only
      }
    }, SHOW_DELAY);
  };

  const handleCardLeave = () => {
    clearTimeout(showTimer.current);
    startHide();
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ ...movie, media_type: mediaType });
  };

  return (
    <>
      <Card
        theme={theme}
        ref={cardRef}
        $expanded={!!preview}
        onMouseEnter={handleCardEnter}
        onMouseLeave={handleCardLeave}
      >
        <PosterLink to={detailsPath}>
          <Poster src={getImageUrl(movie.poster_path, 'w342')} alt={title} loading="lazy" />
        </PosterLink>

        {rating && (
          <RatingBadge theme={theme}>
            <span className="material-symbols-rounded" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>star</span>
            {rating}
          </RatingBadge>
        )}

        <FavoriteBtn onClick={handleFavorite} aria-label="Favoritar">
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 15, color: isFav ? '#ff6b35' : '#fff', fontVariationSettings: `'FILL' ${isFav ? 1 : 0}` }}
          >
            favorite
          </span>
        </FavoriteBtn>

        <Overlay>
          <OverlayTitle>{title}</OverlayTitle>
          {year && <OverlayYear>{year}</OverlayYear>}
        </Overlay>
      </Card>

      {preview && ReactDOM.createPortal(
        <PreviewWrap
          theme={theme}
          style={{ left: preview.x, top: preview.y }}
          onMouseEnter={cancelHide}
          onMouseLeave={startHide}
        >
          <PreviewMedia>
            <PreviewBackdrop
              src={getBackdropUrl(movie.backdrop_path, 'w780')}
              $hide={videoReady && !!preview.trailerKey}
            />
            {preview.trailerKey && (
              <PreviewIframe
                src={`https://www.youtube.com/embed/${preview.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${preview.trailerKey}&modestbranding=1&rel=0`}
                allow="autoplay; encrypted-media"
                onLoad={() => setTimeout(() => setVideoReady(true), 1200)}
              />
            )}
          </PreviewMedia>

          <PreviewBody>
            <PreviewTitle theme={theme}>{title}</PreviewTitle>
            <PreviewMeta>
              {rating && (
                <PreviewRating>
                  <span className="material-symbols-rounded" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>star</span>
                  {rating}
                </PreviewRating>
              )}
              {year && <PreviewYear theme={theme}>{year}</PreviewYear>}
            </PreviewMeta>
            {movie.overview && (
              <PreviewOverview theme={theme}>{movie.overview}</PreviewOverview>
            )}
            <PreviewActions>
              <PreviewPrimaryBtn to={detailsPath} theme={theme}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>play_circle</span>
                Ver Detalhes
              </PreviewPrimaryBtn>
              <PreviewFavBtn onClick={handleFavorite} theme={theme} $active={isFav}>
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 16, fontVariationSettings: `'FILL' ${isFav ? 1 : 0}` }}
                >
                  favorite
                </span>
              </PreviewFavBtn>
            </PreviewActions>
          </PreviewBody>
        </PreviewWrap>,
        document.body
      )}
    </>
  );
};

export default MovieCard;

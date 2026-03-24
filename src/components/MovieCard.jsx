import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getImageUrl } from '../services/tmdbApi';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../contexts/ThemeContext';

const Card = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  width: 150px;
  background: ${p => p.theme.colors.surface};
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
  }

  @media (max-width: 768px) {
    width: 130px;
  }
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

  @media (max-width: 768px) {
    height: 195px;
  }
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  pointer-events: none;
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2.5rem 0.75rem 0.75rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(0, 0, 0, 0.5) 55%,
    transparent 100%
  );
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;

  ${Card}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.72rem;
  margin: 0;
`;

const FavoriteBtn = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
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

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.88);
    transform: scale(1.1);
  }
`;

const MovieCard = ({ movie, type = 'movie' }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const { theme } = useTheme();

  const mediaType = movie.media_type || type;
  const isFav = favorites.some(f => f.id === movie.id && f.media_type === mediaType);

  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  const detailsPath = mediaType === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ ...movie, media_type: mediaType });
  };

  return (
    <Card theme={theme}>
      <PosterLink to={detailsPath}>
        <Poster
          src={getImageUrl(movie.poster_path, 'w342')}
          alt={title}
          loading="lazy"
        />
      </PosterLink>

      {rating && (
        <RatingBadge theme={theme}>
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          {rating}
        </RatingBadge>
      )}

      <FavoriteBtn onClick={handleFavorite} aria-label="Favoritar">
        <span
          className="material-symbols-rounded"
          style={{
            fontSize: 15,
            color: isFav ? '#ff6b35' : '#fff',
            fontVariationSettings: `'FILL' ${isFav ? 1 : 0}`,
          }}
        >
          favorite
        </span>
      </FavoriteBtn>

      <Overlay>
        <OverlayTitle>{title}</OverlayTitle>
        {year && <OverlayYear>{year}</OverlayYear>}
      </Overlay>
    </Card>
  );
};

export default MovieCard;

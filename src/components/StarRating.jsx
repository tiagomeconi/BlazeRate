import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { rateMovie, getUserRating } from '../services/supabase';

const pop = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.35); }
  100% { transform: scale(1); }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  background: ${p => p.theme.colors.surface};
  border-radius: 14px;
  border: 1px solid ${p => p.theme.colors.border};
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const RatingLabel = styled.span`
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
`;

const StarsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex: 1;
`;

const Star = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  color: ${p => p.$filled ? p.theme.colors.primary : p.theme.colors.border};
  transition: color 0.15s ease;
  display: flex;
  align-items: center;

  &:hover { color: ${p => p.theme.colors.primary}; }
  &:disabled { cursor: not-allowed; opacity: 0.5; }

  ${p => p.$pop && css`animation: ${pop} 0.3s ease;`}
`;

const RatingText = styled.span`
  color: ${p => p.theme.colors.text};
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 56px;
`;

const SaveBtn = styled.button`
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 0.45rem 1.2rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.colors.secondary};
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SavedBadge = styled.span`
  color: ${p => p.theme.colors.success};
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoginPrompt = styled.div`
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.85rem;
  font-style: italic;
`;

const LABELS = { 1: 'Terrível', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente' };

const StarRating = ({ movieId, movieType }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [rating, setRating]           = useState(0);
  const [hover, setHover]             = useState(0);
  const [saved, setSaved]             = useState(false);
  const [loading, setLoading]         = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [poppedStar, setPoppedStar]   = useState(null);

  useEffect(() => {
    if (!currentUser || !movieId) return;
    getUserRating(currentUser.uid, movieId, movieType).then(r => {
      if (r) { setRating(r.rating); setHasExisting(true); }
    });
  }, [currentUser, movieId, movieType]);

  const handleStar = (s) => {
    setRating(s);
    setPoppedStar(s);
    setTimeout(() => setPoppedStar(null), 350);
  };

  const handleSave = async () => {
    if (!currentUser || !rating) return;
    setLoading(true);
    try {
      await rateMovie(currentUser.uid, movieId, movieType, rating, '');
      setHasExisting(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <RatingContainer theme={theme}>
        <LoginPrompt theme={theme}>Faça login para avaliar este conteúdo</LoginPrompt>
      </RatingContainer>
    );
  }

  const active = hover || rating;

  return (
    <RatingContainer theme={theme}>
      <RatingLabel theme={theme}>
        {hasExisting ? 'Sua nota' : 'Avaliar'}
      </RatingLabel>

      <StarsRow>
        {[1, 2, 3, 4, 5].map(s => (
          <Star
            key={s}
            type="button"
            $filled={s <= active}
            $pop={s === poppedStar}
            onClick={() => handleStar(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            disabled={loading}
            theme={theme}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 26, fontVariationSettings: `'FILL' ${s <= active ? 1 : 0}` }}
            >
              star
            </span>
          </Star>
        ))}

        {active > 0 && (
          <RatingText theme={theme}>{LABELS[active]}</RatingText>
        )}
      </StarsRow>

      {saved ? (
        <SavedBadge theme={theme}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Salvo!
        </SavedBadge>
      ) : (
        rating > 0 && (
          <SaveBtn type="button" onClick={handleSave} disabled={loading} theme={theme}>
            {loading ? 'Salvando...' : hasExisting ? 'Atualizar' : 'Salvar'}
          </SaveBtn>
        )
      )}
    </RatingContainer>
  );
};

export default StarRating;

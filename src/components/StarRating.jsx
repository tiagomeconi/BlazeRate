import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { rateMovie, getUserRating } from '../services/firebase';

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 14px;
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 1.5rem;
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Star = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${props => props.$filled ? props.theme.colors.primary : props.theme.colors.textMuted};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    transform: scale(1.15);
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const RatingText = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  margin-left: 0.5rem;
`;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NoteLabel = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
`;

const NoteTextarea = styled.textarea`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  padding: 0.75rem;
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.6rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 0.5rem 0;
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
  font-style: italic;
`;

const StarRating = ({ movieId, movieTitle }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    if (currentUser && movieId) {
      loadExistingRating();
    }
  }, [currentUser, movieId]);

  const loadExistingRating = async () => {
    try {
      const userRating = await getUserRating(currentUser.uid, movieId);
      if (userRating) {
        setRating(userRating.rating);
        setNote(userRating.note || '');
        setExistingRating(userRating);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleSaveRating = async () => {
    if (!currentUser || !rating) return;
    
    try {
      setLoading(true);
      await rateMovie(currentUser.uid, movieId, rating, note);
      setExistingRating({ rating, note, movieId, userId: currentUser.uid });
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Terrível',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente'
    };
    return texts[rating] || '';
  };

  if (!currentUser) {
    return (
      <RatingContainer theme={theme}>
        <LoginPrompt theme={theme}>
          Faça login para avaliar este filme
        </LoginPrompt>
      </RatingContainer>
    );
  }

  return (
    <RatingContainer theme={theme}>
      <div>
        <h4 style={{ color: theme.colors.text, margin: '0 0 0.5rem 0' }}>
          {existingRating ? 'Sua Avaliação' : 'Avaliar Filme'}
        </h4>
        
        <StarsContainer>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              $filled={star <= (hoverRating || rating)}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={loading}
              theme={theme}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: 28,
                  fontVariationSettings: `'FILL' ${star <= (hoverRating || rating) ? 1 : 0}`,
                }}
              >
                star
              </span>
            </Star>
          ))}
          
          {(hoverRating || rating) > 0 && (
            <RatingText theme={theme}>
              {getRatingText(hoverRating || rating)}
            </RatingText>
          )}
        </StarsContainer>
      </div>
      
      {rating > 0 && (
        <NoteContainer>
          <NoteLabel theme={theme}>Nota pessoal (opcional)</NoteLabel>
          <NoteTextarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escreva suas impressões sobre o filme..."
            theme={theme}
          />
          
          <SaveButton
            onClick={handleSaveRating}
            disabled={loading}
            theme={theme}
          >
            {loading ? 'Salvando...' : existingRating ? 'Atualizar Avaliação' : 'Salvar Avaliação'}
          </SaveButton>
        </NoteContainer>
      )}
    </RatingContainer>
  );
};

export default StarRating;
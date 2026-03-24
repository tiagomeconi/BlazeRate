import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { addComment, getMovieComments } from '../services/firebase';

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const CommentsHeader = styled.h4`
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-size: 1.1rem;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CommentTextarea = styled.textarea`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
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

const SubmitButton = styled.button`
  align-self: flex-start;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
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

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentItem = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 1rem;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const CommentAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.primary};
  object-fit: cover;
`;

const CommentAuthor = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
`;

const CommentDate = styled.span`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.8rem;
`;

const CommentText = styled.p`
  color: ${props => props.theme.colors.text};
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textMuted};
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
  
  div {
    width: 20px;
    height: 20px;
    border: 2px solid ${props => props.theme.colors.border};
    border-top: 2px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Comments = ({ movieId, movieTitle }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (movieId) {
      loadComments();
    }
  }, [movieId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const movieComments = await getMovieComments(movieId);
      setComments(movieComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;
    
    try {
      setSubmitting(true);
      await addComment(currentUser.uid, movieId, newComment.trim());
      setNewComment('');
      // Reload comments to show the new one
      await loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
      Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <CommentsContainer theme={theme}>
      <CommentsHeader theme={theme}>
        Comentários ({comments.length})
      </CommentsHeader>
      
      {currentUser ? (
        <CommentForm onSubmit={handleSubmitComment}>
          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Compartilhe sua opinião sobre ${movieTitle}...`}
            theme={theme}
            required
          />
          <SubmitButton
            type="submit"
            disabled={submitting || !newComment.trim()}
            theme={theme}
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </SubmitButton>
        </CommentForm>
      ) : (
        <LoginPrompt theme={theme}>
          Faça login para comentar
        </LoginPrompt>
      )}
      
      {loading ? (
        <LoadingSpinner theme={theme}>
          <div />
        </LoadingSpinner>
      ) : (
        <CommentsList>
          {comments.length === 0 ? (
            <EmptyState theme={theme}>
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </EmptyState>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} theme={theme}>
                <CommentHeader>
                  <CommentAvatar
                    src={comment.userPhotoURL || '/placeholder-avatar.svg'}
                    alt={comment.userDisplayName || 'Usuário'}
                    theme={theme}
                  />
                  <CommentAuthor theme={theme}>
                    {comment.userDisplayName || 'Usuário Anônimo'}
                  </CommentAuthor>
                  <CommentDate theme={theme}>
                    {formatDate(comment.createdAt)}
                  </CommentDate>
                </CommentHeader>
                <CommentText theme={theme}>
                  {comment.comment}
                </CommentText>
              </CommentItem>
            ))
          )}
        </CommentsList>
      )}
    </CommentsContainer>
  );
};

export default Comments;
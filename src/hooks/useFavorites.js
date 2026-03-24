import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'blazerate_favorites';
const WATCHED_KEY = 'blazerate_watched';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [watched, setWatched] = useState([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    const savedWatched = localStorage.getItem(WATCHED_KEY);
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    }
    
    if (savedWatched) {
      try {
        setWatched(JSON.parse(savedWatched));
      } catch (error) {
        console.error('Erro ao carregar assistidos:', error);
      }
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  // Salvar assistidos no localStorage
  const saveWatched = (newWatched) => {
    try {
      localStorage.setItem(WATCHED_KEY, JSON.stringify(newWatched));
      setWatched(newWatched);
    } catch (error) {
      console.error('Erro ao salvar assistidos:', error);
    }
  };

  // Adicionar/remover favorito
  const toggleFavorite = (movie) => {
    const movieWithType = {
      ...movie,
      media_type: movie.media_type || 'movie',
      added_at: new Date().toISOString()
    };
    
    const existingIndex = favorites.findIndex(
      fav => fav.id === movie.id && fav.media_type === movieWithType.media_type
    );
    
    let newFavorites;
    if (existingIndex >= 0) {
      // Remover dos favoritos
      newFavorites = favorites.filter((_, index) => index !== existingIndex);
    } else {
      // Adicionar aos favoritos
      newFavorites = [...favorites, movieWithType];
    }
    
    saveFavorites(newFavorites);
  };

  // Adicionar/remover assistido
  const toggleWatched = (movie) => {
    const movieWithType = {
      ...movie,
      media_type: movie.media_type || 'movie',
      watched_at: new Date().toISOString()
    };
    
    const existingIndex = watched.findIndex(
      item => item.id === movie.id && item.media_type === movieWithType.media_type
    );
    
    let newWatched;
    if (existingIndex >= 0) {
      // Remover dos assistidos
      newWatched = watched.filter((_, index) => index !== existingIndex);
    } else {
      // Adicionar aos assistidos
      newWatched = [...watched, movieWithType];
    }
    
    saveWatched(newWatched);
  };

  // Verificar se é favorito
  const isFavorite = (movieId, mediaType = 'movie') => {
    return favorites.some(fav => fav.id === movieId && fav.media_type === mediaType);
  };

  // Verificar se foi assistido
  const isWatched = (movieId, mediaType = 'movie') => {
    return watched.some(item => item.id === movieId && item.media_type === mediaType);
  };

  // Limpar todos os favoritos
  const clearFavorites = () => {
    saveFavorites([]);
  };

  // Limpar todos os assistidos
  const clearWatched = () => {
    saveWatched([]);
  };

  return {
    favorites,
    watched,
    toggleFavorite,
    toggleWatched,
    isFavorite,
    isWatched,
    clearFavorites,
    clearWatched
  };
};
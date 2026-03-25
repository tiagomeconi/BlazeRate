import axios from 'axios';

const API_KEY = '4e44d9029b1270a757cddc766a1bcb63'; // Chave pública do TMDB para demonstração
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'pt-BR'
  }
});

export const tmdbApi = {
  // Filmes populares
  getPopularMovies: () => api.get('/movie/popular'),
  
  // Filmes mais bem avaliados
  getTopRatedMovies: () => api.get('/movie/top_rated'),
  
  // Lançamentos recentes
  getNowPlayingMovies: () => api.get('/movie/now_playing'),
  
  // Séries populares
  getPopularTVShows: () => api.get('/tv/popular'),
  
  // Séries mais bem avaliadas
  getTopRatedTVShows: () => api.get('/tv/top_rated'),
  
  // Buscar filmes
  searchMovies: (query) => api.get('/search/movie', {
    params: { query }
  }),
  
  // Buscar séries
  searchTVShows: (query) => api.get('/search/tv', {
    params: { query }
  }),
  
  // Buscar multi (filmes e séries)
  searchMulti: (query) => api.get('/search/multi', {
    params: { query }
  }),
  
  // Detalhes do filme
  getMovieDetails: (id) => api.get(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,videos,recommendations,images',
      include_image_language: 'null',
      include_video_language: 'en,null',
    }
  }),

  // Detalhes da série
  getTVShowDetails: (id) => api.get(`/tv/${id}`, {
    params: {
      append_to_response: 'credits,videos,recommendations,images',
      include_image_language: 'null',
      include_video_language: 'en,null',
    }
  }),
  
  // Trending (filmes e séries da semana)
  getTrending: (timeWindow = 'week') => api.get(`/trending/all/${timeWindow}`),

  // Gêneros de filmes
  getMovieGenres: () => api.get('/genre/movie/list'),

  // Gêneros de séries
  getTVGenres: () => api.get('/genre/tv/list'),

  // Detalhes de pessoa (ator/diretor)
  getPersonDetails: (id) => api.get(`/person/${id}`, {
    params: { append_to_response: 'movie_credits,tv_credits' }
  }),

  // Vídeos (trailers) de um filme ou série
  getVideos: (id, type = 'movie') => api.get(`/${type}/${id}/videos`),

  // Pessoas populares (para avatares)
  getPopularPersons: (page = 1) => api.get('/person/popular', { params: { page } }),
};

// Utilitários para URLs de imagens
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-movie.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/placeholder-backdrop.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getYouTubeUrl = (key) => {
  return `https://www.youtube.com/embed/${key}`;
};
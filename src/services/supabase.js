import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ── Auth ─────────────────────────────────────────────────── */

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
};

export const registerWithEmail = async (name, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  if (data.user) await upsertProfile(data.user);
  return data.user;
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAuthStateChange = (callback) => {
  // Fire immediately with current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user ?? null);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
};

/* ── Profile ──────────────────────────────────────────────── */

export const upsertProfile = async (user) => {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0],
    email: user.email,
    photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  }, { onConflict: 'id' });
  if (error) console.error('upsertProfile:', error);
};

// Keep alias for AuthContext
export const createUserDocument = upsertProfile;

export const updateUserProfile = async (userId, { displayName, photoURL }) => {
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: displayName, avatar_url: photoURL },
  });
  if (authError) throw authError;

  const { error } = await supabase.from('profiles').update({
    display_name: displayName,
    photo_url: photoURL,
  }).eq('id', userId);
  if (error) throw error;
};

/* ── Ratings ──────────────────────────────────────────────── */

export const rateMovie = async (userId, movieId, movieType, rating, note = '') => {
  const { error } = await supabase.from('ratings').upsert({
    user_id: userId,
    movie_id: String(movieId),
    movie_type: movieType || 'movie',
    rating,
    note: note || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,movie_id,movie_type' });
  if (error) throw error;
};

export const getUserRating = async (userId, movieId, movieType) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', userId)
    .eq('movie_id', String(movieId))
    .eq('movie_type', movieType || 'movie')
    .maybeSingle();
  if (error) return null;
  return data;
};

/* ── Comments ─────────────────────────────────────────────── */

export const addComment = async (userId, movieId, movieType, comment, userName, userAvatar) => {
  const { error } = await supabase.from('comments').insert({
    user_id: userId,
    movie_id: String(movieId),
    movie_type: movieType || 'movie',
    comment,
    user_name: userName || 'Usuário',
    user_avatar: userAvatar || null,
  });
  if (error) throw error;
};

export const getMovieComments = async (movieId, movieType) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('movie_id', String(movieId))
    .eq('movie_type', movieType || 'movie')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
};

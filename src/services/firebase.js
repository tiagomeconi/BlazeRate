// Firebase configuration
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const registerWithEmail = async (name, email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await createUserDocument({ ...result.user, displayName: name });
  return result.user;
};

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User data functions
export const createUserDocument = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        favoriteMovies: [],
        watchedMovies: [],
        ratings: {},
        lists: []
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }
  
  return userRef;
};

// Movie rating functions
export const rateMovie = async (userId, movieId, rating, note = '') => {
  try {
    const ratingRef = doc(db, 'ratings', `${userId}_${movieId}`);
    await setDoc(ratingRef, {
      userId,
      movieId,
      rating,
      note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rating movie:', error);
    throw error;
  }
};

export const getUserRating = async (userId, movieId) => {
  try {
    const ratingRef = doc(db, 'ratings', `${userId}_${movieId}`);
    const ratingSnap = await getDoc(ratingRef);
    return ratingSnap.exists() ? ratingSnap.data() : null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
};

// Comments functions
export const addComment = async (userId, movieId, comment) => {
  try {
    const commentsRef = collection(db, 'comments');
    await addDoc(commentsRef, {
      userId,
      movieId,
      comment,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getMovieComments = async (movieId) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('movieId', '==', movieId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

// User lists functions
export const addToUserList = async (userId, listType, movieData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentList = userData[listType] || [];
      
      // Check if movie already exists in list
      const movieExists = currentList.some(movie => movie.id === movieData.id);
      
      if (!movieExists) {
        const updatedList = [...currentList, { ...movieData, addedAt: serverTimestamp() }];
        await updateDoc(userRef, {
          [listType]: updatedList
        });
      }
    }
  } catch (error) {
    console.error('Error adding to user list:', error);
    throw error;
  }
};

export const removeFromUserList = async (userId, listType, movieId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentList = userData[listType] || [];
      const updatedList = currentList.filter(movie => movie.id !== movieId);
      
      await updateDoc(userRef, {
        [listType]: updatedList
      });
    }
  } catch (error) {
    console.error('Error removing from user list:', error);
    throw error;
  }
};

export const getUserLists = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        favoriteMovies: userData.favoriteMovies || [],
        watchedMovies: userData.watchedMovies || [],
        ratings: userData.ratings || {}
      };
    }
    return { favoriteMovies: [], watchedMovies: [], ratings: {} };
  } catch (error) {
    console.error('Error getting user lists:', error);
    return { favoriteMovies: [], watchedMovies: [], ratings: {} };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
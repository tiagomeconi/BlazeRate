import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, upsertProfile } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        await upsertProfile(user);
        // Normalize Supabase user to match expected shape across components
        const normalized = {
          uid: user.id,
          id: user.id,
          email: user.email,
          displayName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0],
          photoURL:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
        };
        setCurrentUser(normalized);
        setUserProfile(normalized);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
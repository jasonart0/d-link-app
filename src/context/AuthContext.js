import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';
import authStorage from '../services/authStorage';

const AuthContext = createContext(null);

const localSession = {
  token: 'local-dashboard-session',
  user: {
    email: 'demo@d-line.local',
    name: 'Demo User',
  },
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await authStorage.getSession();

        if (!isMounted) {
          return;
        }

        if (session.token) {
          apiClient.setAuthToken(session.token);
          setToken(session.token);
          setUser(session.user);
        }
      } catch {
        await authStorage.clearSession();
        apiClient.clearAuthToken();
      } finally {
        if (isMounted) {
          setIsRestoring(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      await authStorage.saveSession(localSession);
      apiClient.setAuthToken(localSession.token);
      setToken(localSession.token);
      setUser(localSession.user);

      return localSession;
    } catch (sessionError) {
      setError('Unable to start local dashboard session.');
      throw sessionError;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await authStorage.clearSession();
    apiClient.clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isRestoring,
      isSigningIn,
      error,
      signIn,
      signOut,
      clearError,
    }),
    [clearError, error, isRestoring, isSigningIn, signIn, signOut, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

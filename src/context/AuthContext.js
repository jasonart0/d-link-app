import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/apiClient';
import authService from '../services/authService';
import authStorage from '../services/authStorage';

const AuthContext = createContext(null);

const getLoginErrorMessage = (error) =>
  error?.message || 'Unable to sign in. Check your connection and try again.';

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

  const signIn = useCallback(async ({ email, password }) => {
    setIsSigningIn(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      const nextToken = response?.token;

      if (!nextToken) {
        throw new Error('Login succeeded but no token was returned.');
      }

      await authStorage.saveSession({
        token: nextToken,
        user: response.user,
      });

      apiClient.setAuthToken(nextToken);
      setToken(nextToken);
      setUser(response.user ?? null);

      return response;
    } catch (loginError) {
      const message = getLoginErrorMessage(loginError);
      setError(message);
      throw loginError;
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

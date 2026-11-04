
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';

import {
  ApiError,
  setApiSessionToken,
} from '../api/client';

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  resendVerification as resendVerificationRequest,
  verifyEmail as verifyEmailRequest,
  type AuthResponse,
  type AuthUser,
} from '../api/auth';

const SESSION_KEY = 'lingoroots_session';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const token = await SecureStore.getItemAsync(SESSION_KEY);

        if (!token) return;

        setApiSessionToken(token);

        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        // Only discard a session when the server says it is invalid.
        // A temporary network failure should not destroy a valid token.
        if (error instanceof ApiError && error.status === 401) {
          await SecureStore.deleteItemAsync(SESSION_KEY);
          setApiSessionToken(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const saveSession = useCallback(async (response: AuthResponse) => {
    if (!response.sessionToken) {
      throw new Error(
        'The server did not return a session. Please try again.',
      );
    }

    await SecureStore.setItemAsync(SESSION_KEY, response.sessionToken);
    setApiSessionToken(response.sessionToken);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await registerRequest(name, email, password);
    },
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const response = await verifyEmailRequest(email, code);
      await saveSession(response);
    },
    [saveSession],
  );

  const resendVerification = useCallback(async (email: string) => {
    await resendVerificationRequest(email);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest(email, password);
      await saveSession(response);
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      setApiSessionToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        register,
        verifyEmail,
        resendVerification,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}

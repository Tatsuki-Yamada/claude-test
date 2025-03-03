import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth, Hub } from 'aws-amplify';

interface AuthContextProps {
  user: any;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  signOut: async () => {},
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初期ロード時のユーザー確認
    checkUser();

    // 認証イベントのリスナー設定
    const listener = (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          checkUser();
          break;
        case 'signOut':
          setUser(null);
          setIsAuthenticated(false);
          break;
      }
    };

    Hub.listen('auth', listener);
    return () => Hub.remove('auth', listener);
  }, []);

  async function checkUser() {
    try {
      setIsLoading(true);
      const userData = await Auth.currentAuthenticatedUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, signOut, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

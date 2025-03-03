import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Pages
import Dashboard from './pages/Dashboard';
import GameList from './pages/GameList';
import GameDetail from './pages/GameDetail';
import GameForm from './pages/GameForm';
import Layout from './components/Layout';

// Auth context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      await Auth.currentAuthenticatedUser();
      setIsAuthenticated(true);
      setIsAuthLoading(false);
    } catch (error) {
      setIsAuthenticated(false);
      setIsAuthLoading(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <Authenticator.Provider>
      <AuthProvider>
        {isAuthenticated ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/games" element={<GameList />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/games/new" element={<GameForm />} />
              <Route path="/games/:id/edit" element={<GameForm />} />
            </Routes>
          </Layout>
        ) : (
          <Authenticator>
            {({ signOut }) => (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/games" element={<GameList />} />
                  <Route path="/games/:id" element={<GameDetail />} />
                  <Route path="/games/new" element={<GameForm />} />
                  <Route path="/games/:id/edit" element={<GameForm />} />
                </Routes>
              </Layout>
            )}
          </Authenticator>
        )}
      </AuthProvider>
    </Authenticator.Provider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WheelEditor from './components/WheelEditor';
import SpinPage from './components/SpinPage';
import Analytics from './components/Analytics';
import Auth from './components/Auth';
import { User } from './types';
import { StorageService } from './services/storageService';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes (Login, Logout, Refresh)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (u: User) => {
    // With firebase listener, this is technically redundant but helps immediate UI feedback
    setUser(u);
  };

  const handleLogout = () => {
    StorageService.logout();
    // Listener will handle setUser(null)
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="text-indigo-600 text-xl font-semibold">Loading SpinToWin...</div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Public Route - Accessible without login */}
        <Route path="/spin/:id" element={
            <Layout user={user} onLogout={handleLogout}>
              <SpinPage />
            </Layout>
        } />
        
        {/* Protected Routes & Auth Handling */}
        <Route path="*" element={
            !user ? (
                <Auth onLogin={handleLogin} />
            ) : (
                <Layout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/new" element={<WheelEditor />} />
                    <Route path="/edit/:id" element={<WheelEditor />} />
                    <Route path="/analytics/:id" element={<Analytics />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
            )
        } />
      </Routes>
    </Router>
  );
};

export default App;
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = StorageService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
  };

  if (loading) return null; // Or a spinner

  return (
    <Router>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<WheelEditor />} />
            <Route path="/edit/:id" element={<WheelEditor />} />
            <Route path="/spin/:id" element={<SpinPage />} />
            <Route path="/analytics/:id" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App;
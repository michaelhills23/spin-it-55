import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { PieChart, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-600";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-indigo-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <PieChart className="h-8 w-8 text-indigo-300" />
                <span className="text-white text-xl font-bold tracking-tight">SpinToWin</span>
              </Link>
              {user && (
                <div className="hidden md:block ml-10 flex items-baseline space-x-4">
                  <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>
                    <LayoutDashboard className="inline-block w-4 h-4 mr-2"/>
                    Dashboard
                  </Link>
                  <Link to="/new" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/new')}`}>
                     <PlusCircle className="inline-block w-4 h-4 mr-2"/>
                    Create Wheel
                  </Link>
                </div>
              )}
            </div>
            <div>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-indigo-200 text-sm hidden sm:block">Hello, {user.name}</span>
                  <button
                    onClick={onLogout}
                    className="text-indigo-200 hover:text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <span className="text-indigo-200 text-sm">Guest Mode</span>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>&copy; 2024 SpinToWin. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
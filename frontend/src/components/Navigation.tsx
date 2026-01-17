import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import GoalSelectionModal from './GoalSelectionModal';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showGoalModal, setShowGoalModal] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
      <div className="px-8 py-4">
        <div className="max-w-dashboard mx-auto flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-7 h-7 bg-primary-500 rounded flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Streak</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => navigate('/dashboard')} 
                className={`font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/goals')} 
                className={`font-medium transition-colors ${
                  isActive('/goals') && !isActive('/goals/new')
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Streaks
              </button>
              <button 
                onClick={() => navigate('/posts')} 
                className={`font-medium transition-colors ${
                  isActive('/posts') && !isActive('/posts/new')
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Writing
              </button>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-600">Search goals...</span>
            </div>

            {/* New Post Button */}
            <button 
              onClick={() => setShowGoalModal(true)}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all flex items-center space-x-2 shadow-sm hover:shadow-md">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span className="hidden sm:inline">New Post</span>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/goals/new')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Create New Streak
                  </button>
                  <button
                    onClick={() => navigate('/goals')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    My Streaks
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Settings
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoalSelectionModal 
        isOpen={showGoalModal} 
        onClose={() => setShowGoalModal(false)} 
      />
    </header>
  );
}

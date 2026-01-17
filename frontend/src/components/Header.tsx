import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User, Menu, X } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => 
    `flex items-center h-full transition-colors text-base font-medium ${
      isActivePath(path) 
        ? 'text-[#10B981]' 
        : 'text-gray-600 hover:text-gray-900'
    }`;

  if (!user) {
    // Public/Unauthenticated Header
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Left Side: Logo + Nav */}
            <div className="flex items-center gap-4 sm:gap-8">
              <div
                onClick={() => navigate('/')}
                className="flex items-center gap-3 cursor-pointer h-10"
              >
                <img
                  src="/Hustlelog.png"
                  alt="Hustlelog"
                  className="h-8 sm:h-10 w-auto object-contain"
                />
                <span className="sr-only">Streak</span>
              </div>

            </div>

            {/* Desktop Navigation - centered */}
            <nav className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <button 
                onClick={() => navigate('/explore')} 
                className={navLinkClass('/explore')}
              >
                Explore
              </button>
            </nav>

            {/* CTA Button - Hidden on small screens */}
            <button 
              onClick={() => navigate('/login')} 
              className="hidden sm:block px-4 sm:px-6 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm font-medium"
            >
              Start your goal
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    navigate('/explore');
                    setShowMobileMenu(false);
                  }} 
                  className="text-left text-gray-600 hover:text-gray-900 font-medium"
                >
                  Explore
                </button>
                <button 
                  onClick={() => {
                    navigate('/login');
                    setShowMobileMenu(false);
                  }} 
                  className="w-full px-6 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm font-medium"
                >
                  Start your goal
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Authenticated Header
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left Side: Logo + Nav */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 cursor-pointer h-10"
            >
              <img
                src="/Hustlelog.png"
                alt="Hustlelog"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <span className="sr-only">Streak</span>
            </div>

          </div>

            {/* Desktop Navigation - centered */}
            <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <button 
                onClick={() => navigate('/dashboard')} 
                className={navLinkClass('/dashboard')}
              >
                My Dashboard
              </button>
              <button 
                onClick={() => navigate('/explore')} 
                className={navLinkClass('/explore')}
              >
                Explore
              </button>
              <button 
                onClick={() => navigate('/goals')} 
                className={navLinkClass('/goals')}
              >
                My Goals
              </button>
              <button 
                onClick={() => navigate('/my-posts')} 
                className={navLinkClass('/my-posts')}
              >
                My Posts
              </button>
            </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Start New Goal Button - Desktop */}
            <button 
              onClick={() => navigate('/goals/new')} 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-[#10B981] border-2 border-[#10B981] rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Start New Goal</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.username}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Signed in</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate(`/profile/${user.username}`);
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <User size={16} className="text-gray-500" />
                    My Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  navigate('/dashboard');
                  setShowMobileMenu(false);
                }} 
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                My Dashboard
              </button>
              <button 
                onClick={() => {
                  navigate('/explore');
                  setShowMobileMenu(false);
                }} 
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Explore
              </button>
              <button 
                onClick={() => {
                  navigate('/goals');
                  setShowMobileMenu(false);
                }} 
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                My Goals
              </button>
              <button 
                onClick={() => {
                  navigate('/my-posts');
                  setShowMobileMenu(false);
                }} 
                className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                My Posts
              </button>
              <button 
                onClick={() => {
                  navigate('/create-post');
                  setShowMobileMenu(false);
                }} 
                className="w-full px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm font-medium mt-2"
              >
                New Post
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

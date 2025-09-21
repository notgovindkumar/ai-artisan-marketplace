import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useVoice } from '../../contexts/VoiceContext';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  MicrophoneIcon,
  LanguageIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { Button } from '../UI/Button';
import LanguageSelector from '../UI/LanguageSelector';
import VoiceToggle from '../Voice/VoiceToggle';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const { isVoiceEnabled, toggleVoiceEnabled } = useVoice();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {t('app.name')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/catalog" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              {t('nav.catalog')}
            </Link>
            
            {isAuthenticated && user?.role === 'artisan' && (
              <Link 
                to="/artisan" 
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                {t('nav.artisan')}
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'buyer' && (
              <Link 
                to="/buyer" 
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                {t('nav.buyer')}
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Voice Toggle */}
            {isAuthenticated && (
              <VoiceToggle />
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Cart Icon */}
            {isAuthenticated && user?.role === 'buyer' && (
              <Link 
                to="/cart" 
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 relative"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {/* Cart count badge */}
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:block">{user?.name}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('nav.orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  {t('auth.login')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  {t('auth.register')}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/catalog" 
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.catalog')}
              </Link>
              
              {isAuthenticated && user?.role === 'artisan' && (
                <Link 
                  to="/artisan" 
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.artisan')}
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'buyer' && (
                <Link 
                  to="/buyer" 
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.buyer')}
                </Link>
              )}

              {isAuthenticated && (
                <>
                  <Link 
                    to="/profile" 
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link 
                    to="/orders" 
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.orders')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

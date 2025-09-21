import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import VoiceAssistant from '../Voice/VoiceAssistant';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      
      <Footer />
      
      {/* Voice Assistant - only show for authenticated users */}
      {isAuthenticated && <VoiceAssistant />}
    </div>
  );
};

export default Layout;

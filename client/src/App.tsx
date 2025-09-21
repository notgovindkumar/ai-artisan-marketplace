import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ArtisanDashboard from './pages/Artisan/Dashboard';
import ProductListing from './pages/Artisan/ProductListing';
import ProductCreate from './pages/Artisan/ProductCreate';
import ProductEdit from './pages/Artisan/ProductEdit';
import BuyerDashboard from './pages/Buyer/Dashboard';
import ProductCatalog from './pages/Buyer/ProductCatalog';
import ProductDetail from './pages/Buyer/ProductDetail';
import CartPage from './pages/Buyer/CartPage';
import CheckoutPage from './pages/Buyer/CheckoutPage';
import OrderHistory from './pages/OrderHistory';
import ProfilePage from './pages/ProfilePage';
import MarketIntelligence from './pages/Artisan/MarketIntelligence';
import VoiceAssistant from './pages/VoiceAssistant';
import NotFoundPage from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <VoiceProvider>
              <Router>
                <div className="App">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout><HomePage /></Layout>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/catalog" element={<Layout><ProductCatalog /></Layout>} />
                    <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                    <Route path="/artisan/:id" element={<Layout><ArtisanDashboard /></Layout>} />

                    {/* Protected Artisan Routes */}
                    <Route path="/artisan" element={
                      <ProtectedRoute allowedRoles={['artisan', 'admin']}>
                        <Layout><ArtisanDashboard /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/artisan/products" element={
                      <ProtectedRoute allowedRoles={['artisan', 'admin']}>
                        <Layout><ProductListing /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/artisan/products/create" element={
                      <ProtectedRoute allowedRoles={['artisan', 'admin']}>
                        <Layout><ProductCreate /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/artisan/products/:id/edit" element={
                      <ProtectedRoute allowedRoles={['artisan', 'admin']}>
                        <Layout><ProductEdit /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/artisan/market-intelligence" element={
                      <ProtectedRoute allowedRoles={['artisan', 'admin']}>
                        <Layout><MarketIntelligence /></Layout>
                      </ProtectedRoute>
                    } />

                    {/* Protected Buyer Routes */}
                    <Route path="/buyer" element={
                      <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                        <Layout><BuyerDashboard /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                      <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                        <Layout><CartPage /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                        <Layout><CheckoutPage /></Layout>
                      </ProtectedRoute>
                    } />

                    {/* Common Protected Routes */}
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Layout><OrderHistory /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Layout><ProfilePage /></Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/voice-assistant" element={
                      <ProtectedRoute>
                        <Layout><VoiceAssistant /></Layout>
                      </ProtectedRoute>
                    } />

                    {/* 404 Route */}
                    <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
                  </Routes>

                  {/* Global Toast Notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#10B981',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 5000,
                        iconTheme: {
                          primary: '#EF4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </VoiceProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

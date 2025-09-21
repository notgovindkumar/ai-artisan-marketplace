import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  SparklesIcon, 
  MicrophoneIcon, 
  GlobeAltIcon, 
  HeartIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/UI/Button';
import ProductCard from '../components/Product/ProductCard';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Listings',
      description: 'Create compelling product descriptions with AI assistance',
      color: 'text-purple-600'
    },
    {
      icon: MicrophoneIcon,
      title: 'Voice Assistant',
      description: 'Interact with the platform using your voice in 22+ languages',
      color: 'text-blue-600'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Reach',
      description: 'Connect with buyers worldwide while preserving local culture',
      color: 'text-green-600'
    },
    {
      icon: HeartIcon,
      title: 'Cultural Heritage',
      description: 'Preserve and share traditional craft stories and techniques',
      color: 'text-red-600'
    }
  ];

  const stats = [
    { number: '200M+', label: 'Artisans Supported' },
    { number: '22+', label: 'Languages Supported' },
    { number: '500+', label: 'Craft Categories' },
    { number: '50+', label: 'Countries Reached' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              {t('app.name')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              {t('app.tagline')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isAuthenticated ? (
                <>
                  {user?.role === 'artisan' && (
                    <Link to="/artisan">
                      <Button size="lg" className="flex items-center space-x-2">
                        <span>Go to Dashboard</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'buyer' && (
                    <Link to="/buyer">
                      <Button size="lg" className="flex items-center space-x-2">
                        <span>Start Shopping</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="primary" className="flex items-center space-x-2">
                      <span>Join as Artisan</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/catalog">
                    <Button size="lg" variant="outline" className="flex items-center space-x-2">
                      <span>Browse Products</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Empowering Artisans with AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with deep respect for traditional craftsmanship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to get started with our AI-powered marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign Up & Create Profile
              </h3>
              <p className="text-gray-600">
                Join as an artisan or buyer and create your detailed profile
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Listing Creation
              </h3>
              <p className="text-gray-600">
                Upload photos and use voice descriptions to create compelling listings
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect & Sell Globally
              </h3>
              <p className="text-gray-600">
                Reach customers worldwide while preserving your cultural heritage
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Transform Your Craft Business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of artisans who are already using AI to grow their businesses and preserve their cultural heritage
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {!isAuthenticated && (
              <>
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="flex items-center space-x-2">
                    <span>Start Your Journey</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/catalog">
                  <Button size="lg" variant="outline" className="flex items-center space-x-2 bg-white text-primary-600 hover:bg-gray-50">
                    <span>Explore Products</span>
                    <PlayIcon className="w-5 h-5" />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

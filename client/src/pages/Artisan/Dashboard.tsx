import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';

const ArtisanDashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('dashboard.welcome')}, Artisan!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.totalProducts')}
              </h3>
              <p className="text-3xl font-bold text-primary-600">0</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.totalOrders')}
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.totalSales')}
              </h3>
              <p className="text-3xl font-bold text-blue-600">₹0</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.rating')}
              </h3>
              <p className="text-3xl font-bold text-yellow-600">0.0</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="font-medium text-gray-900">Create Product</p>
                  <p className="text-sm text-gray-500">Add a new product listing</p>
                </div>
              </button>
              
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">🤖</div>
                  <p className="font-medium text-gray-900">AI Assistant</p>
                  <p className="text-sm text-gray-500">Get AI help with listings</p>
                </div>
              </button>
              
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-500">View your performance</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;

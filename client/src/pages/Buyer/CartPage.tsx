import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const CartPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">Shopping cart page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
